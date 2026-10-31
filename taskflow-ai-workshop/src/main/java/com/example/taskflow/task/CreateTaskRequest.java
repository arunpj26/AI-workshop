package com.example.taskflow.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record CreateTaskRequest(
    @NotBlank(message = "Title is required.")
    @Size(max = 200, message = "Title must be at most 200 characters.")
    String title,

    @Size(max = 2000, message = "Description must be at most 2000 characters.")
    String description,

    @NotBlank(message = "Status is required.")
    @Pattern(regexp = "OPEN|IN_PROGRESS|COMPLETED|ON_HOLD", message = "Status must be one of OPEN, IN_PROGRESS, COMPLETED, ON_HOLD.")
    String status,

    @NotBlank(message = "Priority is required.")
    @Pattern(regexp = "HIGH|MEDIUM|LOW", message = "Priority must be one of HIGH, MEDIUM, LOW.")
    String priority,

    @Size(max = 20, message = "At most 20 assignees are allowed.")
    List<@NotBlank(message = "Assignee names must not be blank.") @Size(max = 100, message = "Assignee names must be at most 100 characters.") String> assignees,

    @PositiveOrZero(message = "Estimate must be zero or more hours.")
    @Max(value = 1000, message = "Estimate must be at most 1000 hours.")
    Integer estimateHours,

    @Size(max = 100, message = "Project must be at most 100 characters.")
    String project,

    LocalDate dueDate
) {}
