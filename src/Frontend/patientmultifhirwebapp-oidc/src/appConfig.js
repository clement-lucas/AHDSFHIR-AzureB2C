// src/appConfig.js

const appConfig = {
    facilities: ['1001', '1002', '1003', '1004'],
    oidcResponseType: 'code',
    oidcLoginScope: 'openid profile',
    refreshTokenScope: `openid offline_access ${process.env.REACT_APP_FHIR_SCOPE}`,
    redirectURL: process.env.REACT_APP_REDIRECT_URL,
    tokenURL: process.env.REACT_APP_TOKEN_URL,
    authorityURL: process.env.REACT_APP_AUTHORITY_URL,
    clientID: process.env.REACT_APP_CLIENT_ID,
    postLogoutRedirectURL: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URL,
    // other configurations
};

export default appConfig;