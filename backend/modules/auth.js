const msal = require('@azure/msal-node');
const session = require('express-session'); 

// 1. MSAL Configuration
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID || 'de2ef060-9e14-41e9-8a41-db8178652787',
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID || '49fce718-877c-4046-99b5-a61803c030ff'}`,
        clientSecret: process.env.CLIENT_SECRET, // Ensure this is in your EC2 .env
    }
};

const pca = new msal.ConfidentialClientApplication(msalConfig);

// 2. Redirect Logic - Use relative path or dynamic IP
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback";

const authMiddleware = {
    login: async (req, res) => {
        const authCodeUrlParameters = {
            scopes: ["user.read"],
            redirectUri: REDIRECT_URI,
        };
        const response = await pca.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(response);
    },

    callback: async (req, res) => {
        const tokenRequest = {
            code: req.query.code,
            scopes: ["user.read"],
            redirectUri: REDIRECT_URI,
        };

        try {
            const response = await pca.acquireTokenByCode(tokenRequest);
            req.session.user = response.account;
            
            // FIX: Redirect to the AWS site dashboard, not localhost
            // Using '/dashboard' works because the browser stays on the current domain
            res.redirect('/dashboard'); 
        } catch (error) {
            console.error("MSAL Callback Error:", error);
            res.status(500).send("Authentication failed");
        }
    },

    isAuthenticated: (req, res, next) => {
        if (req.session.user) {
            return next();
        }
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = authMiddleware;