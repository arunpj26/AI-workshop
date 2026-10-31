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
            .andExpect(jsonPath("$", hasSize(6)))
            .andExpect(jsonPath("$[0].priority", is("HIGH")));
    }

    @Test
    void getTasksIncludesOnHoldSeedTask() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[5].id", is(6)))
            .andExpect(jsonPath("$[5].title", is("Plan data migration")))
            .andExpect(jsonPath("$[5].description", is("Paused until the reporting database is available")))
            .andExpect(jsonPath("$[5].status", is("ON_HOLD")))
            .andExpect(jsonPath("$[5].priority", is("LOW")));
    }
}
