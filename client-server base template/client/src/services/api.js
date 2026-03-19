import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getUsers = async () => {
  const response = await API.get("/users");
  return response.data;
};
