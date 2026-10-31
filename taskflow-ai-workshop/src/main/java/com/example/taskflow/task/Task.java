package com.example.taskflow.task;

import java.time.LocalDate;
import java.util.List;

public record Task(
    long id,
    String title,
    String description,
    String status,
    String priority,
    String key,
    List<String> assignees,
    Integer estimateHours,
    int subtaskCount,
    int commentCount,
    String project,
    LocalDate dueDate
) {
    public Task {
        assignees = assignees == null ? List.of() : List.copyOf(assignees);
    }
}
