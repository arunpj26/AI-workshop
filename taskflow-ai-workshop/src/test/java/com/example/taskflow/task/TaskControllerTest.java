package com.example.taskflow.task;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
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
    void getTasksFiltersByHighPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", "HIGH"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].priority", is("HIGH")))
            .andExpect(jsonPath("$[1].priority", is("HIGH")));
    }

    @Test
    void getTasksFiltersByMediumPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", "MEDIUM"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].priority", is("MEDIUM")))
            .andExpect(jsonPath("$[1].priority", is("MEDIUM")));
    }

    @Test
    void getTasksFiltersByLowPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", "LOW"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].priority", is("LOW")));
    }

    @Test
    void getTasksRejectsUnsupportedPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", "URGENT"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void getTasksRejectsEmptyPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", ""))
            .andExpect(status().isBadRequest());
    }
}
