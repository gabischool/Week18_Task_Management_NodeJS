# Week 18: Task Management API with Node.js

## RESTful API Development and CRUD Operations

## Introduction

- You have learned the basics of Node.js and Express.js, now let's test your knowledge of how to setup API endpoints with this Task Management project.

### Task 1: Project Setup

1. Clone this project repository in your terminal
2. CD into the project base directory `cd Week18_Task_Management_NodeJS`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. The server will run on `http://localhost:3000`


### API Documentation

For detailed information about the API endpoints and how to use them, please refer to the [STUDENT_ASSIGNMENT.md](STUDENT_ASSIGNMENT.md) file included in this project.

### Task 2: Understanding the Current Implementation

The project currently has a basic task management API with the following structure:

#### Current API Endpoints

**Main Task Operations:**

- `GET /api/tasks` - Get all tasks (with filtering by status, priority, assignedTo)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task ⚠️ **YOU NEED TO COMPLETE THIS**
- `PUT /api/tasks/:id` - Update entire task ⚠️ **YOU NEED TO COMPLETE THIS**
- `DELETE /api/tasks/:id` - Delete specific task ⚠️ **YOU NEED TO COMPLETE THIS**

#### Data Structure

Each task has the following structure:

```json
{
  "id": "1",
  "title": "Task Title",
  "description": "Task description",
  "status": "pending|in-progress|completed|cancelled",
  "priority": "low|medium|high|urgent",
  "dueDate": "2024-01-15",
  "assignedTo": "John Doe",
  "subtasks": [
    {
      "id": "1.1",
      "title": "Subtask Title",
      "description": "Subtask description",
      "completed": false
    }
  ],
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

### Task 3: MVP Requirements (Minimum Viable Product)

You need to complete the following endpoints in `routes/tasks.js`:

#### 1. POST /api/tasks - Create new task

**Location:** `routes/tasks.js` around line 152

- Implement the logic to create a new task
- Validate required fields (title, description, status, priority)
- Generate a new ID for the task
- Add timestamps (createdAt, updatedAt)
- Save the task to the JSON file

#### 2. PUT /api/tasks/:id - Update entire task

**Location:** `routes/tasks.js` around line 181

- Implement the logic to update an existing task
- Find the task by ID
- Replace the entire task with new data
- Update the updatedAt timestamp
- Save changes to the JSON file

#### 3. DELETE /api/tasks/:id - Delete specific task

**Location:** `routes/tasks.js` around line 350

- Implement the logic to delete a task
- Find the task by ID
- Remove the task from the array
- Save changes to the JSON file

### Task 4: Testing Your Implementation

You can use Postman to test your endpoints.

### Task 5: Stretch Goals

#### Add User Information to Tasks

**Objective:** Add user information to each task to track who created it.

**Requirements:**

1. **Update the task data structure** in `data/tasks.json` to include:

   ```json
   {
     "createdBy": {
       "id": "1",
       "name": "John Doe",
       "email": "john@example.com"
     },
     "assignedBy": {
       "id": "2",
       "name": "Jane Smith",
       "email": "jane@example.com"
     }
   }
   ```

2. **Update the POST endpoint** to include user information:

   - Add `createdBy` field to new tasks
   - Validate user information
   - Include user details in the response

3. **Update the PUT endpoint** to handle user changes:

   - Allow updating `assignedBy` information
   - Track who made the last update
   - Include user information in the response

4. **Add user filtering** to the GET endpoint:
   - Filter tasks by `createdBy` user
   - Filter tasks by `assignedBy` user
   - Add query parameters like `?createdBy=1` or `?assignedBy=2`

**Example API calls for stretch goals:**

```bash
# Create task with user information
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task with User",
    "description": "This task includes user info",
    "status": "pending",
    "priority": "medium",
    "createdBy": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'

# Get tasks by user
curl "http://localhost:3000/api/tasks?createdBy=1"
```

## Learning Objectives

By completing this project, you will demonstrate understanding of:

1. **RESTful API Design** - Proper endpoint naming and HTTP methods
2. **Data Validation** - Input validation and sanitization
3. **Error Handling** - HTTP status codes and error responses
4. **File Operations** - Reading and writing JSON files
5. **Express.js Routing** - Route parameters and query strings
6. **Async/Await** - Handling asynchronous operations

## Submission Format

- [ ] Complete the POST endpoint for creating tasks
- [ ] Complete the PUT endpoint for updating tasks
- [ ] Complete the DELETE endpoint for removing tasks
- [ ] Test all endpoints using curl or Postman
- [ ] Optional: Implement stretch goals with user information

## Getting Help

1. **Check the existing code** - Study the GET endpoints for patterns
2. **Read the comments** - Look for TODO comments in the code
3. **Test frequently** - Test each endpoint as you build it
4. **Ask questions** - Don't hesitate to ask for clarification

Good luck with your implementation! 🚀
