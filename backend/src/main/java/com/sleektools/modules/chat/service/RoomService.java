package com.sleektools.modules.chat.service;

import com.sleektools.modules.chat.dto.CreateRoomRequest;
import com.sleektools.modules.chat.dto.RoomResponse;
import com.sleektools.modules.chat.model.ChatRoom;
import com.sleektools.modules.chat.model.Participant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing chat rooms
 */
@Slf4j
@Service
public class RoomService {

    private static final String ROOM_ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom random = new SecureRandom();

    // In-memory storage
    private final Map<String, ChatRoom> rooms = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Participant>> roomParticipants = new ConcurrentHashMap<>();

    @Value("${chat.room.max-duration-hours:6}")
    private int maxDurationHours;

    @Value("${chat.room.max-participants:50}")
    private int maxParticipants;

    @Value("${chat.room.id-length:6}")
    private int roomIdLength;

    /**
     * Create a new chat room
     */
    public RoomResponse createRoom(CreateRoomRequest request) {
        String roomId = generateRoomId();
        
        // Ensure unique ID
        while (rooms.containsKey(roomId)) {
            roomId = generateRoomId();
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plus(maxDurationHours, ChronoUnit.HOURS);
        
        String pinFromRequest = request.getPin();
        log.info("Creating room with PIN from request: '{}' (length: {})", pinFromRequest, pinFromRequest != null ? pinFromRequest.length() : -1);

        ChatRoom room = ChatRoom.builder()
                .id(roomId)
                .pin(pinFromRequest)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        rooms.put(roomId, room);
        roomParticipants.put(roomId, new ConcurrentHashMap<>());

        log.info("Created room: {} (expires at {}) with PIN: {}", roomId, expiresAt, room.requiresPin() ? "(protected)" : "(none)");
        log.info("All rooms now: {}", rooms.keySet());

        return RoomResponse.builder()
                .id(roomId)
                .requiresPin(room.requiresPin())
                .createdAt(now)
                .expiresAt(expiresAt)
                .participantCount(0)
                .shareUrl("/r/" + roomId)
                .build();
    }

    /**
     * Get room by ID
     */
    public Optional<ChatRoom> getRoom(String roomId) {
        ChatRoom room = rooms.get(roomId.toUpperCase());
        if (room != null && room.isExpired()) {
            deleteRoom(roomId);
            return Optional.empty();
        }
        return Optional.ofNullable(room);
    }

    /**
     * Check if room exists
     */
    public boolean roomExists(String roomId) {
        return getRoom(roomId).isPresent();
    }

    /**
     * Validate room PIN
     */
    public boolean validatePin(String roomId, String pin) {
        log.info("Validating PIN for room: {}, pin provided: '{}' (length: {})", roomId, pin, pin != null ? pin.length() : -1);
        Optional<ChatRoom> roomOpt = getRoom(roomId);
        if (!roomOpt.isPresent()) {
            log.warn("Room not found for PIN validation: {}", roomId);
            log.info("Available rooms: {}", rooms.keySet());
            return false;
        }
        ChatRoom room = roomOpt.get();
        String storedPin = room.getPin();
        log.info("Room found. requiresPin: {}, stored pin: '{}' (length: {})", room.requiresPin(), storedPin, storedPin != null ? storedPin.length() : -1);
        boolean valid = room.validatePin(pin);
        log.info("PIN validation result: {}", valid);
        return valid;
    }

    /**
     * Add participant to room
     */
    public Optional<Participant> addParticipant(String roomId, String name, boolean isCreator) {
        return getRoom(roomId).map(room -> {
            Map<String, Participant> participants = roomParticipants.get(roomId.toUpperCase());
            
            if (participants.size() >= maxParticipants) {
                log.warn("Room {} is full", roomId);
                return null;
            }

            Participant participant = Participant.create(name, roomId, isCreator);
            participants.put(participant.getId(), participant);
            room.addParticipant(participant.getId());

            log.info("Participant {} joined room {}", participant.getName(), roomId);
            return participant;
        });
    }

    /**
     * Remove participant from room
     */
    public void removeParticipant(String roomId, String participantId) {
        ChatRoom room = rooms.get(roomId.toUpperCase());
        if (room != null) {
            room.removeParticipant(participantId);
            Map<String, Participant> participants = roomParticipants.get(roomId.toUpperCase());
            if (participants != null) {
                Participant removed = participants.remove(participantId);
                if (removed != null) {
                    log.info("Participant {} left room {}", removed.getName(), roomId);
                }
            }
        }
    }

    /**
     * Get all participants in a room
     */
    public List<Participant> getParticipants(String roomId) {
        Map<String, Participant> participants = roomParticipants.get(roomId.toUpperCase());
        return participants != null 
                ? new ArrayList<>(participants.values()) 
                : Collections.emptyList();
    }

    /**
     * Get participant by ID
     */
    public Optional<Participant> getParticipant(String roomId, String participantId) {
        Map<String, Participant> participants = roomParticipants.get(roomId.toUpperCase());
        return participants != null 
                ? Optional.ofNullable(participants.get(participantId))
                : Optional.empty();
    }

    /**
     * Delete a room
     */
    public void deleteRoom(String roomId) {
        rooms.remove(roomId.toUpperCase());
        roomParticipants.remove(roomId.toUpperCase());
        log.info("Deleted room: {}", roomId);
    }

    /**
     * Clean up expired rooms
     */
    public int cleanupExpiredRooms() {
        int count = 0;
        Iterator<Map.Entry<String, ChatRoom>> iterator = rooms.entrySet().iterator();
        
        while (iterator.hasNext()) {
            Map.Entry<String, ChatRoom> entry = iterator.next();
            if (entry.getValue().isExpired()) {
                iterator.remove();
                roomParticipants.remove(entry.getKey());
                count++;
                log.info("Cleaned up expired room: {}", entry.getKey());
            }
        }
        
        return count;
    }

    /**
     * Get room statistics
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRooms", rooms.size());
        stats.put("totalParticipants", roomParticipants.values().stream()
                .mapToInt(Map::size)
                .sum());
        return stats;
    }

    /**
     * Generate a unique room ID
     */
    private String generateRoomId() {
        StringBuilder sb = new StringBuilder(roomIdLength);
        for (int i = 0; i < roomIdLength; i++) {
            sb.append(ROOM_ID_CHARS.charAt(random.nextInt(ROOM_ID_CHARS.length())));
        }
        return sb.toString();
    }
}
