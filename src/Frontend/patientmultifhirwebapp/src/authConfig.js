import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
    auth: {
        clientId: "661862bb-946b-4580-8bec-b7ae75905ab6",
        authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1a_signup_signin",
        knownAuthorities: [
            "https://uvancehlpfdemo.b2clogin.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1a_signup_signin"
        ],
        redirectUri: "https://delightful-mud-070fa1200-preview.eastasia.5.azurestaticapps.net/",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest = {
    scopes: ["openid", "profile", "https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/user_impersonation"]
};

export const msalInstance = new PublicClientApplication(msalConfig);