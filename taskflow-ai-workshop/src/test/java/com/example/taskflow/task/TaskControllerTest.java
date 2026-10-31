package com.example.taskflow.task;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TaskflowApplication.class)
@AutoConfigureMockMvc
class TaskControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    void getTasksReturnsSeededTasks() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("application/json"))
            .andExpect(jsonPath("$", hasSize(5)))
            .andExpect(jsonPath("$[0].priority", is("HIGH")));
    }

    @Test
    void getTasksReturnsTasksWithAllRequiredFields() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id", is(1)))
            .andExpect(jsonPath("$[0].title", is("Implement login")))
            .andExpect(jsonPath("$[0].description", is("Add login form validation")))
            .andExpect(jsonPath("$[0].status", is("IN_PROGRESS")))
            .andExpect(jsonPath("$[0].priority", is("HIGH")))
            .andExpect(jsonPath("$[0].assignee", is("Alice")))
            .andExpect(jsonPath("$[0].effort", is(5)))
            .andExpect(jsonPath("$[0].comments", is(2)));
    }

    @Test
    void getTasksHandlesNullAssignee() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[3].title", is("Add API documentation")))
            .andExpect(jsonPath("$[3].assignee", nullValue()))
            .andExpect(jsonPath("$[3].effort", is(4)));
    }

    @Test
    void getTasksReturnsVariousStatuses() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].status", is("IN_PROGRESS")))
            .andExpect(jsonPath("$[1].status", is("OPEN")))
            .andExpect(jsonPath("$[2].status", is("COMPLETED")));
    }
}
