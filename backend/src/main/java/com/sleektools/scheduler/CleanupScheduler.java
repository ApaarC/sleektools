package com.sleektools.scheduler;

import com.sleektools.modules.chat.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for cleanup operations
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CleanupScheduler {

    private final RoomService roomService;

    /**
     * Clean up expired rooms every 5 minutes
     */
    @Scheduled(fixedRateString = "${scheduler.room-cleanup.interval-minutes:5}000")
    public void cleanupExpiredRooms() {
        log.debug("Running expired room cleanup...");
        int cleaned = roomService.cleanupExpiredRooms();
        if (cleaned > 0) {
            log.info("Cleaned up {} expired rooms", cleaned);
        }
    }
}
