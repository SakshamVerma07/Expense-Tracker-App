import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Target your local Flask API server instance
export const api = axios.create({
  baseURL: "https://expense-tracker-api-roem.onrender.com/api",
});

// Interceptor to inject the active JWT automatically into every single backend call
api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Auth session sync error:", error.message);
    }

    if (session && session.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
