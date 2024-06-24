import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

// Get the container element  
const container = document.getElementById('root');

// Create a root  
const root = createRoot(container);

// Render the app using the new root API  
root.render(
    <MsalProvider instance={msalInstance}>
        <App />
    </MsalProvider>
);