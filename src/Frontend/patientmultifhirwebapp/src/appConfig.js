// src\Frontend\patientmultifhirwebapp\src\appConfig.js

const appConfig = {
    facilities: process.env.REACT_APP_FACILITIES.split(','), // Split the comma-separated string into an array
    scopes: process.env.REACT_APP_FHIR_SCOPES.split(','), // Split the comma-separated string into an array
    knownAuthorities: process.env.REACT_APP_KNOWN_AUTHORITIES.split(','), // Split the comma-separated string into an array
    redirectURL: process.env.REACT_APP_REDIRECT_URL,
    tokenURL: process.env.REACT_APP_TOKEN_URL,
    authorityURL: process.env.REACT_APP_AUTHORITY_URL,
    clientID: process.env.REACT_APP_CLIENT_ID,
    postLogoutRedirectURL: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URL,
    getFHIRScopeURL: process.env.REACT_APP_GETFHIRSCOPE_URL,
};

export default appConfig;