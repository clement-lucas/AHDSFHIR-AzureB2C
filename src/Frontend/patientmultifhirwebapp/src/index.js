// src\Frontend\patientmultifhirwebapp\src\index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import msalInstance from './msalConfig';
import './index.css';
import App from './App';

// Initialize MSAL instance before rendering the app  
msalInstance.initialize().then(() => {
    // Get the container element      
    const container = document.getElementById('root');

    // Create a root      
    const root = createRoot(container);

    // Render the app      
    root.render(
        <React.StrictMode>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </React.StrictMode>
    );
}).catch(error => {
    console.error('MSAL initialization error:', error);
});  
