import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app";
import { AuthProvider } from "./context/AuthContext"; // Assure-toi que le chemin est bon

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <AuthProvider>
    <App />
  </AuthProvider>
  // </React.StrictMode>
);
