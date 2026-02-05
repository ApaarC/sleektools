package com.sleektools.modules.chat.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Participant in a chat room
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Participant {
    
    private String id;
    private String name;
    private String roomId;
    private boolean isCreator;
    
    /**
     * Create a new participant
     */
    public static Participant create(String name, String roomId, boolean isCreator) {
        return Participant.builder()
                .id(generateId())
                .name(name)
                .roomId(roomId)
                .isCreator(isCreator)
                .build();
    }
    
    private static String generateId() {
        return "user-" + System.currentTimeMillis() + "-" + 
               (int) (Math.random() * 10000);
    }
}
