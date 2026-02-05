package com.sleektools.modules.chat.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to create a new chat room
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {
    
    @NotBlank(message = "Creator name is required")
    @Size(min = 1, max = 50, message = "Name must be between 1 and 50 characters")
    private String creatorName;
    
    @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
    private String pin; // Optional
}
