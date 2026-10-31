package com.example.taskflow.task;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Set;

@Service
public class TaskService {
    private static final Set<String> VALID_PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");

    private final List<Task> tasks = List.of(
        new Task(1, "Implement login", "Add login form validation", "IN_PROGRESS", "HIGH"),
        new Task(2, "Update user profile", "Allow users to edit profile details", "OPEN", "MEDIUM"),
        new Task(3, "Fix button alignment", "Correct spacing on the task page", "COMPLETED", "LOW"),
        new Task(4, "Add API documentation", "Document task endpoints", "OPEN", "MEDIUM"),
        new Task(5, "Improve error handling", "Return consistent API errors", "IN_PROGRESS", "HIGH")
    );

    public List<Task> findAll() {
        return tasks;
    }

    public List<Task> findAll(String priority) {
        if (priority == null) {
            return findAll();
        }

        String normalized = priority.trim();
        if (normalized.isEmpty() || !VALID_PRIORITIES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported priority: " + priority);
        }

        return tasks.stream()
            .filter(task -> task.priority().equals(normalized))
            .toList();
    }
}
