import React from "react";
import ReactDOM from "react-dom";
import App from "./App"; // Ensure this points to `App.tsx`
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
