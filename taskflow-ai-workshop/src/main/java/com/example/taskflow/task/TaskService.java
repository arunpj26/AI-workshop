package com.example.taskflow.task;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TaskService {
    private static final String KEY_PREFIX = "TF-";

    private final List<Task> tasks = new CopyOnWriteArrayList<>(List.of(
        new Task(1, "Implement login", "Add login form validation", "IN_PROGRESS", "HIGH",
            "TF-1", List.of("Priya Nair", "Daniel Moss"), 8, 3, 4, "TaskFlow Web", LocalDate.of(2026, 10, 28)),
        new Task(2, "Update user profile", "Allow users to edit profile details", "OPEN", "MEDIUM",
            "TF-2", List.of("Sara Khan"), 5, 2, 1, "TaskFlow Web", LocalDate.of(2026, 10, 30)),
        new Task(3, "Fix button alignment", "Correct spacing on the task page", "COMPLETED", "LOW",
            "TF-3", List.of("Daniel Moss"), 2, 0, 2, "TaskFlow Web", LocalDate.of(2026, 10, 26)),
        new Task(4, "Add API documentation", "Document task endpoints", "OPEN", "MEDIUM",
            "TF-4", List.of("Leo Fernandes", "Sara Khan"), 4, 1, 0, "TaskFlow API", LocalDate.of(2026, 11, 1)),
        new Task(5, "Improve error handling", "Return consistent API errors", "IN_PROGRESS", "HIGH",
            "TF-5", List.of("Leo Fernandes"), 6, 2, 3, "TaskFlow API", LocalDate.of(2026, 10, 29)),
        new Task(6, "Migrate reporting exports", "Waiting on the data team to confirm the export format", "ON_HOLD", "MEDIUM",
            "TF-6", List.of("Priya Nair"), 10, 4, 5, "TaskFlow API", LocalDate.of(2026, 11, 6)),
        new Task(7, "Set up release checklist", "Agree release steps before the next deployment", "ON_HOLD", "LOW",
            "TF-7", List.of(), null, 0, 0, "TaskFlow Web", null)
    ));
    private final AtomicLong nextId = new AtomicLong(tasks.size() + 1L);

    public List<Task> findAll() { return List.copyOf(tasks); }

    public Task create(CreateTaskRequest request) {
        long id = nextId.getAndIncrement();
        List<String> assignees = request.assignees() == null
            ? List.of()
            : request.assignees().stream().map(String::trim).toList();
        Task task = new Task(id, request.title().trim(), trimToNull(request.description()), request.status(),
            request.priority(), KEY_PREFIX + id, assignees, request.estimateHours(), 0, 0,
            trimToNull(request.project()), request.dueDate());
        tasks.add(task);
        return task;
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
