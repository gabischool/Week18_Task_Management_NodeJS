import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const tasksFilePath = path.join(__dirname, "../data/tasks.json");
const tasksData = await fs.promises.readFile(tasksFilePath, "utf8");
const tasks = JSON.parse(tasksData);


// Simple ID generator
const generateId = () => `${Date.now()}`;

/* GET ALL TASKS */
router.get("/tasks", async(req, res) => {
  const { status, priority, assignedTo } = req.query;

  let filteredTasks = tasks;

  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  if (assignedTo) {
    filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo);
  }

  res.json({ success: true, data: filteredTasks });
});

/* GET TASK BY ID */
router.get("/tasks/:id", async(req, res) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, error: "Task not found" });
  }

  res.json({ success: true, data: task });
});

/* POST TASK */
router.post("/tasks", async(req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      subtasks,
    } = req.body;

    if (!title || !description || !status || !priority) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: title, description, status or priority",
      });
    }

    const now = new Date().toISOString();
    const newTask = {
      id: generateId(),
      title,
      description,
      status,
      priority,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(newTask);
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));

    res.status(201).json({ success: true, message: "Task created", data: newTask });
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
  }
});

/* PUT TASK */
router.put("/tasks/:id", async(req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      subtasks,
    } = req.body;

    if (!title || !description || !status || !priority) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: title, description, status or priority",
      });
    }

    const updatedTask = {
      id: tasks[taskIndex].id,
      title,
      description,
      status,
      priority,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      createdAt: tasks[taskIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));

    res.json({ success: true, message: "Task updated", data: updatedTask });
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
  }
});

/*  DELETE TASK BY ID */
router.delete("/tasks/:id", async(req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));

    res.json({ success: true, message: "Task deleted", data: deletedTask });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
  }
});

export default router;
