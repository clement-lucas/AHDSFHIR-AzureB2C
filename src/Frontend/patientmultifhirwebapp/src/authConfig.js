// src/authConfig.js

import { UserManager } from 'oidc-client';

const oidcConfig = {
    authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1a_signup_signin/v2.0", // Ensure this is correct  
    client_id: "661862bb-946b-4580-8bec-b7ae75905ab6",
    redirect_uri: "https://green-sea-0cde26500.5.azurestaticapps.net/callback", // Ensure this is correct  
    response_type: "code",
    scope: "openid profile", 
    post_logout_redirect_uri: "https://green-sea-0cde26500.5.azurestaticapps.net",
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: true,
};

const userManager = new UserManager(oidcConfig);
export default userManager;  
