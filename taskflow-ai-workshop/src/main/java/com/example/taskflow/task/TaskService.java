package com.example.taskflow.task;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
    private final List<Task> tasks = List.of(
        new Task(1, "Implement login", "Add login form validation", "IN_PROGRESS", "HIGH", "Alice", 5, 2),
        new Task(2, "Update user profile", "Allow users to edit profile details", "OPEN", "MEDIUM", "Bob", 3, 0),
        new Task(3, "Fix button alignment", "Correct spacing on the task page", "COMPLETED", "LOW", "Alice", 2, 1),
        new Task(4, "Add API documentation", "Document task endpoints", "OPEN", "MEDIUM", null, 4, 0),
        new Task(5, "Improve error handling", "Return consistent API errors", "IN_PROGRESS", "HIGH", "Bob", 8, 3)
    );
    public List<Task> findAll() { return tasks; }
}
