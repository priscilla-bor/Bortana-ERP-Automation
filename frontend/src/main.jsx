import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';

// 1. Static Instance: This creates the login manager once 
// to prevent data loss during page updates.
const msalInstance = new PublicClientApplication(msalConfig);

// 2. System Startup: This starts the authentication engine before the application displays.
msalInstance.initialize().then(() => {
    
    // 3. Handler: This checks the URL for a login code and set the user information in MSAL.
    // It captures the token and closes the popup window automatically.
    msalInstance.handleRedirectPromise().then((response) => {
        if (response) {
            msalInstance.setActiveAccount(response.account);
        }

        // 4. UI Rendering: This displays the portal  fter the authentication check is complete.
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);

        root.render(
            <React.StrictMode>
                <MsalProvider instance={msalInstance}>
                    <App />
                </MsalProvider>
            </React.StrictMode>
        );
    }).catch((err) => {
        // Log authentication errors but still show the site.
        console.error("Authentication Error:", err);
        
        const container = document.getElementById('root');
        ReactDOM.createRoot(container).render(
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        );
    });
});