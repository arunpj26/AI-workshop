package com.example.taskflow.task;

public record Task(
    long id,
    String title,
    String description,
    String status,
    String priority,
    String assignee,
    Integer effort,
    Integer comments
) {}
