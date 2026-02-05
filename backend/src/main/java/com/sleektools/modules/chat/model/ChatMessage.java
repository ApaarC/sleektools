package com.sleektools.modules.chat.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Chat Message - not persisted, only exists in memory during room lifetime
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    
    public enum MessageType {
        MESSAGE,    // Regular user message
        JOIN,       // User joined notification
        LEAVE,      // User left notification
        SYSTEM      // System notification
    }
    
    private String id;
    private String roomId;
    private MessageType type;
    private String senderId;
    private String senderName;
    private String content;
    private Instant timestamp;
    
    /**
     * Create a user message
     */
    public static ChatMessage userMessage(String roomId, String senderId, String senderName, String content) {
        return ChatMessage.builder()
                .id(generateId())
                .roomId(roomId)
                .type(MessageType.MESSAGE)
                .senderId(senderId)
                .senderName(senderName)
                .content(content)
                .timestamp(Instant.now())
                .build();
    }
    
    /**
     * Create a join notification
     */
    public static ChatMessage joinMessage(String roomId, String userId, String userName) {
        return ChatMessage.builder()
                .id(generateId())
                .roomId(roomId)
                .type(MessageType.JOIN)
                .senderId(userId)
                .senderName(userName)
                .content(userName + " joined the room")
                .timestamp(Instant.now())
                .build();
    }
    
    /**
     * Create a leave notification
     */
    public static ChatMessage leaveMessage(String roomId, String userId, String userName) {
        return ChatMessage.builder()
                .id(generateId())
                .roomId(roomId)
                .type(MessageType.LEAVE)
                .senderId(userId)
                .senderName(userName)
                .content(userName + " left the room")
                .timestamp(Instant.now())
                .build();
    }
    
    /**
     * Create a system message
     */
    public static ChatMessage systemMessage(String roomId, String content) {
        return ChatMessage.builder()
                .id(generateId())
                .roomId(roomId)
                .type(MessageType.SYSTEM)
                .content(content)
                .timestamp(Instant.now())
                .build();
    }
    
    private static String generateId() {
        return String.valueOf(System.currentTimeMillis()) + "-" + 
               String.valueOf((int) (Math.random() * 10000));
    }
}
