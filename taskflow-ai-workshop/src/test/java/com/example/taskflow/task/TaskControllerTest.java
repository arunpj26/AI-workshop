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
    void getTasksReturnsSeededTasksWithSupportedFields() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("application/json"))
            .andExpect(jsonPath("$", hasSize(5)))
            .andExpect(jsonPath("$[0].id", is(1)))
            .andExpect(jsonPath("$[0].title", is("Implement login")))
            .andExpect(jsonPath("$[0].description", is("Add login form validation")))
            .andExpect(jsonPath("$[0].status", is("IN_PROGRESS")))
            .andExpect(jsonPath("$[0].priority", is("HIGH")));
    }

    @Test
    void getTasksIncludesEverySupportedKanbanStatus() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.status == 'OPEN')]", hasSize(2)))
            .andExpect(jsonPath("$[?(@.status == 'IN_PROGRESS')]", hasSize(2)))
            .andExpect(jsonPath("$[?(@.status == 'COMPLETED')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@.status == 'ON_HOLD')]", hasSize(0)));
    }
}
