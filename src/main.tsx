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
import "./styles/premium-ui.less";
import "./assets/styles/antd-override.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Inject store vào axios config để tránh circular dependency
injectStore(store);

// i18n
import "./i18n";

const rootElement = document.getElementById("root");

// Giả định Client ID, người dùng sẽ tự điền vào .env sau
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <Provider store={store}>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </Provider>,
  );
}
