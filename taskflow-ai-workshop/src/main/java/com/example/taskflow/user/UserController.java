package com.example.taskflow.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserProfileService userProfileService;
    public UserController(UserProfileService userProfileService) { this.userProfileService = userProfileService; }

    @GetMapping("/current")
    public UserProfile getCurrentUser() {
        return userProfileService.currentUser();
    }
}
