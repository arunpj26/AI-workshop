package com.example.taskflow.user;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.demo")
public class DemoUserProperties {
    private List<DemoProfile> profiles = new ArrayList<>();

    public List<DemoProfile> getProfiles() {
        return profiles;
    }

    public void setProfiles(List<DemoProfile> profiles) {
        this.profiles = profiles == null ? new ArrayList<>() : profiles;
    }
}
