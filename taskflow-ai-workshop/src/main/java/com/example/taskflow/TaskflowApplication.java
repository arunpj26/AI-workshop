package com.example.taskflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.example.taskflow.user.DemoUserProperties;

@SpringBootApplication
@EnableConfigurationProperties(DemoUserProperties.class)
public class TaskflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskflowApplication.class, args);
    }
}
