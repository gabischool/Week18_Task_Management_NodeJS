import express from "express";
import tasksRouter from "./routes/tasks.js";

const app = express();
app.use(express.json());

app.use("/api", tasksRouter);

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
