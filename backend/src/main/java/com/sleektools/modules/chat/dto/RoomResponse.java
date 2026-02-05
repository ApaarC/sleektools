package com.sleektools.modules.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response after creating a room
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    
    private String id;
    private boolean requiresPin;
    private Instant createdAt;
    private Instant expiresAt;
    private int participantCount;
    private String shareUrl;
}
