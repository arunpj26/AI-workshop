package com.example.taskflow.user;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TaskflowApplication.class, properties = {
    "taskflow.user.name=",
    "taskflow.user.role=   ",
    "taskflow.user.image-url=javascript:alert(1)"
})
@AutoConfigureMockMvc
class UserControllerMissingProfileTest {
    @Autowired MockMvc mockMvc;

    @Test
    void getCurrentUserReturnsNullsInsteadOfBlankOrUnsafeValues() throws Exception {
        mockMvc.perform(get("/api/users/current"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", nullValue()))
            .andExpect(jsonPath("$.role", nullValue()))
            .andExpect(jsonPath("$.imageUrl", nullValue()));
    }
}
