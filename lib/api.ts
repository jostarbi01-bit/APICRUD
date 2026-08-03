import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor matching Better Auth Context pipelines
apiClient.interceptors.request.use(
  (config) => {
    // Dynamic runtime token injection layer can be bound here
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Error Catching Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Pipeline Exception Intercepted:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
