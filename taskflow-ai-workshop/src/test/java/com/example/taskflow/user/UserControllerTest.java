package com.example.taskflow.user;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TaskflowApplication.class)
@AutoConfigureMockMvc
class UserControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    void getCurrentUserReturnsDefaultConfiguredProfile() throws Exception {
        mockMvc.perform(get("/api/users/current"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("application/json"))
            .andExpect(jsonPath("$.name").value("Demo User"))
            .andExpect(jsonPath("$.role").value("Project Member"))
            .andExpect(jsonPath("$.imageUrl").value((Object) null));
    }

    @Test
    void getCurrentUserRejectsUnsupportedMethod() throws Exception {
        mockMvc.perform(post("/api/users/current"))
            .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void existingTasksEndpointIsUnchanged() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(5))
            .andExpect(jsonPath("$[0].title").value("Implement login"))
            .andExpect(jsonPath("$[0].status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$[0].priority").value("HIGH"));
    }
}
