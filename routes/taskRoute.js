import { error } from "console";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { title } from "process";
import { fileURLToPath } from "url";



// Initialize Express
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
//const dataFilePath = path.join(__dirname, "../data/tasks.json"); ???

// Get the file path
const dataFilePath = path.resolve("data/tasks.json")

// Helper function to read tasks from JSON file
// fs.readFile reads the file asynchronously and returns a promise
// JSON.parse converts the string data back to a JavaScript array
// If file doesn't exist or has errors, return empty array

// function to get all the task data.

   async function getAllTasks() {
     try {
       //read tasks.json file using fs
       const tasks = await fs.readFile(dataFilePath, "utf8");
       return JSON.parse(tasks);
     } catch (error) {
       return error
     }
   }

// ENDPOINTS
// 1- get all tasks

router.get("/", async (req, res) => {
  try {
 
  const tasks = await getAllTasks();

  res.status(200).json(allTasks)
  } catch(error) {
    res.status(400).json(error)
  }
})

// 2- get one task

router.get("/:id", async (req, res) => {
  const { id } = req.params
  const tasks = await getAllTasks()
  const currentTask = tasks.find((task) => task.id === Number(id))

  // if we can't find the task
  if(!currentTask) {
    return res.status(404).json({ error: "Task not found"})
  }

  res.json(currentTask)
})

// Helper function to write tasks to JSON file
// JSON.stringify converts the array back to a string with nice formatting (null, 2)
// fs.writeFile writes the data to the file asynchronously

// 3- add new task function
async function writeTasks(tasks) {
  await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2));
  }

  // Add new task
  router.post("/", async (req, res) => {
    try { 
    //1. Get all the information of the task using req.body
    const { title, description, status, priority } = req.body

    //2. verify if the information is there
    if (!title || !description) {
      return res.status(400).json({error: "Missing required fields"});
    }

    //3. get all the tasks, get task's ID, then increment
     const tasks = await getAllTasks();
     // if there are tasks, get the one with the highest ID number then add one, if there are no tasks, make newID = 1.
     const newID = tasks.length > 0 ? Math.max(...tasks.map((s) => parseInt(s.id))) + 1 : 1;

    //4. Build the new task information in one variable
    const newTask = {
      id: newID,
      title,
      description,
      status: status || null,
      priority: priority || null,
      createdAt: new Date().toISOString(), // Current timestamp
      updatedAt: new Date().toISOString(),
    };

    //5. add the new task to the list of all tasks using writetasks function
    tasks.push(newTask)
    await writeTasks(tasks)

    //6. return all tasks with the new task added
    res.status(201).json(newTask)

    } catch(error) {
      res.status(500).json(error)
    }
  })


  // 4- update a task (PUT)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    // 1. Validate incoming data (ensure title and description are present)
    if (!title || !description) {
      return res.status(400).json({ error: "Missing required fields (title and description) for update." });
    }

    // 2. Get all existing tasks
    const tasks = await getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.id === Number(id));

    // 3. Check if the task exists
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found." });
    }

    // 4. Create the updated task object, maintaining the original ID and creation date
    const updatedTask = {
      id: Number(id), // Ensure the ID remains the correct number
      title,
      description,
      status: status || tasks[taskIndex].status, // Use new status or keep existing one
      priority: priority || tasks[taskIndex].priority, // Use new priority or keep existing one
      createdAt: tasks[taskIndex].createdAt, // Preserve original creation timestamp
      updatedAt: new Date().toISOString(), // Set new update timestamp
    };

    // 5. Replace the old task object in the array with the new one
    tasks[taskIndex] = updatedTask;

    // 6. Write the updated array back to the JSON file
    await writeTasks(tasks);

    // 7. Return the newly updated task
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ error: "Internal server error updating task" });
  }
});


// Helper function to validate task data
// This function checks if the required fields are present and valid
// function validateTaskData(taskData) {
//   const requiredFields = ["title", "description", "status", "priority"];
//   const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
//   const validPriorities = ["low", "medium", "high", "urgent"];

//   // Check if all required fields are present
//   for (const field of requiredFields) {
//     if (!taskData[field]) {
//       return { isValid: false, error: `Missing required field: ${field}` };
//     }
//   }

//   // Validate status
//   if (!validStatuses.includes(taskData.status)) {
//     return {
//       isValid: false,
//       error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
//     };
//   }

//   // Validate priority
//   if (!validPriorities.includes(taskData.priority)) {
//     return {
//       isValid: false,
//       error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
//     };
//   }

//   return { isValid: true };
// }

// // GET /api/tasks - Get all tasks
// // This route handles GET requests to /api/tasks
// // req = request object (contains data sent by client)
// // res = response object (used to send data back to client)
// router.get("/tasks", async (req, res) => {
//   try {
//     const tasks = await getAllTasks();

//     // Add query parameter support for filtering
//     let filteredTasks = tasks;

//     // Filter by status if provided
//     if (req.query.status) {
//       filteredTasks = filteredTasks.filter(
//         (task) => task.status === req.query.status
//       );
//     }

//     // Filter by priority if provided
//     if (req.query.priority) {
//       filteredTasks = filteredTasks.filter(
//         (task) => task.priority === req.query.priority
//       );
//     }

//     // Filter by assignedTo if provided
//     if (req.query.assignedTo) {
//       filteredTasks = filteredTasks.filter((task) =>
//         task.assignedTo
//           .toLowerCase()
//           .includes(req.query.assignedTo.toLowerCase())
//       );
//     }

//     res.json({
//       success: true,
//       count: filteredTasks.length,
//       data: filteredTasks,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Error retrieving tasks",
//     });
//   }
// });

// // GET /api/tasks/:id - Get task by ID
// // :id is a route parameter - it captures the value from the URL
// // Example: /api/tasks/1 will set req.params.id = "1"
// router.get("/tasks/:id", async (req, res) => {
//   try {
//     const { id } = req.params; // Extract the ID from the URL
//     const tasks = await getAllTasks();
//     const task = tasks.find((task) => task.id === id); // Find task with matching ID

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         error: "Task not found",
//       }); // 404 = Not Found
//     }

//     res.json({
//       success: true,
//       data: task,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Error retrieving task",
//     }); // 500 = Server Error
//   }
// });

// // POST /api/tasks - Create new task
// // POST requests are used to create new resources
// // req.body contains the data sent in the request body
// router.post("/api/tasks", async (req, res) => {
//   try {
//     // TODO: Implement task creation
//     // 1. Extract data from req.body (title, description, status, priority, etc.)

//     const {title, description, status, priority,} = req.body

//     // 2. Validate the data using validateTaskData function

//      if (!title || !description || !status || !priority) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     // 3. Get all existing tasks using getAllTasks()

//     let tasks = getAllTasks

//     const students = await getAllTasks();

//     // 4. Generate a new ID for the task

//      const newID =
//       tasks.length > 0
//         ? Math.max(...tasks.map((s) => parseInt(s.id))) + 1
//         : 1;

//     // 5. Create a new task object with all required fields

//     const newTask = {
//       id: newID,
//       title,
//       description,
//       status,
//       priority: priority || null,
//       createdAt: new Date().toISOString(), // Current timestamp
//       updatedAt: new Date().toISOString(),
//     };

//     // 6. Add the task to the tasks array

//     tasks.push(newTask);
    
//     // 7. Save to file using writeTasks()
//     await writeTasks(tasks);
//     // 8. Send success response with status 201

//      res.status(201).json(newTask);
//   } catch (error) {
//     res.status(500).json({ error, message: "Error creating task" });
//   }
// });

//     // Temporary response - remove this when you implement the above
//     res.status(501).json({
//       success: false,
//       error:
//         "POST endpoint not implemented yet - implement task creation above",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Error creating task",
//     }); // 500 = Server Error
//   }
// });

// PUT /api/tasks/:id - Update task
// PUT requests are used to update existing resources
// The entire resource is replaced with the new data
router.put("/:id", async (req, res) => {
      try {
    // TODO: Implement task update
    // 1. Extract the task ID from req.params
        const { id } = req.params;

        // 2. Get the update data from req.body
      
    //const { id } = req.params;
    const updatedTaskData = req.body;
    
    //const updateData = req.body;

    // 3. Validate the data if status or priority is being updated

    if (!updatedTaskData.title || !updatedTaskData.description || !updatedTaskData.status || !updatedTaskData.priority) {
         return res.status(400).json({ message: 'Missing required fields for update' });
    }

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    // 4. Get all tasks and find the task by ID

    const tasks = await readTasks();

    // 5. Check if task exists, return 404 if not found

    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }
    // 6. Update the task with new data
    const currentTask = tasks[taskIndex];
    //title, description, status, priority

    currentTask.title = title || currentTask.title;
    currentTask.description = description || currentTitle.description;
    currentTask.status = status !== undefined ? status : currentTask.status;
    currentTask.priority = priority || currentTask.priority;
    currentTask.updatedAt = new Date().toISOString(); // Update timestamp



    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTaskData };

    // 7. Save to file using writeTasks()

    await writeTasks(tasks);

    // 8. Send success response with the updated task

    res.json(tasks[taskIndex]);

    // // Temporary response - remove this when you implement the above
    // res.status(501).json({
    //   success: false,
    //   error: "PUT endpoint not implemented yet - implement task update above",
    // });
    res.status(201).json(updatedTaskData)
  } catch (error) {
    res.status(500).json({ error, message: "Error updating task"}); // 500 = Server Error
  }
});

 
// DELETE /api/tasks/:id - Delete task
// DELETE requests are used to remove resources
router.delete("/:id", async (req, res) => {
  try {
    // TODO: Implement task deletion
    // 1. Extract the task ID from req.params

    const taskId = parseInt(req.params.id);

    // 2. Get all tasks and find the task by ID

    const tasks = await getAllTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    // 3. Check if task exists, return 404 if not found

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }
    // 4. Store the task before deletion (for response)

    const deletedTask = tasks[taskIndex];

    // 5. Remove the task from the array

    tasks.splice(taskIndex, 1);

    // 6. Save to file using writeTasks()

    await writeTasks(tasks);

    // 7. Send success response with the deleted task

    res.json(deletedTask);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error
    }); // 500 = Server Error
  }

  //   // Temporary response - remove this when you implement the above
  //   res.status(501).json({
  //     success: false,
  //     error:
  //       "DELETE endpoint not implemented yet - implement task deletion above",
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     success: false,
  //     error: "Error deleting task",
  //   }); // 500 = Server Error
  // }
});

export default router;
