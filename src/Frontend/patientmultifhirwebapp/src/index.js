// src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { UserManager } from 'oidc-client';
import userManager from './authConfig'; // Import the configured UserManager  

// Get the container element  
const container = document.getElementById('root');

// Create a root  
const root = createRoot(container);

// Render the app  
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);