// src/appConfig.js

const appConfig = {
    facilities: process.env.REACT_APP_FACILITIES ? process.env.REACT_APP_FACILITIES.split(',') : [],
    oidcLoginScope: process.env.REACT_APP_OIDC_LOGINSCOPE ? process.env.REACT_APP_OIDC_LOGINSCOPE.split(',').join(' ') : '',
    refreshTokenScope: process.env.REACT_APP_REFRESHTOKEN_SCOPE ? process.env.REACT_APP_REFRESHTOKEN_SCOPE.split(',').join(' ') : '',
    oidcResponseType: 'code',
    authorityURL: process.env.REACT_APP_AUTHORITY_URL,
    tokenURL: process.env.REACT_APP_TOKEN_URL,
    redirectURL: process.env.REACT_APP_REDIRECT_URL,
    homeURL: process.env.REACT_APP_HOME_URL,
    clientID: process.env.REACT_APP_CLIENT_ID,
};

export default appConfig;