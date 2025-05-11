const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// Function to compute scheduling for both RM and EDF
const scheduleTasks = (tasks, algorithm) => {
    let schedule = [];
    let sortedTasks = [...tasks];

    if (algorithm === "RM") {
        sortedTasks.sort((a, b) => a.period - b.period); // RM: Shortest period first
    } else if (algorithm === "EDF") {
        sortedTasks.sort((a, b) => a.deadline - b.deadline); // EDF: Earliest deadline first
    }

    let currentTime = 0;
    for (const task of sortedTasks) {
        schedule.push({ task: task.name, start: currentTime, end: currentTime + task.executionTime });
        currentTime += task.executionTime;
    }

    return {
        schedule,
        deadline_misses: 0, // Future improvement: Implement deadline checking
        cpu_utilization: (tasks.reduce((sum, task) => sum + task.executionTime, 0) / currentTime) * 100,
    };
};

// API Endpoint for Scheduling
app.post("/schedule", (req, res) => {
    const { tasks } = req.body;

    if (!tasks || tasks.length === 0) {
        return res.status(400).json({ error: "No tasks provided." });
    }

    console.log("Received tasks:", tasks);

    // Compute results for both algorithms
    const rmResults = scheduleTasks(tasks, "RM");
    const edfResults = scheduleTasks(tasks, "EDF");

    res.json({
        RM: rmResults,
        EDF: edfResults,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
