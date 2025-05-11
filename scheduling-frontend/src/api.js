import axios from "axios";

export const fetchSchedule = async (taskData) => {
  try {
    const response = await axios.post("http://localhost:5000//schedule", taskData);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return null;
  }
};
