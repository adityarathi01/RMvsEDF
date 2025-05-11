import React, { useState } from "react";
import "./App.css";


function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [executionTime, setExecutionTime] = useState("");
  const [period, setPeriod] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const addTask = () => {
    if (!taskName || !executionTime || !period) return;
    setTasks([...tasks, { name: taskName, executionTime, period }]);
    setTaskName("");
    setExecutionTime("");
    setPeriod("");
  };

  const taskColors = {};
  const getTaskColor = (taskName) => {
    if (!taskColors[taskName]) {
      const colors = ["#4caf50", "#2196f3", "#ff9800", "#e91e63", "#9c27b0"];
      taskColors[taskName] = colors[Object.keys(taskColors).length % colors.length];
    }
    return taskColors[taskName];
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const runScheduling = async () => {
    try {
      const response = await fetch("http://localhost:5000/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      const result = await response.json();
      setSchedule(result);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const renderGanttChart = (data, title, stats = {}) => {
    const columnsPerRow = 30; // Change based on screen size or preference
    const rows = Math.ceil(data.length / columnsPerRow);
  
    const rowsContent = Array.from({ length: rows }).map((_, rowIdx) => {
      const start = rowIdx * columnsPerRow;
      const slice = data.slice(start, start + columnsPerRow);
  
      return (
        <div key={rowIdx} className="gantt-row-wrapper">
          <div className="gantt-row">
            {slice.map((task, i) => {
              const time = start + i;
              const missedTasks = Object.entries(stats)
                .filter(([_, s]) => s.missedAt?.includes(time))
                .map(([name]) => name);
              const isMiss = missedTasks.length > 0;
  
              return (
                <div
                  key={time}
                  className={`gantt-block ${task ? "filled" : "idle"} ${isMiss ? "missed" : ""}`}
                  style={{ backgroundColor: task ? getTaskColor(task) : "#bbb" }}
                  title={`Time ${time + 1}${isMiss ? ` - Missed: ${missedTasks.join(", ")}` : ""}`}
                >
                  {task || "Idle"}
                  {isMiss && <span className="miss-icon"></span>}
                </div>
              );
            })}
          </div>
  
          <div className="gantt-time-axis">
            {slice.map((_, i) => (
              <div key={i} className="gantt-time-label">{start + i + 1}</div>
            ))}
          </div>
        </div>
      );
    });
  
    return (
      <div className="gantt-chart">
        <h4>{title}</h4>
        {rowsContent}
      </div>
    );
  };
  
  
  
  

  const renderStats = (stats, metrics) =>
    Object.entries(stats).map(([task, stat]) => {
      const throughput = (metrics.throughput[task] * 100).toFixed(2);
      const misses = stat.deadlineMiss;
      return (
        <div key={task} style={{ marginBottom: "1rem" }}>
          <div className="metric-label">{task} - Throughput</div>
          <div className="metric-bar">
            <div className="metric-fill throughput-bar" style={{ width: `${throughput}%` }}>
              <span className="metric-percent">{throughput}%</span>
            </div>
          </div>
          <div className="metric-label">{task} - Deadline Misses</div>
          <div className="metric-bar">
            <div className="metric-fill deadline-bar" style={{ width: `${Math.min(100, misses * 10)}%` }}>
              <span className="metric-percent">{misses}</span>
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="container">
      <header>
        <h1> Real-Time Scheduling: RM vs. EDF</h1>
      </header>

      <div className="main-layout">
        <div className="input-wrapper">
          <div className="input-section">
            <input
              type="text"
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Execution Time"
              value={executionTime}
              onChange={(e) => setExecutionTime(e.target.value)}
            />
            <input
              type="number"
              placeholder="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
            <button className="add-task-btn" onClick={addTask}>➕ Add Task</button>
          </div>

          <div className="task-list-section">
            <h3>📋 Task List</h3>
            {tasks.length === 0 ? (
              <p className="no-tasks">No tasks added yet!</p>
            ) : (
              <ul>
                {tasks.map((task, index) => (
                  <li key={index} className="task-item">
                    <span>
                      {task.name}: <b>{task.executionTime}ms</b>, <b>{task.period}ms</b>
                    </span>
                    <button className="delete-task" onClick={() => removeTask(index)}>❌</button>
                  </li>
                ))}
              </ul>
            )}
            <button className="run-scheduling-btn" onClick={runScheduling}>
              ▶️ Run Scheduling
            </button>
          </div>
        </div>

        {showResults && schedule && (
          <div className="result-panel fade-in">
            <button className="back-button" onClick={() => setShowResults(false)}>🔙 Edit Tasks</button>
            <h2>📊 Scheduling Results</h2>
            <p className="hyper-period">HyperPeriod: {schedule.hyperPeriod}</p>

            <div className="panel-section">
              <h3>Rate Monotonic</h3>
              {renderGanttChart(schedule.rateMonotonic, "Rate Monotonic", schedule.rmStats)}
              <div className="metric-label">CPU Utilization</div>
              <div className="metric-bar">
                <div className="metric-fill util-bar" style={{ width: `${(schedule.rmMetrics.utilization * 100).toFixed(2)}%` }}>
                  <span className="metric-percent">{(schedule.rmMetrics.utilization * 100).toFixed(2)}%</span>
                </div>
              </div>
              {renderStats(schedule.rmStats, schedule.rmMetrics)}
            </div>

            <div className="panel-section">
              <h3>Earliest Deadline First</h3>
              {renderGanttChart(schedule.earliestDeadlineFirst, "Earliest Deadline First", schedule.edfStats)}
              <div className="metric-label">CPU Utilization</div>
              <div className="metric-bar">
                <div className="metric-fill util-bar" style={{ width: `${(schedule.edfMetrics.utilization * 100).toFixed(2)}%` }}>
                  <span className="metric-percent">{(schedule.edfMetrics.utilization * 100).toFixed(2)}%</span>
                </div>
              </div>
              {renderStats(schedule.edfStats, schedule.edfMetrics)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
