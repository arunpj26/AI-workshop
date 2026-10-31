package com.example.taskflow.user;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TaskflowApplication.class, properties = {
    "taskflow.user.name=Test User",
    "taskflow.user.role=Administrator",
    "taskflow.user.image-url=https://example.com/test-user.png"
})
@AutoConfigureMockMvc
class UserControllerConfiguredUserTest {
    @Autowired MockMvc mockMvc;

    @Test
    void getCurrentUserReturnsOverriddenProfile() throws Exception {
        mockMvc.perform(get("/api/users/current"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Test User"))
            .andExpect(jsonPath("$.role").value("Administrator"))
            .andExpect(jsonPath("$.imageUrl").value("https://example.com/test-user.png"));
    }
}
