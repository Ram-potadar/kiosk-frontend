// src/api.js
import axios from "axios";

// point this to your backend URL
const API = axios.create({
  baseURL: "https://kiosk-backend-0y2m.onrender.com/",
});

export default API;
