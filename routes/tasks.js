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
    // TODO: Implement task creation
    // 1. Extract data from req.body (title, description, status, priority, etc.)
    const { title, description, status, priority } = req.body;

    // 2. Validate the data using validateTaskData function

    if (!title || !description || !status || !priority) {
      return res.status(400).json({ error: "Missing reqiired fild" });
    }

    // 3. Get all existing tasks using getAllTasks()
    const tasks = await getAllTasks();

    // 4. Generate a new ID for the task
    const newId =
      tasks.length > 0
        ? Math.max(...tasks.map((task) => parseInt(task.id))) + 1
        : 1;

    // 5. Create a new task object with all required fields
    const newTask = {
      id: newId,
      title: title,
      description: description,
      status: status,
      priority: priority,
      dueDate: null,
      assignedTo: null,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 6. Add the task to the tasks array
    tasks.push(newTask);

    // 7. Save to file using writeTasks()
    await writeTasks(tasks);

    // 8. Send success response with status 201
    res.status(201).json({
      success: true,
      message: "create task succesfully",
      data: newTask,
    });

    // Temporary response - remove this when you implement the above
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error creating task",
    }); // 500 = Server Error
  }
});

router.put("/tasks/:id", async (req, res) => {
  try {
    // TODO: Implement task update
    // 1. Extract the task ID from req.params
    const { id } = req.params;
    //  console.log(id)
    // 2. Get the update data from req.body
    const { title, description } = req.body;
    // console.log( title,description)
    //  const updateData = req.body;

    // 3. Validate the data if status or priority is being updated
    if (!title || !description) {
      return res.status(400).json({ error: "Missing reqiired fild" });
    }
    const tasks = await getAllTasks();
    // 4. Get all tasks and find the task by ID
    const taskIndex = tasks.findIndex((task) => String(task.id) === id);
    if (taskIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    console.log(tasks);

    // 5. Check if task exists, return 404 if not found

    // 6. Update the task with new data
    const newData = { title: "title", description: "description" };
    if (title) tasks[taskIndex].title = title;
    if (description) tasks[taskIndex].description = description;

    // 7. Save to file using writeTasks()
    await writeTasks(tasks);

    // 8. Send success response with the updated task

    res.status(200).json({
      success: true,
      message: "user updated successfully",
      data: tasks[taskIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    }); // 500 = Server Error
  }
});
// DELETE /api/tasks/:id - Delete task
// DELETE requests are used to remove resources
// router.delete("/tasks/:id", async (req, res) => {
//   try {
//     // TODO: Implement task deletion
//     // 1. Extract the task ID from req.params
//     // 2. Get all tasks and find the task by ID
//     // 3. Check if task exists, return 404 if not found
//     // 4. Store the task before deletion (for response)
//     // 5. Remove the task from the array
//     // 6. Save to file using writeTasks()
//     // 7. Send success response with the deleted task

//     // Temporary response - remove this when you implement the above
//     //   res.status(501).json({
//     //     success: false,
//     //     error:
//     //       "DELETE endpoint not implemented yet - implement task deletion above",
//     //   });
//     // } catch (error) {
//     //   res.status(500).json({
//     //     success: false,
//     //     error: "Error deleting task",
//     //   }); // 500 = Server Error

//     const taskId = req.params.id;
//     const tasks = readTasks();

//     const taskIndex = tasks.findIndex((task) => task.id === taskId);

//     if (taskIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found",
//       });
//     }

//     const deletedTask = tasks[taskIndex];
//     tasks.splice(taskIndex, 1);

//     writeTasks(tasks);

//     res.status(200).json({
//       success: true,
//       message: "Task deleted successfully",
//       data: deletedTask,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Error deleting task",
//     });
//   }
// });
// DELETE /api/tasks/:id - Delete task by ID
router.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tasks = await getAllTasks(); // Read all tasks from file
    const taskIndex = tasks.findIndex((task) => String(task.id) === id); // Match ID as string

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0]; // Remove and store the deleted task

    await writeTasks(tasks); // Write updated task list back to file

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error deleting task",
    });
  }
});

export default router;
