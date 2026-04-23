export const msalConfig = {
    auth: {
        clientId: "de2ef060-9e14-41e9-8a41-db8178652787",
        authority: "https://login.microsoftonline.com/49fce718-877c-4046-99b5-a61803c030ff",
        redirectUri: "http://localhost:5173",
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: "sessionStorage", 
        storeAuthStateInCookie: true, 
    },
    system: {
        allowNativeBroker: false,
        // Recommended by acquire-token.md for better popup stability
        pollIntervalMilliseconds: 500 
    }
};

export const loginRequest = {
    scopes: ["User.Read"]
};