import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Verify that user information is dynamically fetched, not hardcoded
 * Maps to AC5: User info retrieved dynamically, not hardcoded
 */

test("Code Inspection - No Hardcoded User Names in app.js", async () => {
  // Read the app.js file
  const appJsPath = path.join(__dirname, "../../src/main/resources/static/app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf-8");
  
  // Check for common hardcoded patterns that should not exist
  const forbiddenPatterns = [
    /['"]Arun\s+Janardhanan['"]/i,
    /userProfile\s*=\s*{[^}]*name\s*:\s*['"][^'"]+['"]/,
    /user\.name\s*=\s*['"][^'"]+['"]/,
  ];
  
  forbiddenPatterns.forEach(pattern => {
    const matches = appJsContent.match(pattern);
    if (matches) {
      throw new Error(`Found hardcoded user data: ${matches[0]}`);
    }
  });
  
  // Verify API call to fetch user profile exists
  expect(appJsContent).toContain("/api/users/current");
});

test("Code Inspection - loadUserProfile Function Uses API", async () => {
  const appJsPath = path.join(__dirname, "../../src/main/resources/static/app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf-8");
  
  // Verify loadUserProfile function exists and fetches from API
  expect(appJsContent).toContain("loadUserProfile");
  expect(appJsContent).toContain("fetch('/api/users/current')");
});

test("Code Inspection - loadTasks Function Uses API", async () => {
  const appJsPath = path.join(__dirname, "../../src/main/resources/static/app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf-8");
  
  // Verify loadTasks function exists and fetches from API
  expect(appJsContent).toContain("loadTasks");
  expect(appJsContent).toContain("fetch('/api/tasks')");
});

test("Code Inspection - Profile Fallback Does Not Use Sample Personal Data", async () => {
  const appJsPath = path.join(__dirname, "../../src/main/resources/static/app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf-8");
  
  expect(appJsContent).toContain("Welcome to UVJTaskFlow");
  expect(appJsContent).not.toContain("Demo User");
  expect(appJsContent).not.toContain("Taskflow User");
});

test("Code Inspection - getInitials Function for Profile Image Fallback", async () => {
  const appJsPath = path.join(__dirname, "../../src/main/resources/static/app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf-8");
  
  // Verify initials generation logic exists
  expect(appJsContent).toContain("getInitials");
});

test("Code Inspection - HTML Does Not Contain Hardcoded Demo Data", async () => {
  const indexHtmlPath = path.join(__dirname, "../../src/main/resources/static/index.html");
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, "utf-8");
  
  // User name and role should be populated by JavaScript, not HTML
  // Should have placeholder elements with IDs but no hardcoded user data
  expect(indexHtmlContent).toContain('id="user-name"');
  expect(indexHtmlContent).toContain('id="user-role"');
  expect(indexHtmlContent).toContain('id="welcome-name"');
  
  // Should NOT contain hardcoded user names in attribute values
  expect(indexHtmlContent).not.toMatch(/>\s*Arun\s+Janardhanan\s*</i);
});

test("Code Inspection - Filter and Search Logic is Dynamic", async () => {
  const appJsPath = path.join(__dirname, "../../src/main/resources/static/app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf-8");
  
  // Verify filtering is done on fetched data, not hardcoded
  expect(appJsContent).toContain("applyFilters");
  expect(appJsContent).toContain("activeFilters");
  expect(appJsContent).toContain("priority");
  expect(appJsContent).toContain("status");
});
