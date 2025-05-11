import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./GanttChart.css"; // Import styling

const GanttChart = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return <p>No scheduling data available.</p>;
  }

  return (
    <div className="gantt-chart-container">
      <h2 className="gantt-chart-title">📊 Gantt Chart</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={schedule}>
          <XAxis dataKey="start" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
          <YAxis dataKey="task" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="task" fill="#4F46E5" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GanttChart;


