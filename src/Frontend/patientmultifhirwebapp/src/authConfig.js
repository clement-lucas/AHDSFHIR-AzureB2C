import { PublicClientApplication } from '@azure/msal-browser';

export const returnURL = (window.location.host.includes("localhost") ? "http://localhost:3000" : "https://delightful-mud-070fa1200-preview.eastasia.5.azurestaticapps.net");

const msalConfig = {
    auth: {
        clientId: "661862bb-946b-4580-8bec-b7ae75905ab6",
        authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1_multi_fhirservice_sign-in",
        knownAuthorities: [
            "https://uvancehlpfdemo.b2clogin.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1_multi_fhirservice_sign-in"
        ],
        redirectUri: returnURL,
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest = {
    scopes: ["https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/user_impersonation"]
};

export const msalInstance = new PublicClientApplication(msalConfig);