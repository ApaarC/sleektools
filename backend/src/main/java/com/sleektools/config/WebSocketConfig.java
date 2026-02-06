package com.sleektools.config;

import com.sleektools.modules.chat.ChatWebSocketHandler;
import com.sleektools.websocket.CanvasWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket configuration for real-time features
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final CanvasWebSocketHandler canvasWebSocketHandler;

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    public WebSocketConfig(ChatWebSocketHandler chatWebSocketHandler, 
                          CanvasWebSocketHandler canvasWebSocketHandler) {
        this.chatWebSocketHandler = chatWebSocketHandler;
        this.canvasWebSocketHandler = canvasWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Chat WebSocket
        registry.addHandler(chatWebSocketHandler, "/ws/chat/{roomId}")
                .setAllowedOrigins(allowedOrigins);
        
        // Canvas WebSocket
        registry.addHandler(canvasWebSocketHandler, "/ws/canvas/{token}")
                .setAllowedOrigins(allowedOrigins);
    }
}
