import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Homepage from "./pages/Homepage.jsx";
import Transactions from "./pages/Transactions.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import { AuthProvider } from "./context/authProvider.jsx";
import WidgetSetupIOS from "./components/WidgetSetupIOS.jsx";
import QuickLog from "./components/QuickLog.jsx";
import WidgetSetupANDROID from "./components/WidgetSetupANDROID.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/dashboard/transactions",
    element: <Transactions />,
  },
  {
    path: "/register",
    element: <RegistrationPage />,
  },
  {
    path: "/setup-widget/ios",
    element: <WidgetSetupIOS />,
  },
  {
    path: "/setup-widget/android",
    element: <WidgetSetupANDROID />,
  },
  {
    path: "/quick-log",
    element: <QuickLog />,
  },
]);

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </AuthProvider>,
);
