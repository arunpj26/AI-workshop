package com.example.taskflow.task;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Locale;
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

    public List<Task> findByPriority(String priority) {
        if (priority == null) {
            return tasks;
        }

        String normalizedValue = normalizePriority(priority);
        return tasks.stream()
            .filter(task -> task.priority() != null
                && task.priority().equalsIgnoreCase(normalizedValue))
            .toList();
    }

    private static String normalizePriority(String priority) {
        String trimmedPriority = priority.trim();
        if (trimmedPriority.isEmpty()) {
            throw new IllegalArgumentException("Priority must be one of LOW, MEDIUM, or HIGH.");
        }

        String normalizedValue = trimmedPriority.toUpperCase(Locale.ROOT);
        if (!VALID_PRIORITIES.contains(normalizedValue)) {
            throw new IllegalArgumentException(
                "Unsupported priority: %s. Supported values are LOW, MEDIUM, and HIGH.".formatted(trimmedPriority));
        }

        return normalizedValue;
    }
}
