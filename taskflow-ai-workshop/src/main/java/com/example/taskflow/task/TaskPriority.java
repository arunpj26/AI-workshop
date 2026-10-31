package com.example.taskflow.task;

import java.util.Arrays;

public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH;

    public static TaskPriority fromValue(String rawPriority) {
        String normalizedPriority = rawPriority == null ? "" : rawPriority.trim();
        if (normalizedPriority.isEmpty()) {
            throw new IllegalArgumentException("Unsupported priority ''. Supported values: LOW, MEDIUM, HIGH.");
        }

        return Arrays.stream(values())
            .filter(priority -> priority.name().equalsIgnoreCase(normalizedPriority))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException(
                "Unsupported priority '%s'. Supported values: LOW, MEDIUM, HIGH.".formatted(normalizedPriority)
            ));
    }
}
