import React, { createContext, useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { API_URL } from "./utils/api";
import "./index.css";

const AuthConfigContext = createContext({
  googleEnabled: false,
  googleClientId: null,
  demoVerifyEnabled: true,
});

export function useAuthConfig() {
  return useContext(AuthConfigContext);
}

function isValidGoogleClientId(id) {
  return (
    typeof id === "string" &&
    id.includes(".apps.googleusercontent.com") &&
    !id.startsWith("YOUR_") &&
    !id.startsWith("your_")
  );
}

function RootProviders() {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const initialClientId = isValidGoogleClientId(envClientId)
    ? envClientId
    : null;

  const [authConfig, setAuthConfig] = useState({
    googleEnabled: Boolean(initialClientId),
    googleClientId: initialClientId,
    demoVerifyEnabled: true,
  });

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/auth/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const resolvedId = isValidGoogleClientId(data.googleClientId)
          ? data.googleClientId
          : initialClientId;
        setAuthConfig({
          googleEnabled: Boolean(resolvedId),
          googleClientId: resolvedId,
          demoVerifyEnabled: data.demoVerifyEnabled !== false,
        });
      })
      .catch(() => {
        // Offline or backend unreachable; keep defaults.
      });

    return () => {
      active = false;
    };
  }, [initialClientId]);

  const content = (
    <AuthConfigContext.Provider value={authConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthConfigContext.Provider>
  );

  if (authConfig.googleEnabled && authConfig.googleClientId) {
    return (
      <GoogleOAuthProvider clientId={authConfig.googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootProviders />
  </React.StrictMode>
);
