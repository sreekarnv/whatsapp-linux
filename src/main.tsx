import "./scss/global.scss";

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import App from "./app/app";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
