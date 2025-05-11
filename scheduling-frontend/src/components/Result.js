import React from "react";
const Results = ({ results }) => {
    return (
      <div className="p-4 border rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-3">Scheduling Results</h2>
        <p>✅ <strong>Schedulability:</strong> {results.deadline_misses === 0 ? "Yes" : "No"}</p>
        <p>📉 <strong>Deadline Misses:</strong> {results.deadline_misses}</p>
        <p>⚙️ <strong>CPU Utilization:</strong> {results.cpu_utilization}%</p>
      </div>
    );
  };
  
  export default Results;
  