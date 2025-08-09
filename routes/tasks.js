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
    // 2. Validate the data using validateTaskData function
    // 3. Get all existing tasks using getAllTasks()
    // 4. Generate a new ID for the task
    // 5. Create a new task object with all required fields
    // 6. Add the task to the tasks array
    // 7. Save to file using writeTasks()
    // 8. Send success response with status 201
      
    // Path to tasks JSON file
const tasksFilePath = path.join(__dirname, '../data/tasks.json');

//create a function that gets all the tasks data 

async function getAllTasks() {
  try{
    const data= await fs.readFile(dataFilePath, "utf8")
    return data;
  }catch(err) {
    throw err
  }
}

  //create endpoint that gets all tasks 

  router.post("/", async(req,res)  => {
    try{
       const {id, title, description, status } =req.body
       
       if(!id || !title) {
        return res.status(400).json({error:"Missing required field"})
       }
       
    }catch (err) {
      res.status(500).json({error:"Error adding tasks"})
    }
  })

    //get all tasks
    const tasks = await getAllTasks()

    // create new ID for the new task
    const newId =tasks.length >0 ?
         Math.max(...tasks.map((s) => parse.Int(s.id))) +1 : 1

         // let add the new task to the data
         const newtask = {
          id:newId.toString(),
          title,
          description,
          status:status || null

         }

         //get all tasks, add the new task
         tasks.push(newtask)

         //now write all tasks in task.json
         await writeTasks(tasks)

         res.status(201).json (newtask)


    // Temporary response - remove this when you implement the above
    res.status(501).json({
      success: false,
      error:
        "POST endpoint not implemented yet - implement task creation above",
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
    // TODO: Implement task update
    // 1. Extract the task ID from req.params
    // 2. Get the update data from req.body
    // 3. Validate the data if status or priority is being updated
    // 4. Get all tasks and find the task by ID
    // 5. Check if task exists, return 404 if not found
    // 6. Update the task with new data
    // 7. Save to file using writeTasks()
    // 8. Send success response with the updated task
// File path for tasks
const tasksFilePath = path.join(__dirname, '../data/tasks.json');
 
      

// Helper: Read all tasks
const getAllTasks =  () => {
  if (!fs.existsSync(tasksFilePath)) {
    return [];
  }
  const data = fs.readFileSync(tasksFilePath, 'utf-8');
  return JSON.parse(data || '[]');
};

// Helper: Save all tasks
const writeTasks = (tasks) => {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

// ✅ PUT /api/tasks/:id - Update a task
router.put("/tasks/:id", async (req, res) => {
  try {
    // Step 1: Extract the task ID from req.params
    const taskId = req.params.id;

    // Step 2: Get the update data from req.body
    const updateData = req.body;

    // Step 3: Validate the data if status or priority is being updated
    if (
      (updateData.status && typeof updateData.status !== 'string') ||
      (updateData.priority && typeof updateData.priority !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format for status or priority'
      });
    }

    // Step 4: Get all tasks and find the task by ID
    const tasks = getAllTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    // Step 5: Check if task exists, return 404 if not found
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Step 6: Update the task with new data
    const updatedTask = {
      ...tasks[taskIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    tasks[taskIndex] = updatedTask;

    // Step 7: Save to file using writeTasks()
    writeTasks(tasks);

    // Step 8: Send success response with the updated task
    res.status(200).json({
      success: true,
      task: updatedTask
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


 

    // Temporary response - remove this when you implement the above
    res.status(501).json({
      success: false,
      error: "PUT endpoint not implemented yet - implement task update above",
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
    // TODO: Implement task deletion
    // 1. Extract the task ID from req.params
    // 2. Get all tasks and find the task by ID
    // 3. Check if task exists, return 404 if not found
    // 4. Store the task before deletion (for response)
    // 5. Remove the task from the array
    // 6. Save to file using writeTasks()
    // 7. Send success response with the deleted task


// Path to tasks JSON file
const tasksFilePath = path.join(__dirname, '../data/tasks.json');

// Read all tasks
const getAllTasks = () => {
  if (!fs.existsSync(tasksFilePath)) {
    return [];
  }
  const data = fs.readFileSync(tasksFilePath, 'utf-8');
  return JSON.parse(data || '[]');
};

// Save updated tasks to file
const writeTasks = (tasks) => {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

// ✅ DELETE /api/tasks/:id - Delete a task by ID
router.delete("/tasks/:id", async (req, res) => {
  try {
    // Step 1: Extract the task ID from the URL
    const taskId = req.params.id;

    // Step 2: Get all existing tasks
    const tasks = getAllTasks();

    // Step 3: Check if the task exists
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Step 4: Remove the task from the array
    const deletedTask = tasks.splice(taskIndex, 1)[0];

    // Step 5: Save the updated tasks list to file
    writeTasks(tasks);

    // Step 6: Return a success response
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      task: deletedTask
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
    // Temporary response - remove this when you implement the above
    res.status(501).json({
      success: false,
      error:
        "DELETE endpoint not implemented yet - implement task deletion above",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error deleting task",
    }); // 500 = Server Error
  }
});

export default router;
