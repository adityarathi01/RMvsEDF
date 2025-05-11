import React, { useState } from "react";
import "./TaskForm.css"; // Import CSS for styling

const TaskForm = ({ onSchedule }) => {
  const [task, setTask] = useState({ name: "", executionTime: "", period: "" });
  const [taskList, setTaskList] = useState([]); // Store all added tasks
  const [algorithm, setAlgorithm] = useState("RM"); // Default scheduling algorithm

  // Handle input changes
  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  // Handle form submission (Add task to the list)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (task.name && task.executionTime && task.period) {
      setTaskList([...taskList, task]); // Add task to the list
      setTask({ name: "", executionTime: "", period: "" }); // Reset input fields
    }
  };

  // Handle scheduling selection
  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
  };

  // Handle deleting a task from the list
  const handleDeleteTask = (index) => {
    const updatedList = taskList.filter((_, i) => i !== index); // Remove task at index
    setTaskList(updatedList);
  };

  // Send all tasks and selected algorithm to scheduling when submitting
  const handleRunScheduling = () => {
    if (taskList.length > 0) {
      onSchedule({ tasks: taskList, algorithm }); // Send both tasks and algorithm
    } else {
      alert("Please add at least one task before running scheduling.");
    }
  };

  return (
    <div className="task-form-container">
      <h2 className="task-form-title">📝 Add a Task</h2>

      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          name="name"
          placeholder="Task Name"
          value={task.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="executionTime"
          placeholder="Execution Time (ms)"
          value={task.executionTime}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="period"
          placeholder="Period (ms)"
          value={task.period}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Display the list of added tasks */}
      {taskList.length > 0 && (
        <div className="task-list">
          <h3>📋 Task List</h3>
          <ul>
            {taskList.map((t, index) => (
              <li key={index} className="task-item">
                <strong>{t.name}</strong>: {t.executionTime}ms, {t.period}ms
                <button className="delete-button" onClick={() => handleDeleteTask(index)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>

          <button className="run-button" onClick={handleRunScheduling}>
             Run Scheduling
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskForm;





