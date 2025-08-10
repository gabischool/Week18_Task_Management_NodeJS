import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// ES module __dirname equivalent
// In CommonJS, __dirname is automatically available, but in ES modules we need to create it manually
// import.meta.url gives us the URL of the current module file
// fileURLToPath converts the URL to a file path string
// path.dirname gets the directory name from the file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the data file
// path.join combines the current directory with the relative path to our data file
// "../data/tasks.json" means: go up one directory, then into 'data' folder, then 'tasks.json'
const dataFilePath = path.join(__dirname, "../data/tasks.json");

// Helper function to read tasks from JSON file
// fs.readFile reads the file asynchronously and returns a promise
// JSON.parse converts the string data back to a JavaScript array
// If file doesn't exist or has errors, return empty array
async function getAllTasks() {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write tasks to JSON file
// JSON.stringify converts the array back to a string with nice formatting (null, 2)
// fs.writeFile writes the data to the file asynchronously
async function writeTasks(tasks) {
  await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2));
}

// Helper function to validate task data
// This function checks if the required fields are present and valid
function validateTaskData(taskData) {
  const requiredFields = ["title", "description", "status", "priority"];
  const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
  const validPriorities = ["low", "medium", "high", "urgent"];

  // Check if all required fields are present
  for (const field of requiredFields) {
    if (!taskData[field]) {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate status
  if (!validStatuses.includes(taskData.status)) {
    return {
      isValid: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    };
  }

  // Validate priority
  if (!validPriorities.includes(taskData.priority)) {
    return {
      isValid: false,
      error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
    };
  }

  return { isValid: true };
}

// GET /api/tasks - Get all tasks
// This route handles GET requests to /api/tasks
// req = request object (contains data sent by client)
// res = response object (used to send data back to client)
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await getAllTasks();

    // Add query parameter support for filtering
    let filteredTasks = tasks;

    // Filter by status if provided
    if (req.query.status) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === req.query.status
      );
    }

    // Filter by priority if provided
    if (req.query.priority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === req.query.priority
      );
    }

    // Filter by assignedTo if provided
    if (req.query.assignedTo) {
      filteredTasks = filteredTasks.filter((task) =>
        task.assignedTo
          .toLowerCase()
          .includes(req.query.assignedTo.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: filteredTasks.length,
      data: filteredTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error retrieving tasks",
    });
  }
});

// GET /api/tasks/:id - Get task by ID
// :id is a route parameter - it captures the value from the URL
// Example: /api/tasks/1 will set req.params.id = "1"
router.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from the URL
    const tasks = await getAllTasks();
    const task = tasks.find((task) => task.id === id); // Find task with matching ID

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      }); // 404 = Not Found
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error retrieving task",
    }); // 500 = Server Error
  }
});

// POST /api/tasks - Create new task
// POST requests are used to create new resources
// req.body contains the data sent in the request body
router.post("/tasks", async (req, res) => {
  try {
    // 1. Extract data from req.body
    const { title, description, status, priority, dueDate, assignedTo, subtasks } = req.body;

    // 2. Validate the data using validateTaskData function
    const validation = validateTaskData({ title, description, status, priority });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // 3. Get all existing tasks
    const tasks = await getAllTasks();

    // 4. Generate a new ID for the task
    const newId = (tasks.length > 0 ? Math.max(...tasks.map(task => parseInt(task.id))) + 1 : 1).toString();

    // 5. Create a new task object with all required fields
    const newTask = {
      id: newId,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      subtasks: subtasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 6. Add the task to the tasks array
    tasks.push(newTask);

    // 7. Save to file using writeTasks()
    await writeTasks(tasks);

    // 8. Send success response with status 201
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error creating task",
    }); // 500 = Server Error
  }
});

// PUT /api/tasks/:id - Update task
// PUT requests are used to update existing resources
// The entire resource is replaced with the new data
router.put("/tasks/:id", async (req, res) => {
  try {
    // 1. Extract the task ID from req.params
    const { id } = req.params;

    // 2. Get the update data from req.body
    const { title, description, status, priority, dueDate, assignedTo, subtasks } = req.body;

    // 3. Validate the data if status or priority is being updated
    if (status || priority) {
      const validation = validateTaskData({ 
        title: title || "temp", 
        description: description || "temp", 
        status: status || "pending", 
        priority: priority || "low" 
      });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        });
      }
    }

    // 4. Get all tasks and find the task by ID
    const tasks = await getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    // 5. Check if task exists, return 404 if not found
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // 6. Update the task with new data
    const existingTask = tasks[taskIndex];
    const updatedTask = {
      ...existingTask,
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      status: status !== undefined ? status : existingTask.status,
      priority: priority !== undefined ? priority : existingTask.priority,
      dueDate: dueDate !== undefined ? dueDate : existingTask.dueDate,
      assignedTo: assignedTo !== undefined ? assignedTo : existingTask.assignedTo,
      subtasks: subtasks !== undefined ? subtasks : existingTask.subtasks,
      updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;

    // 7. Save to file using writeTasks()
    await writeTasks(tasks);

    // 8. Send success response with the updated task
    res.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error updating task",
    }); // 500 = Server Error
  }
});

// DELETE /api/tasks/:id - Delete task
// DELETE requests are used to remove resources
router.delete("/tasks/:id", async (req, res) => {
  try {
    // 1. Extract the task ID from req.params
    const { id } = req.params;

    // 2. Get all tasks and find the task by ID
    const tasks = await getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    // 3. Check if task exists, return 404 if not found
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // 4. Store the task before deletion (for response)
    const deletedTask = tasks[taskIndex];

    // 5. Remove the task from the array
    tasks.splice(taskIndex, 1);

    // 6. Save to file using writeTasks()
    await writeTasks(tasks);

    // 7. Send success response with the deleted task
    res.json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error deleting task",
    }); // 500 = Server Error
  }
});

export default router;
