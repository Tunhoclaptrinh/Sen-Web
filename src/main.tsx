import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import store from "./store";
import { injectStore } from "./config/axios.config";

// Import CSS
import "./assets/styles/variables.css";
import "./styles/global.less";
import "./styles/antd-custom.less";
import { seedData } from './utils/seeder';

// Expose seeder for demo purposes
(window as any).seedDemoData = seedData;

// Inject store vào axios config để tránh circular dependency
injectStore(store);

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}
