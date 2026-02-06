package com.sleektools.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sleektools.service.CanvasService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CanvasWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CanvasService canvasService;
    
    // Map of canvas token -> Set of sessions
    private final Map<String, Set<WebSocketSession>> canvasSessions = new ConcurrentHashMap<>();
    
    // Map of session ID -> canvas token
    private final Map<String, String> sessionToCanvas = new ConcurrentHashMap<>();

    public CanvasWebSocketHandler(CanvasService canvasService) {
        this.canvasService = canvasService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String token = extractToken(session);
        
        if (token == null || token.isEmpty()) {
            System.out.println("[CanvasWS] No token provided, closing connection");
            session.close(CloseStatus.BAD_DATA.withReason("No canvas token provided"));
            return;
        }

        // Check if canvas exists
        if (!canvasService.canvasExists(token)) {
            System.out.println("[CanvasWS] Canvas not found: " + token);
            session.close(CloseStatus.BAD_DATA.withReason("Canvas not found"));
            return;
        }

        // Add session to canvas room
        canvasSessions.computeIfAbsent(token, k -> ConcurrentHashMap.newKeySet()).add(session);
        sessionToCanvas.put(session.getId(), token);
        
        // Assign Pokemon name and color to user
        String userName = canvasService.assignUserName(session.getId());
        String userColor = canvasService.getUserColor(session.getId());
        
        // Add participant to canvas
        canvasService.addParticipant(token, session.getId());

        System.out.println("[CanvasWS] User '" + userName + "' connected to canvas " + token + " | Session: " + session.getId());
        
        // Send the user their assigned name and color
        sendMessage(session, createUserInfoMessage(session.getId(), userName, userColor));
        
        // Notify existing participants that someone joined
        broadcastToCanvas(token, createMessage("USER_JOINED", createUserJoinData(session.getId(), userName, userColor)), session);
        
        // Send participant list to all
        broadcastParticipants(token);
        
        // If there are other participants, ask them to sync
        Set<WebSocketSession> sessions = canvasSessions.get(token);
        if (sessions != null && sessions.size() > 1) {
            // Ask the first non-new session to send canvas state
            for (WebSocketSession s : sessions) {
                if (!s.getId().equals(session.getId()) && s.isOpen()) {
                    sendMessage(s, createMessage("JOIN", createJoinData(session.getId(), true)));
                    break;
                }
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String token = sessionToCanvas.get(session.getId());
        if (token == null) {
            System.out.println("[CanvasWS] Session not associated with any canvas");
            return;
        }

        try {
            JsonNode json = objectMapper.readTree(message.getPayload());
            String type = json.has("type") ? json.get("type").asText() : "";

            switch (type) {
                case "DRAW":
                    // Broadcast drawing data to all other participants
                    handleDraw(session, token, json);
                    break;
                    
                case "CLEAR":
                    // Broadcast clear command
                    handleClear(session, token);
                    break;
                
                case "CURSOR":
                    // Broadcast cursor position to all other participants
                    handleCursor(session, token, json);
                    break;
                case "SYNC_REQUEST":
                    // New user requesting canvas sync
                    handleSyncRequest(session, token);
                    break;
                    
                case "SYNC":
                    // User responding with canvas data
                    handleSync(session, token, json);
                    break;
                    
                default:
                    System.out.println("[CanvasWS] Unknown message type: " + type);
            }
            
        } catch (Exception e) {
            System.out.println("[CanvasWS] Error processing message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String token = sessionToCanvas.remove(session.getId());
        String userName = canvasService.getUserName(session.getId());
        
        if (token != null) {
            Set<WebSocketSession> sessions = canvasSessions.get(token);
            if (sessions != null) {
                sessions.remove(session);
                
                // Clean up empty canvas sessions
                if (sessions.isEmpty()) {
                    canvasSessions.remove(token);
                }
            }
            
            canvasService.removeParticipant(token, session.getId());
            
            // Notify others that user left
            broadcastToCanvas(token, createMessage("USER_LEFT", createUserLeftData(session.getId(), userName)), null);
            
            System.out.println("[CanvasWS] User '" + userName + "' disconnected from canvas " + token);
            
            // Clean up user name mapping
            canvasService.removeUserName(session.getId());
            
            // Broadcast updated participant list
            broadcastParticipants(token);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.out.println("[CanvasWS] Transport error for session " + session.getId() + ": " + exception.getMessage());
        session.close(CloseStatus.SERVER_ERROR);
    }
    
    private void handleCursor(WebSocketSession sender, String token, JsonNode json) {
        // Broadcast cursor position to all except sender
        if (json.has("data")) {
            String userName = canvasService.getUserName(sender.getId());
            String userColor = canvasService.getUserColor(sender.getId());
            
            ObjectNode message = objectMapper.createObjectNode();
            message.put("type", "CURSOR");
            ObjectNode data = objectMapper.createObjectNode();
            data.put("odentityId", sender.getId());
            data.put("userName", userName);
            data.put("userColor", userColor);
            data.put("x", json.get("data").get("x").asDouble());
            data.put("y", json.get("data").get("y").asDouble());
            message.set("data", data);
            
            broadcastToCanvas(token, message.toString(), sender);
        }
    }

    private void handleDraw(WebSocketSession sender, String token, JsonNode json) {
        // Broadcast draw data to all except sender
        if (json.has("data")) {
            ObjectNode message = objectMapper.createObjectNode();
            message.put("type", "DRAW");
            message.set("data", json.get("data"));
            broadcastToCanvas(token, message.toString(), sender);
        }
    }

    private void handleClear(WebSocketSession sender, String token) {
        // Broadcast clear to all except sender
        broadcastToCanvas(token, createMessage("CLEAR", null), sender);
    }

    private void handleSyncRequest(WebSocketSession requester, String token) {
        // Find another session to provide canvas state
        Set<WebSocketSession> sessions = canvasSessions.get(token);
        if (sessions != null) {
            for (WebSocketSession s : sessions) {
                if (!s.getId().equals(requester.getId()) && s.isOpen()) {
                    // Ask this session to send sync data
                    sendMessage(s, createMessage("JOIN", createJoinData(requester.getId(), true)));
                    return;
                }
            }
        }
        
        // No other sessions, check if we have stored canvas data
        String canvasData = canvasService.getCanvasData(token);
        if (canvasData != null && !canvasData.isEmpty()) {
            sendMessage(requester, createMessage("SYNC", canvasData));
        }
    }

    private void handleSync(WebSocketSession sender, String token, JsonNode json) {
        // Store canvas data and broadcast to new users
        if (json.has("data")) {
            String canvasData = json.get("data").asText();
            canvasService.updateCanvasData(token, canvasData);
            
            // Send to all sessions that might need it (except sender)
            Set<WebSocketSession> sessions = canvasSessions.get(token);
            if (sessions != null) {
                for (WebSocketSession s : sessions) {
                    if (!s.getId().equals(sender.getId()) && s.isOpen()) {
                        // Check if this session joined recently (simplified: just send to all)
                        sendMessage(s, createMessage("SYNC", canvasData));
                    }
                }
            }
        }
    }

    private void broadcastParticipants(String token) {
        List<String> participants = canvasService.getParticipants(token);
        System.out.println("[CanvasWS] Broadcasting participant count: " + participants.size() + " for canvas " + token);
        String message = createMessage("PARTICIPANTS", participants);
        broadcastToCanvas(token, message, null);
    }

    private void broadcastToCanvas(String token, String message, WebSocketSession exclude) {
        Set<WebSocketSession> sessions = canvasSessions.get(token);
        if (sessions != null) {
            for (WebSocketSession session : sessions) {
                if (session.isOpen() && (exclude == null || !session.getId().equals(exclude.getId()))) {
                    sendMessage(session, message);
                }
            }
        }
    }

    private void sendMessage(WebSocketSession session, String message) {
        try {
            if (session.isOpen()) {
                synchronized (session) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch (IOException e) {
            System.out.println("[CanvasWS] Error sending message: " + e.getMessage());
        }
    }

    private Map<String, Object> createJoinData(String participantId, boolean sendToNew) {
        Map<String, Object> data = new HashMap<>();
        data.put("participantId", participantId);
        data.put("sendToNew", sendToNew);
        return data;
    }
    
    private Map<String, Object> createUserJoinData(String odentityId, String userName, String userColor) {
        Map<String, Object> data = new HashMap<>();
        data.put("odentityId", odentityId);
        data.put("userName", userName);
        data.put("userColor", userColor);
        return data;
    }
    
    private Map<String, Object> createUserLeftData(String odentityId, String userName) {
        Map<String, Object> data = new HashMap<>();
        data.put("odentityId", odentityId);
        data.put("userName", userName);
        return data;
    }
    
    private String createUserInfoMessage(String odentityId, String userName, String userColor) {
        try {
            ObjectNode message = objectMapper.createObjectNode();
            message.put("type", "USER_INFO");
            ObjectNode data = objectMapper.createObjectNode();
            data.put("odentityId", odentityId);
            data.put("userName", userName);
            data.put("userColor", userColor);
            message.set("data", data);
            return objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            return "{\"type\":\"ERROR\",\"content\":\"Failed to create user info\"}";
        }
    }

    private String createMessage(String type, Object data) {
        try {
            ObjectNode message = objectMapper.createObjectNode();
            message.put("type", type);
            if (data != null) {
                if (data instanceof String) {
                    message.put("data", (String) data);
                } else {
                    message.set("data", objectMapper.valueToTree(data));
                }
            }
            return objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            return "{\"type\":\"ERROR\",\"content\":\"Failed to create message\"}";
        }
    }

    private String extractToken(WebSocketSession session) {
        String path = session.getUri().getPath();
        // Path format: /ws/canvas/{token}
        String[] parts = path.split("/");
        if (parts.length >= 4) {
            return parts[3];
        }
        return null;
    }
}
