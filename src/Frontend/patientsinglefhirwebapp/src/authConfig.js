export const returnURL = (window.location.host.includes("localhost") ? "http://localhost:3000" : "https://wonderful-island-0a2864600-preview.eastasia.5.azurestaticapps.net");

export const msalConfig = {
    auth: {
        clientId: "9ca401fb-2730-4c00-8b24-4738a1b4c539",
        authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1_userflow_sign-up_sign-in", // Replace with your B2C sign-up/sign-in policy  
        knownAuthorities: [
            "https://uvancehlpfdemo.b2clogin.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1_userflow_sign-up_sign-in"
        ],
        //redirectUri: "https://wonderful-island-0a2864600-preview.eastasia.5.azurestaticapps.net",
        redirectUri: returnURL,
        //postLogoutRedirectUri: "https://wonderful-island-0a2864600-preview.eastasia.5.azurestaticapps.net",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ["openid", "profile", "https://uvancehlpfdemo.onmicrosoft.com/9ca401fb-2730-4c00-8b24-4738a1b4c539/patient.all.read"],
};

export const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1_SIGNUP_SIGNIN",
        forgotPassword: "B2C_1_PASSWORDRESET",
        editProfile: "B2C_1_PROFILEEDIT",
    },
    authorities: {
        signUpSignIn: {
            authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/B2C_1_SIGNUP_SIGNIN",
        },
        forgotPassword: {
            authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/B2C_1_PASSWORDRESET",
        },
        editProfile: {
            authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/B2C_1_PROFILEEDIT",
        },
    },
};