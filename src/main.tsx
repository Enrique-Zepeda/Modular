import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { store } from "./app/store.ts";
import { Provider } from "react-redux";

import App from "./App.tsx";

import { getInitialColorTheme, applyColorTheme } from "./features/theme/colorTheme";

const theme = localStorage.getItem("theme") ?? "light";
document.documentElement.classList.add(theme);

applyColorTheme(getInitialColorTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
