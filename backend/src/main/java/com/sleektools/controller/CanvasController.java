package com.sleektools.controller;

import com.sleektools.model.CanvasRoom;
import com.sleektools.service.CanvasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/canvas")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CanvasController {

    private final CanvasService canvasService;

    public CanvasController(CanvasService canvasService) {
        this.canvasService = canvasService;
    }

    /**
     * Create a new canvas room
     * Returns the canvas token that can be used in the URL
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCanvas() {
        try {
            CanvasRoom canvas = canvasService.createCanvas();
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", canvas.getToken());
            response.put("createdAt", canvas.getCreatedAt().toString());
            
            System.out.println("[CanvasController] Created new canvas: " + canvas.getToken());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[CanvasController] Error creating canvas: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create canvas");
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Check if a canvas exists
     */
    @GetMapping("/{token}/exists")
    public ResponseEntity<Map<String, Object>> checkCanvasExists(@PathVariable String token) {
        boolean exists = canvasService.canvasExists(token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        
        System.out.println("[CanvasController] Check canvas exists: " + token + " -> " + exists);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get canvas info (without the actual canvas data)
     */
    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getCanvas(@PathVariable String token) {
        CanvasRoom canvas = canvasService.getCanvas(token);
        
        if (canvas == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Canvas not found or expired");
            return ResponseEntity.status(404).body(error);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", canvas.getToken());
        response.put("createdAt", canvas.getCreatedAt().toString());
        response.put("lastActivity", canvas.getLastActivity().toString());
        response.put("participantCount", canvas.getParticipantCount());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a canvas
     */
    @DeleteMapping("/{token}")
    public ResponseEntity<Map<String, Object>> deleteCanvas(@PathVariable String token) {
        boolean deleted = canvasService.deleteCanvas(token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("deleted", deleted);
        
        System.out.println("[CanvasController] Delete canvas: " + token + " -> " + deleted);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get active canvas count (for monitoring/admin)
     */
    @GetMapping("/stats/count")
    public ResponseEntity<Map<String, Object>> getActiveCount() {
        int count = canvasService.getActiveCanvasCount();
        
        Map<String, Object> response = new HashMap<>();
        response.put("activeCanvases", count);
        
        return ResponseEntity.ok(response);
    }
}
