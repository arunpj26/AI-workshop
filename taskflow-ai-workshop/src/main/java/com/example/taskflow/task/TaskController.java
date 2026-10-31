package com.example.taskflow.task;

import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private static final Set<String> VALID_PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");

    private final TaskService taskService;
    public TaskController(TaskService taskService) { this.taskService = taskService; }

    @GetMapping
    public List<Task> getTasks(@RequestParam(required = false) String priority) {
        if (priority == null) {
            return taskService.findAll();
        }
        if (priority.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Priority must not be blank.");
        }
        if (!VALID_PRIORITIES.contains(priority)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported priority: " + priority);
        }
        return taskService.findAllByPriority(priority);
    }
}
