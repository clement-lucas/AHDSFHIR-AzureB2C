import React from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import { useMsalAuth } from "./useMsalAuth";
import PatientData from "./PatientData";

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  const { login, logout } = useMsalAuth();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure B2C FHIR React App</h1>
        {isAuthenticated ? (
          <div>
            <button onClick={logout}>Logout</button>
            <PatientData />
          </div>
        ) : (
          <button onClick={login}>Login</button>
        )}
      </header>
    </div>
  );
};

export default App;  
