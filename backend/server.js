const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Calculate Hyperperiod (LCM of all periods)
function calculateHyperPeriod(tasks) {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const lcm = (a, b) => (a * b) / gcd(a, b);
    return tasks.reduce((acc, task) => lcm(acc, task.period), 1);
}

// Function to implement Rate Monotonic Scheduling (RM)
function rateMonotonicScheduling(tasks, hyperPeriod) {
    tasks.sort((a, b) => a.period - b.period);
    let schedule = new Array(hyperPeriod).fill(null);
    let stats = {};
    tasks.forEach(task => stats[task.name] = { executed: 0, deadlineMiss: 0 });

    for (let time = 0; time < hyperPeriod; time++) {
        // Re-initialize task remaining time at the start of each period
        for (let task of tasks) {
            if (time % task.period === 0) {
                // Track if the task missed its deadline before resetting remaining time
                if (task.remainingTime > 0) {
                    stats[task.name].deadlineMiss++;
                    if (!stats[task.name].missedAt) stats[task.name].missedAt = [];
                    stats[task.name].missedAt.push(time - 1);
                    // Missed deadline at this time
                }
                task.remainingTime = task.executionTime;
            }
        }

        // Select the task to run (highest priority task)
        let taskToRun = tasks.find(task => task.remainingTime > 0);
        if (taskToRun) {
            schedule[time] = taskToRun.name;
            taskToRun.remainingTime--;
            stats[taskToRun.name].executed++;
        }
    }

    return { schedule, stats };
}

// Function to implement Earliest Deadline First Scheduling (EDF)
function earliestDeadlineFirstScheduling(tasks, hyperPeriod) {
    let schedule = new Array(hyperPeriod).fill(null);
    let stats = {};
    tasks.forEach(task => stats[task.name] = { executed: 0, deadlineMiss: 0 });

    for (let time = 0; time < hyperPeriod; time++) {
        // Re-initialize task remaining time at the start of each period
        for (let task of tasks) {
            if (time % task.period === 0) {
                // Track if the task missed its deadline before resetting remaining time
                if (task.remainingTime > 0) {
                    stats[task.name].deadlineMiss++;
                    if (!stats[task.name].missedAt) stats[task.name].missedAt = [];
                    stats[task.name].missedAt.push(time - 1);
                    // Missed deadline at this time
                }
                task.remainingTime = task.executionTime;
                task.deadline = time + task.period;  // Update deadline for EDF
            }
        }

        // Sort tasks by nearest deadline for EDF
        tasks.sort((a, b) => (a.deadline || Infinity) - (b.deadline || Infinity));

        // Select the task to run
        let taskToRun = tasks.find(task => task.remainingTime > 0);
        if (taskToRun) {
            schedule[time] = taskToRun.name;
            taskToRun.remainingTime--;
            stats[taskToRun.name].executed++;
        }
    }

    return { schedule, stats };
}

// Compute CPU Utilization and Throughput
function computeMetrics(schedule, stats, hyperPeriod) {
    const utilization = schedule.filter(t => t !== null).length / hyperPeriod;
    let throughput = {};
    Object.keys(stats).forEach(task => {
        throughput[task] = stats[task].executed / hyperPeriod;
    });
    return { utilization, throughput };
}

app.post('/schedule', (req, res) => {
    const tasks = req.body.tasks.map(task => ({
        name: task.name,
        executionTime: parseInt(task.executionTime),
        period: parseInt(task.period),
        remainingTime: 0,
        deadline: 0
    }));

    const hyperPeriod = calculateHyperPeriod(tasks);

    const { schedule: rmSchedule, stats: rmStats } = rateMonotonicScheduling(JSON.parse(JSON.stringify(tasks)), hyperPeriod);
    const { schedule: edfSchedule, stats: edfStats } = earliestDeadlineFirstScheduling(JSON.parse(JSON.stringify(tasks)), hyperPeriod);

    const rmMetrics = computeMetrics(rmSchedule, rmStats, hyperPeriod);
    const edfMetrics = computeMetrics(edfSchedule, edfStats, hyperPeriod);

    res.json({
        hyperPeriod,
        rateMonotonic: rmSchedule,
        earliestDeadlineFirst: edfSchedule,
        rmStats,
        edfStats,
        rmMetrics,
        edfMetrics
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
