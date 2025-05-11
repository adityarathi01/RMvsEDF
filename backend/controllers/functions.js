const express = require('express');

function calculateHyperPeriod(tasks) {
    const maxPeriod = Math.max(...tasks.map(task => task.period));
    return maxPeriod*5;
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

module.exports = {calculateHyperPeriod, rateMonotonicScheduling, earliestDeadlineFirstScheduling, computeMetrics}