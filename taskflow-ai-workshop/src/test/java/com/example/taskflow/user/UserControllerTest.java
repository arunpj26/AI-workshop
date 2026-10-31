package com.example.taskflow.user;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
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
            .andExpect(jsonPath("$.name", is("Demo User")))
            .andExpect(jsonPath("$.role", is("Project Member")))
            .andExpect(jsonPath("$.imageUrl", nullValue()));
    }

    @Test
    void getCurrentUserRejectsUnsupportedMethod() throws Exception {
        mockMvc.perform(post("/api/users/current"))
            .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void existingTasksEndpointReturnsTasksWithNewFields() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()", is(5)))
            .andExpect(jsonPath("$[0].title", is("Implement login")))
            .andExpect(jsonPath("$[0].status", is("IN_PROGRESS")))
            .andExpect(jsonPath("$[0].priority", is("HIGH")))
            .andExpect(jsonPath("$[0].assignee", is("Alice")))
            .andExpect(jsonPath("$[0].effort", is(5)))
            .andExpect(jsonPath("$[0].comments", is(2)));
    }

    @Test
    void currentUserEndpointReturnsValidProfileStructure() throws Exception {
        mockMvc.perform(get("/api/users/current"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isMap())
            .andExpect(jsonPath("$.name").isNotEmpty())
            .andExpect(jsonPath("$.role").isNotEmpty());
    }
}
