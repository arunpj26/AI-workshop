package com.example.taskflow.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class UserProfileServiceTest {

    @Test
    void returnsConfiguredValues() {
        UserProfile profile = new UserProfileService("Jane Doe", "Developer", "https://example.com/jane.png").currentUser();

        assertEquals("Jane Doe", profile.name());
        assertEquals("Developer", profile.role());
        assertEquals("https://example.com/jane.png", profile.imageUrl());
    }

    @Test
    void trimsSurroundingWhitespace() {
        UserProfile profile = new UserProfileService("  Jane Doe ", " Developer  ", "  /assets/jane.png ").currentUser();

        assertEquals("Jane Doe", profile.name());
        assertEquals("Developer", profile.role());
        assertEquals("/assets/jane.png", profile.imageUrl());
    }

    @Test
    void blankOrMissingValuesBecomeNull() {
        UserProfile blank = new UserProfileService("   ", "", "  ").currentUser();
        UserProfile missing = new UserProfileService(null, null, null).currentUser();

        assertNull(blank.name());
        assertNull(blank.role());
        assertNull(blank.imageUrl());
        assertNull(missing.name());
        assertNull(missing.role());
        assertNull(missing.imageUrl());
    }

    @ParameterizedTest
    @ValueSource(strings = {"http://example.com/a.png", "HTTPS://example.com/a.png", "/assets/a.png"})
    void allowsWebAndSameOriginImageUrls(String url) {
        assertEquals(url, new UserProfileService("Jane", "Dev", url).currentUser().imageUrl());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "javascript:alert(1)", "data:text/html;base64,PGgxPg==", "//evil.example/a.png",
        "ftp://example.com/a.png", "file:///etc/passwd", "not a url"
    })
    void rejectsUnsafeImageUrlsButKeepsOtherFields(String url) {
        UserProfile profile = new UserProfileService("Jane", "Dev", url).currentUser();

        assertNull(profile.imageUrl());
        assertEquals("Jane", profile.name());
        assertEquals("Dev", profile.role());
    }
}
