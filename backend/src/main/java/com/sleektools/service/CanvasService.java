package com.sleektools.service;

import com.sleektools.model.CanvasRoom;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class CanvasService {
    
    private static final String TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int TOKEN_LENGTH = 24;
    private static final int MAX_CANVAS_HOURS = 24;
    private static final SecureRandom random = new SecureRandom();
    
    private final Map<String, CanvasRoom> canvasRooms = new ConcurrentHashMap<>();
    
    /**
     * Generate a unique URL-safe token for the canvas
     */
    public String generateToken() {
        StringBuilder token = new StringBuilder(TOKEN_LENGTH);
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            token.append(TOKEN_CHARS.charAt(random.nextInt(TOKEN_CHARS.length())));
        }
        return token.toString();
    }
    
    /**
     * Create a new canvas room with a unique token
     */
    public CanvasRoom createCanvas() {
        // Clean up expired canvases first
        cleanupExpiredCanvases();
        
        String token;
        do {
            token = generateToken();
        } while (canvasRooms.containsKey(token));
        
        CanvasRoom canvas = new CanvasRoom(token);
        canvasRooms.put(token, canvas);
        
        System.out.println("[CanvasService] Created canvas with token: " + token);
        return canvas;
    }
    
    /**
     * Get a canvas room by token
     */
    public CanvasRoom getCanvas(String token) {
        CanvasRoom canvas = canvasRooms.get(token);
        if (canvas != null && canvas.isExpired(MAX_CANVAS_HOURS)) {
            canvasRooms.remove(token);
            return null;
        }
        return canvas;
    }
    
    /**
     * Check if a canvas exists and is not expired
     */
    public boolean canvasExists(String token) {
        return getCanvas(token) != null;
    }
    
    /**
     * Add a participant to a canvas
     */
    public boolean addParticipant(String token, String participantId) {
        CanvasRoom canvas = getCanvas(token);
        if (canvas != null) {
            canvas.addParticipant(participantId);
            System.out.println("[CanvasService] Added participant " + participantId + " to canvas " + token);
            return true;
        }
        return false;
    }
    
    /**
     * Remove a participant from a canvas
     */
    public void removeParticipant(String token, String participantId) {
        CanvasRoom canvas = getCanvas(token);
        if (canvas != null) {
            canvas.removeParticipant(participantId);
            System.out.println("[CanvasService] Removed participant " + participantId + " from canvas " + token);
            
            // Optionally: delete canvas if empty for a while
            // For now, we keep it alive until expiration
        }
    }
    
    /**
     * Get all participants in a canvas
     */
    public List<String> getParticipants(String token) {
        CanvasRoom canvas = getCanvas(token);
        if (canvas != null) {
            return new ArrayList<>(canvas.getParticipantIds());
        }
        return Collections.emptyList();
    }
    
    /**
     * Update canvas data (base64 encoded image)
     */
    public boolean updateCanvasData(String token, String canvasData) {
        CanvasRoom canvas = getCanvas(token);
        if (canvas != null) {
            canvas.setCanvasData(canvasData);
            canvas.updateActivity();
            return true;
        }
        return false;
    }
    
    /**
     * Get canvas data
     */
    public String getCanvasData(String token) {
        CanvasRoom canvas = getCanvas(token);
        return canvas != null ? canvas.getCanvasData() : null;
    }
    
    /**
     * Delete a canvas
     */
    public boolean deleteCanvas(String token) {
        return canvasRooms.remove(token) != null;
    }
    
    /**
     * Clean up expired canvases
     */
    private void cleanupExpiredCanvases() {
        List<String> expired = canvasRooms.entrySet().stream()
                .filter(e -> e.getValue().isExpired(MAX_CANVAS_HOURS))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        for (String token : expired) {
            canvasRooms.remove(token);
            System.out.println("[CanvasService] Cleaned up expired canvas: " + token);
        }
    }
    
    /**
     * Get active canvas count (for monitoring)
     */
    public int getActiveCanvasCount() {
        cleanupExpiredCanvases();
        return canvasRooms.size();
    }
}
