import { createContext } from "react";
import { date } from "../assets/assets";

const dashboardUrlCtx = createContext("http://192.168.1.5:5000/api/dashboard/");
const userId = createContext("b95cb2a2-b4ae-4154-83be-ef1b5a4a9ba8");
const selectedTime = createContext({
  month: date.getMonth(),
  year: date.getFullYear(),
});
