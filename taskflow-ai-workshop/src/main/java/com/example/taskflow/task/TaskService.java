package com.example.taskflow.task;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
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
            return tasks;
        }

        TaskPriority taskPriority = TaskPriority.fromValue(priority);
        return tasks.stream()
            .filter(task -> task.priority() != null && task.priority().equalsIgnoreCase(taskPriority.name()))
            .toList();
    }
}
