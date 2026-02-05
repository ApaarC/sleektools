package com.sleektools.modules.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * WebSocket message wrapper for chat communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    
    public enum Type {
        MESSAGE,        // Chat message
        JOIN,           // User joined
        LEAVE,          // User left
        PARTICIPANTS,   // Participants list update
        ERROR,          // Error message
        SYSTEM          // System notification
    }
    
    private Type type;
    private String senderId;
    private String senderName;
    private String content;
    private Object data; // Additional data (e.g., participants list)
    private long timestamp;
    
    /**
     * Create a message payload
     */
    public static WebSocketMessage message(String senderId, String senderName, String content) {
        return WebSocketMessage.builder()
                .type(Type.MESSAGE)
                .senderId(senderId)
                .senderName(senderName)
                .content(content)
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Create a join notification
     */
    public static WebSocketMessage join(String userId, String userName) {
        return WebSocketMessage.builder()
                .type(Type.JOIN)
                .senderId(userId)
                .senderName(userName)
                .content(userName + " joined the room")
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Create a leave notification
     */
    public static WebSocketMessage leave(String userId, String userName) {
        return WebSocketMessage.builder()
                .type(Type.LEAVE)
                .senderId(userId)
                .senderName(userName)
                .content(userName + " left the room")
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Create a participants update
     */
    public static WebSocketMessage participants(Object participantsList) {
        return WebSocketMessage.builder()
                .type(Type.PARTICIPANTS)
                .data(participantsList)
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Create an error message
     */
    public static WebSocketMessage error(String message) {
        return WebSocketMessage.builder()
                .type(Type.ERROR)
                .content(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Create a system message
     */
    public static WebSocketMessage system(String message) {
        return WebSocketMessage.builder()
                .type(Type.SYSTEM)
                .content(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
