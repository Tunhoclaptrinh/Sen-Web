import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import store from "./store";
import { injectStore } from "./config/axios.config";

// Import CSS
import "antd/dist/reset.css";
import "./assets/styles/global.css";
import "./assets/styles/antd-override.css";

// Inject store vào axios config để tránh circular dependency
injectStore(store);

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <HelmetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </Provider>
    </React.StrictMode>,
  );
}
