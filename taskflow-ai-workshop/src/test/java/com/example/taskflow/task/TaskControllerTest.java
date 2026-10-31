package com.example.taskflow.task;

import com.example.taskflow.TaskflowApplication;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import java.util.stream.Stream;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TaskflowApplication.class)
@AutoConfigureMockMvc
class TaskControllerTest {
    private static final int SEEDED_TASK_COUNT = 7;

    @Autowired MockMvc mockMvc;

    @Test
    void getTasksReturnsSeededTasks() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("application/json"))
            .andExpect(jsonPath("$", hasSize(SEEDED_TASK_COUNT)))
            .andExpect(jsonPath("$[0].priority", is("HIGH")));
    }

    @Test
    void getTasksPreservesOriginalSeedTaskValues() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0:5].id", contains(1, 2, 3, 4, 5)))
            .andExpect(jsonPath("$[0:5].title", contains(
                "Implement login", "Update user profile", "Fix button alignment",
                "Add API documentation", "Improve error handling")))
            .andExpect(jsonPath("$[0:5].description", contains(
                "Add login form validation", "Allow users to edit profile details",
                "Correct spacing on the task page", "Document task endpoints", "Return consistent API errors")))
            .andExpect(jsonPath("$[0:5].status", contains("IN_PROGRESS", "OPEN", "COMPLETED", "OPEN", "IN_PROGRESS")))
            .andExpect(jsonPath("$[0:5].priority", contains("HIGH", "MEDIUM", "LOW", "MEDIUM", "HIGH")));
    }

    @Test
    void getTasksIncludesOnHoldTaskAndBoardFields() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.status == 'ON_HOLD')]", not(empty())))
            .andExpect(jsonPath("$[0].key", is("TF-1")))
            .andExpect(jsonPath("$[0].assignees", contains("Priya Nair", "Daniel Moss")))
            .andExpect(jsonPath("$[0].estimateHours", is(8)))
            .andExpect(jsonPath("$[0].subtaskCount", is(3)))
            .andExpect(jsonPath("$[0].commentCount", is(4)))
            .andExpect(jsonPath("$[0].project", is("TaskFlow Web")))
            .andExpect(jsonPath("$[0].dueDate", is("2026-10-28")));
    }

    @Test
    void getTasksReturnsEmptyAssigneesAndNullOptionalFieldsWhenAbsent() throws Exception {
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[6].status", is("ON_HOLD")))
            .andExpect(jsonPath("$[6].assignees", hasSize(0)))
            .andExpect(jsonPath("$[6].estimateHours", nullValue()))
            .andExpect(jsonPath("$[6].dueDate", nullValue()));
    }

    @Test
    @DirtiesContext
    void createTaskReturnsCreatedTaskAndAddsItToTheList() throws Exception {
        String body = """
            {"title": "  Write release notes  ", "description": "Summarise the sprint", "status": "ON_HOLD",
             "priority": "LOW", "assignees": ["Sara Khan"], "estimateHours": 3, "project": "TaskFlow Web",
             "dueDate": "2026-11-03", "id": 99, "key": "HACK-1", "commentCount": 42}
            """;

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", is(SEEDED_TASK_COUNT + 1)))
            .andExpect(jsonPath("$.key", is("TF-" + (SEEDED_TASK_COUNT + 1))))
            .andExpect(jsonPath("$.title", is("Write release notes")))
            .andExpect(jsonPath("$.description", is("Summarise the sprint")))
            .andExpect(jsonPath("$.status", is("ON_HOLD")))
            .andExpect(jsonPath("$.priority", is("LOW")))
            .andExpect(jsonPath("$.assignees", contains("Sara Khan")))
            .andExpect(jsonPath("$.estimateHours", is(3)))
            .andExpect(jsonPath("$.subtaskCount", is(0)))
            .andExpect(jsonPath("$.commentCount", is(0)))
            .andExpect(jsonPath("$.project", is("TaskFlow Web")))
            .andExpect(jsonPath("$.dueDate", is("2026-11-03")));

        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(SEEDED_TASK_COUNT + 1)))
            .andExpect(jsonPath("$[" + SEEDED_TASK_COUNT + "].title", is("Write release notes")))
            .andExpect(jsonPath("$[0:5].id", contains(1, 2, 3, 4, 5)))
            .andExpect(jsonPath("$[0:5].status", contains("IN_PROGRESS", "OPEN", "COMPLETED", "OPEN", "IN_PROGRESS")));
    }

    @Test
    @DirtiesContext
    void createTaskWithOnlyRequiredFieldsUsesEmptyDefaults() throws Exception {
        String body = """
            {"title": "Plan sprint", "status": "OPEN", "priority": "MEDIUM", "estimateHours": 0}
            """;

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title", is("Plan sprint")))
            .andExpect(jsonPath("$.description", nullValue()))
            .andExpect(jsonPath("$.assignees", hasSize(0)))
            .andExpect(jsonPath("$.estimateHours", is(0)))
            .andExpect(jsonPath("$.project", nullValue()))
            .andExpect(jsonPath("$.dueDate", nullValue()));
    }

    @Test
    void createTaskWithBlankTitleReturnsFieldError() throws Exception {
        String body = """
            {"title": "   ", "status": "OPEN", "priority": "HIGH"}
            """;

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.title", is("Title is required.")));
    }

    @ParameterizedTest
    @MethodSource("invalidCreateRequests")
    void createTaskRejectsInvalidRequestsWithoutAddingTasks(String body) throws Exception {
        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/tasks"))
            .andExpect(jsonPath("$", hasSize(SEEDED_TASK_COUNT)));
    }

    static Stream<String> invalidCreateRequests() {
        String longTitle = "x".repeat(201);
        return Stream.of(
            "{\"status\": \"OPEN\", \"priority\": \"HIGH\"}",
            "{\"title\": \"\", \"status\": \"OPEN\", \"priority\": \"HIGH\"}",
            "{\"title\": \"" + longTitle + "\", \"status\": \"OPEN\", \"priority\": \"HIGH\"}",
            "{\"title\": \"Task\", \"priority\": \"HIGH\"}",
            "{\"title\": \"Task\", \"status\": \"BLOCKED\", \"priority\": \"HIGH\"}",
            "{\"title\": \"Task\", \"status\": \"open\", \"priority\": \"HIGH\"}",
            "{\"title\": \"Task\", \"status\": \"OPEN\"}",
            "{\"title\": \"Task\", \"status\": \"OPEN\", \"priority\": \"URGENT\"}",
            "{\"title\": \"Task\", \"status\": \"OPEN\", \"priority\": \"HIGH\", \"estimateHours\": -1}",
            "{\"title\": \"Task\", \"status\": \"OPEN\", \"priority\": \"HIGH\", \"assignees\": [\" \"]}",
            "{\"title\": \"Task\", \"status\": \"OPEN\", \"priority\": \"HIGH\", \"dueDate\": \"31-10-2026\"}",
            "{\"title\": \"Task\", \"status\": "
        );
    }
}
