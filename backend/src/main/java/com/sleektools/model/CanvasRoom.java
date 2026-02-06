package com.sleektools.model;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class CanvasRoom {
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivity;
    private Set<String> participantIds;
    private String canvasData; // Base64 encoded canvas image data
    
    public CanvasRoom() {
        this.participantIds = ConcurrentHashMap.newKeySet();
        this.createdAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
    }
    
    public CanvasRoom(String token) {
        this();
        this.token = token;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastActivity() {
        return lastActivity;
    }
    
    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }
    
    public Set<String> getParticipantIds() {
        return participantIds;
    }
    
    public void setParticipantIds(Set<String> participantIds) {
        this.participantIds = participantIds;
    }
    
    public String getCanvasData() {
        return canvasData;
    }
    
    public void setCanvasData(String canvasData) {
        this.canvasData = canvasData;
    }
    
    public void addParticipant(String participantId) {
        this.participantIds.add(participantId);
        this.lastActivity = LocalDateTime.now();
    }
    
    public void removeParticipant(String participantId) {
        this.participantIds.remove(participantId);
    }
    
    public int getParticipantCount() {
        return participantIds.size();
    }
    
    public void updateActivity() {
        this.lastActivity = LocalDateTime.now();
    }
    
    public boolean isExpired(int maxHours) {
        return LocalDateTime.now().minusHours(maxHours).isAfter(createdAt);
    }
}
