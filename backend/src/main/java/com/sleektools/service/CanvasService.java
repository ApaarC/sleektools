package com.sleektools.service;

import com.sleektools.model.CanvasRoom;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class CanvasService {
    
    private static final int MAX_CANVAS_HOURS = 24;
    private static final SecureRandom random = new SecureRandom();
    
    // Pokemon names for anonymous users
    private static final String[] POKEMON_NAMES = {
        "Pikachu", "Charizard", "Bulbasaur", "Squirtle", "Jigglypuff",
        "Meowth", "Psyduck", "Snorlax", "Eevee", "Gengar",
        "Dragonite", "Mewtwo", "Mew", "Togepi", "Pichu",
        "Lugia", "Ho-Oh", "Celebi", "Treecko", "Torchic",
        "Mudkip", "Gardevoir", "Rayquaza", "Lucario", "Garchomp",
        "Piplup", "Dialga", "Palkia", "Giratina", "Arceus",
        "Oshawott", "Zoroark", "Reshiram", "Zekrom", "Kyurem",
        "Fennekin", "Greninja", "Sylveon", "Xerneas", "Yveltal",
        "Rowlet", "Mimikyu", "Lunala", "Solgaleo", "Necrozma",
        "Scorbunny", "Sobble", "Grookey", "Zacian", "Zamazenta"
    };
    
    // Color palette for user cursors
    private static final String[] USER_COLORS = {
        "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
        "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
    };
    
    private final Map<String, CanvasRoom> canvasRooms = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToName = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToColor = new ConcurrentHashMap<>();
    
    /**
     * Generate a unique UUID-based token for the canvas (impossible to guess)
     */
    public String generateToken() {
        // Use UUID for maximum uniqueness and security
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * Generate a random Pokemon name for an anonymous user
     */
    public String generatePokemonName() {
        return POKEMON_NAMES[random.nextInt(POKEMON_NAMES.length)];
    }
    
    /**
     * Get a random color for user cursor
     */
    public String getRandomColor() {
        return USER_COLORS[random.nextInt(USER_COLORS.length)];
    }
    
    /**
     * Assign a Pokemon name to a session
     */
    public String assignUserName(String sessionId) {
        String name = generatePokemonName();
        String color = getRandomColor();
        sessionToName.put(sessionId, name);
        sessionToColor.put(sessionId, color);
        return name;
    }
    
    /**
     * Get user name for a session
     */
    public String getUserName(String sessionId) {
        return sessionToName.getOrDefault(sessionId, "Anonymous");
    }
    
    /**
     * Get user color for a session
     */
    public String getUserColor(String sessionId) {
        return sessionToColor.getOrDefault(sessionId, "#ffffff");
    }
    
    /**
     * Remove user name mapping when they disconnect
     */
    public void removeUserName(String sessionId) {
        sessionToName.remove(sessionId);
        sessionToColor.remove(sessionId);
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
