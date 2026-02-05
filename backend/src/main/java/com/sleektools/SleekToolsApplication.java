package com.sleektools;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * SleekTools Backend Application
 * 
 * A lightweight, modular backend for the SleekTools micro-tools platform.
 * Features:
 * - WebSocket support for real-time chat
 * - RESTful APIs for tool services
 * - In-memory storage (no persistent database)
 * - Auto room expiration
 */
@SpringBootApplication
@EnableScheduling
public class SleekToolsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SleekToolsApplication.class, args);
    }
}
