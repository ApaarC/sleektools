package com.sleektools.modules.chat.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Chat Room entity - stored in memory
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    
    private String id;
    private String pin; // Optional PIN protection
    private Instant createdAt;
    private Instant expiresAt;
    
    @Builder.Default
    private Set<String> participantIds = ConcurrentHashMap.newKeySet();
    
    /**
     * Check if the room has expired
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
    
    /**
     * Check if PIN is required
     */
    public boolean requiresPin() {
        return pin != null && !pin.isEmpty();
    }
    
    /**
     * Validate PIN
     */
    public boolean validatePin(String inputPin) {
        if (!requiresPin()) {
            return true;
        }
        return pin.equals(inputPin);
    }
    
    /**
     * Add a participant
     */
    public void addParticipant(String participantId) {
        participantIds.add(participantId);
    }
    
    /**
     * Remove a participant
     */
    public void removeParticipant(String participantId) {
        participantIds.remove(participantId);
    }
    
    /**
     * Get participant count
     */
    public int getParticipantCount() {
        return participantIds.size();
    }
}
