package com.sleektools.modules.chat.controller;

import com.sleektools.modules.chat.dto.CreateRoomRequest;
import com.sleektools.modules.chat.dto.JoinRoomRequest;
import com.sleektools.modules.chat.dto.RoomResponse;
import com.sleektools.modules.chat.model.ChatRoom;
import com.sleektools.modules.chat.model.Participant;
import com.sleektools.modules.chat.service.RoomService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API controller for chat room operations
 */
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    /**
     * Create a new chat room
     */
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get room info by ID
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String roomId) {
        return roomService.getRoom(roomId)
                .map(room -> ResponseEntity.ok(RoomResponse.builder()
                        .id(room.getId())
                        .requiresPin(room.requiresPin())
                        .createdAt(room.getCreatedAt())
                        .expiresAt(room.getExpiresAt())
                        .participantCount(room.getParticipantCount())
                        .shareUrl("/r/" + room.getId())
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Check if a room exists
     */
    @GetMapping("/{roomId}/exists")
    public ResponseEntity<Map<String, Object>> checkRoom(@PathVariable String roomId) {
        boolean exists = roomService.roomExists(roomId);
        boolean requiresPin = roomService.getRoom(roomId)
                .map(ChatRoom::requiresPin)
                .orElse(false);

        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("requiresPin", requiresPin);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate room PIN
     */
    @PostMapping("/{roomId}/validate-pin")
    public ResponseEntity<Map<String, Boolean>> validatePin(
            @PathVariable String roomId,
            @RequestBody Map<String, String> body) {
        
        String pin = body.get("pin");
        boolean valid = roomService.validatePin(roomId, pin);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", valid);
        return ResponseEntity.ok(response);
    }

    /**
     * Get participants in a room
     */
    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<Participant>> getParticipants(@PathVariable String roomId) {
        if (!roomService.roomExists(roomId)) {
            return ResponseEntity.notFound().build();
        }
        
        List<Participant> participants = roomService.getParticipants(roomId);
        return ResponseEntity.ok(participants);
    }

    /**
     * Get server statistics (for monitoring)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(roomService.getStats());
    }
}
