const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const {calculateHyperPeriod, rateMonotonicScheduling, earliestDeadlineFirstScheduling, computeMetrics} = require('./controllers/functions')


app.post('/schedule', (req, res) => {
    const tasks = req.body.tasks.map(task => ({
        name: task.name,
        executionTime: parseInt(task.executionTime),
        period: parseInt(task.period),
        remainingTime: 0,
        deadline: 0
    }));
    console.log(tasks);
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
