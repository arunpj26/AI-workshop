package com.example.taskflow.task;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.params.provider.CsvSource;
import static org.hamcrest.Matchers.everyItem;
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
    void getTasksReturnsOnlyMatchingPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", "HIGH"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].priority", is("HIGH")))
            .andExpect(jsonPath("$[1].priority", is("HIGH")));
    }

    @ParameterizedTest
    @CsvSource({"LOW, 1", "MEDIUM, 2"})
    void getTasksReturnsOnlyMatchingOtherValidPriorities(String priority, int expectedCount) throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", priority))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(expectedCount)))
            .andExpect(jsonPath("$[*].priority", everyItem(is(priority))));
    }

    @Test
    void getTasksRejectsUnsupportedPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", "URGENT"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void getTasksRejectsBlankPriority() throws Exception {
        mockMvc.perform(get("/api/tasks").param("priority", ""))
            .andExpect(status().isBadRequest());
    }
}
