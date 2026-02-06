package com.sleektools.modules.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sleektools.modules.chat.dto.WebSocketMessage;
import com.sleektools.modules.chat.model.Participant;
import com.sleektools.modules.chat.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * WebSocket handler for chat functionality
 */
@Slf4j
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final RoomService roomService;
    private final ObjectMapper objectMapper;

    // Map of roomId -> list of sessions
    private final Map<String, List<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    
    // Map of sessionId -> participant info
    private final Map<String, SessionInfo> sessionInfoMap = new ConcurrentHashMap<>();

    @Value("${chat.message.max-length:2000}")
    private int maxMessageLength;

    public ChatWebSocketHandler(RoomService roomService, ObjectMapper objectMapper) {
        this.roomService = roomService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = extractRoomId(session);
        log.info("WebSocket connection attempt for room: {}", roomId);
        
        if (roomId == null) {
            session.close(CloseStatus.BAD_DATA.withReason("Room ID required"));
            return;
        }

        // Check if room exists
        log.info("Checking if room exists: {}", roomId);
        if (!roomService.roomExists(roomId)) {
            log.warn("Room not found: {}", roomId);
            sendMessage(session, WebSocketMessage.error("Room does not exist or has expired"));
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Room not found"));
            return;
        }

        // Store session info (name and PIN will be sent in first message)
        roomSessions.computeIfAbsent(roomId, k -> new CopyOnWriteArrayList<>()).add(session);
        sessionInfoMap.put(session.getId(), new SessionInfo(roomId, null));

        log.info("WebSocket connection established for room: {}", roomId);
        
        // Send welcome message
        sendMessage(session, WebSocketMessage.system(
                "Connected to room " + roomId + ". Send your name to join."
        ));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        SessionInfo info = sessionInfoMap.get(session.getId());
        
        if (info == null) {
            return;
        }

        try {
            WebSocketMessage wsMessage = objectMapper.readValue(payload, WebSocketMessage.class);
            
            // Handle join message (first message should contain user's name)
            if (info.participant == null) {
                handleJoinRequest(session, info, wsMessage);
                return;
            }

            // Handle regular message
            if (wsMessage.getType() == WebSocketMessage.Type.MESSAGE) {
                handleChatMessage(session, info, wsMessage);
            }
        } catch (Exception e) {
            log.error("Error handling message: {}", e.getMessage());
            sendMessage(session, WebSocketMessage.error("Failed to process message"));
        }
    }

    /**
     * Handle user join request
     */
    private void handleJoinRequest(WebSocketSession session, SessionInfo info, WebSocketMessage message) throws IOException {
        String name = message.getSenderName();
        String pin = message.getContent(); // PIN can be sent in content field

        if (name == null || name.trim().isEmpty()) {
            sendMessage(session, WebSocketMessage.error("Name is required to join"));
            return;
        }

        // Validate PIN if required
        if (!roomService.validatePin(info.roomId, pin)) {
            sendMessage(session, WebSocketMessage.error("Invalid PIN"));
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid PIN"));
            return;
        }

        // Add participant
        Participant participant = roomService.addParticipant(info.roomId, name.trim(), false)
                .orElse(null);
        
        if (participant == null) {
            sendMessage(session, WebSocketMessage.error("Room is full"));
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Room full"));
            return;
        }

        info.participant = participant;

        // Send join confirmation
        sendMessage(session, WebSocketMessage.system("Welcome, " + participant.getName() + "!"));

        // Broadcast join notification
        broadcastToRoom(info.roomId, WebSocketMessage.join(participant.getId(), participant.getName()), session);

        // Send participants list
        List<Participant> participants = roomService.getParticipants(info.roomId);
        broadcastToRoom(info.roomId, WebSocketMessage.participants(participants), null);

        log.info("User {} joined room {}", participant.getName(), info.roomId);
    }

    /**
     * Handle chat message
     */
    private void handleChatMessage(WebSocketSession session, SessionInfo info, WebSocketMessage message) throws IOException {
        String content = message.getContent();
        
        if (content == null || content.trim().isEmpty()) {
            return;
        }

        // Trim message if too long
        if (content.length() > maxMessageLength) {
            content = content.substring(0, maxMessageLength);
        }

        // Broadcast message to all room participants
        WebSocketMessage chatMessage = WebSocketMessage.message(
                info.participant.getId(),
                info.participant.getName(),
                content.trim()
        );

        broadcastToRoom(info.roomId, chatMessage, null);
        
        log.debug("Message in room {}: {} - {}", info.roomId, info.participant.getName(), content);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        SessionInfo info = sessionInfoMap.remove(session.getId());
        
        if (info != null) {
            List<WebSocketSession> sessions = roomSessions.get(info.roomId);
            if (sessions != null) {
                sessions.remove(session);
                
                // Clean up empty room session lists
                if (sessions.isEmpty()) {
                    roomSessions.remove(info.roomId);
                }
            }

            // Remove participant and broadcast leave notification
            if (info.participant != null) {
                roomService.removeParticipant(info.roomId, info.participant.getId());
                
                // Broadcast leave notification
                broadcastToRoom(info.roomId, 
                        WebSocketMessage.leave(info.participant.getId(), info.participant.getName()), 
                        null);

                // Update participants list
                List<Participant> participants = roomService.getParticipants(info.roomId);
                broadcastToRoom(info.roomId, WebSocketMessage.participants(participants), null);

                log.info("User {} left room {}", info.participant.getName(), info.roomId);
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket transport error: {}", exception.getMessage());
        session.close(CloseStatus.SERVER_ERROR);
    }

    /**
     * Broadcast message to all participants in a room
     */
    private void broadcastToRoom(String roomId, WebSocketMessage message, WebSocketSession exclude) {
        List<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions == null) return;

        String json;
        try {
            json = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.error("Failed to serialize message", e);
            return;
        }

        TextMessage textMessage = new TextMessage(json);

        for (WebSocketSession session : sessions) {
            if (session.isOpen() && (exclude == null || !session.getId().equals(exclude.getId()))) {
                try {
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    log.error("Failed to send message to session {}", session.getId(), e);
                }
            }
        }
    }

    /**
     * Send message to a specific session
     */
    private void sendMessage(WebSocketSession session, WebSocketMessage message) throws IOException {
        if (session.isOpen()) {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
        }
    }

    /**
     * Extract room ID from WebSocket URI
     */
    private String extractRoomId(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return null;

        String path = uri.getPath();
        String[] parts = path.split("/");
        
        // Path format: /ws/chat/{roomId}
        if (parts.length >= 4) {
            return parts[3].toUpperCase();
        }
        return null;
    }

    /**
     * Session info holder
     */
    private static class SessionInfo {
        String roomId;
        Participant participant;

        SessionInfo(String roomId, Participant participant) {
            this.roomId = roomId;
            this.participant = participant;
        }
    }
}
