package com.example.taskflow.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
public class UserProfileService {
    private final String name;
    private final String role;
    private final String imageUrl;

    public UserProfileService(
            @Value("${taskflow.user.name:}") String name,
            @Value("${taskflow.user.role:}") String role,
            @Value("${taskflow.user.image-url:}") String imageUrl) {
        this.name = name;
        this.role = role;
        this.imageUrl = imageUrl;
    }

    public UserProfile currentUser() {
        return new UserProfile(clean(name), clean(role), cleanImageUrl(imageUrl));
    }

    public UserProfile profile(DemoProfile profile) {
        if (profile == null) return new UserProfile(null, null, null);
        return new UserProfile(clean(profile.name()), clean(profile.role()), cleanImageUrl(profile.imageUrl()));
    }

    private static String clean(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    // Only http(s) and same-origin paths are exposed; other schemes could be abused by the UI.
    private static String cleanImageUrl(String value) {
        String url = clean(value);
        if (url == null) return null;
        String lower = url.toLowerCase(Locale.ROOT);
        boolean absoluteWeb = lower.startsWith("https://") || lower.startsWith("http://");
        boolean sameOriginPath = url.startsWith("/") && !url.startsWith("//");
        return absoluteWeb || sameOriginPath ? url : null;
    }
}
