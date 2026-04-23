const msal = require('@azure/msal-node');// Microsoft Authentication Library for Node.js
const session = require('express-session');

// 1. MSAL Configuration
const msalConfig = {
    auth: {
        clientId: 'de2ef060-9e14-41e9-8a41-db8178652787', //  Client ID-who is the app
        authority: 'https://login.microsoftonline.com/49fce718-877c-4046-99b5-a61803c030ff', // Tenant ID- where it allowed to talk
        clientSecret: process.env.CLIENT_SECRET, // secret key for the app, stored in .env file
    }
};

const pca = new msal.ConfidentialClientApplication(msalConfig); // Create an instance of a class -- ConfidentialClientApplication

// 2. Redirect Logic

const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback";

const authMiddleware = {
    // Starts the login process

    // Login Founction
    login: async (req, res) => {
        const authCodeUrlParameters = {
            scopes: ["user.read"],
            redirectUri: REDIRECT_URI,
        };
        const response = await pca.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(response);
    },

    // Handles the response from Azure
    callback: async (req, res) => {
        const tokenRequest = {
            code: req.query.code, //req,query looks for code after "?" in the url
            scopes: ["user.read"], // scopes that the app is requesting
            redirectUri: REDIRECT_URI,
        };

        try {
            const response = await pca.acquireTokenByCode(tokenRequest);
            // Store user info in the session
            req.session.user = response.account;
            // Redirect to the Engineering Dashboard (Vite Dev Server)
            res.redirect('http://localhost:5173/dashboard');
        } catch (error) {
            console.error(error);
            res.status(500).send("Authentication failed");
        }
    },

    // Protects your Dashboard API routes
    isAuthenticated: (req, res, next) => {
        if (req.session.user) {
            return next();
        }
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = authMiddleware;