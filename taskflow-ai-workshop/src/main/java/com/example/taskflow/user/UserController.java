package com.example.taskflow.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserProfileService userProfileService;
    private final DemoUserProperties demoUserProperties;
    public UserController(UserProfileService userProfileService, DemoUserProperties demoUserProperties) {
        this.userProfileService = userProfileService;
        this.demoUserProperties = demoUserProperties;
    }

    @GetMapping("/current")
    public UserProfile getCurrentUser(@RequestParam(required = false) String profile) {
        if (profile != null && !profile.isBlank()) {
            return demoUserProperties.getProfiles().stream()
                .filter(item -> profile.equals(item.id()))
                .findFirst()
                .map(userProfileService::profile)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Unknown demo profile"));
        }
        return userProfileService.currentUser();
    }

    @GetMapping("/profiles")
    public List<DemoProfile> getProfiles() {
        return demoUserProperties.getProfiles();
    }
}
