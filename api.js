import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const api = axios.create({
  baseURL: "https://api.getpostman.com",
  headers: {
    "X-Api-Key": process.env.POSTMAN_API_KEY,
  },
});

export default api;
