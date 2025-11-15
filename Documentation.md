# SkillStack Dashboard - Project Documentation

## 1. Project Overview
SkillStack Dashboard is a React-based web application designed to help learners manage and track their skills. Users can add new skills, edit or delete existing skills, and view a summary of all their learning activities. The application focuses on organizing learning data efficiently and providing a clear overview of progress.

## 2. Features

### Implemented Features
- **Add Skills:** Users can input skill details including name, resource type, platform, status, hours spent, difficulty, and notes.
- **Edit Skills:** Modify existing skill entries.
- **Delete Skills:** Remove skills from the dashboard.
- **Form Validation:** Ensures required fields are filled, hours are non-negative, and difficulty is between 1–5.
- **Dashboard Summary:** Shows:
  - Total number of skills.
  - Total hours spent.
  - Status counts (started, in-progress, completed) with colored badges.
- **Responsive UI:** Built with Bootstrap for mobile and desktop responsiveness.
- **Skill Cards:** Display detailed information for each skill with Edit/Delete buttons.


## 3. Components / Structure

### App.js
- Main container that handles state for all skills.
- Fetches skills and summary data from backend APIs.
- Handles adding, editing, and deleting skills.

### SkillForm
- Component for adding or editing a skill.
- Validates user input.
- Submits skill data to the backend using POST (new) or PUT (update) requests.

---

## 4. Validation Rules

| Field           | Validation Rule                                  |
|-----------------|--------------------------------------------------|
| Skill Name      | Required                                        |
| Resource Type   | Required                                        |
| Platform        | Required                                        |
| Status          | Required (started, in-progress, completed)     |
| Hours           | Must be 0 or greater                            |
| Difficulty      | Must be between 1 and 5                         |
| Notes           | Required                                        |

> Note: Validation messages are displayed under each field if rules are not met.

---

## 5. Backend API Endpoints

The frontend interacts with a backend server at `http://127.0.0.1:8000` with the following endpoints:

| Endpoint               | Method | Description                       |
|------------------------|--------|-----------------------------------|
| `/skills`              | GET    | Retrieve all skills               |
| `/skills`              | POST   | Add a new skill                   |
| `/skills/:id`          | PUT    | Update an existing skill          |
| `/skills/:id`          | DELETE | Delete a skill                    |
| `/summary`             | GET    | Retrieve total skills, hours, and status counts |

> You can mock backend responses for testing if a live backend is unavailable.

---

## 6. Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/Anjanasajeesh/skillstack-dashboard.git
cd skillstack-dashboard
