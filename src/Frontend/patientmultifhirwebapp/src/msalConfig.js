// src\Frontend\patientmultifhirwebapp\src\msalConfig.js  

import { PublicClientApplication } from '@azure/msal-browser';
import appConfig from './appConfig';

const msalConfig = {
    auth: {
        clientId: appConfig.clientID,
        authority: appConfig.authorityURL,
        redirectUri: appConfig.redirectURL,
        postLogoutRedirectUri: appConfig.postLogoutRedirectURL,
        knownAuthorities: appConfig.knownAuthorities.concat(["uvancehlpfdemo.b2clogin.com"]),
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    },
    system: {
        iframeHashTimeout: 50000,
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case 'error':
                        console.error(message);
                        break;
                    case 'info':
                        console.info(message);
                        break;
                    case 'verbose':
                        console.debug(message);
                        break;
                    case 'warning':
                        console.warn(message);
                        break;
                    default:
                        break;
                }
            },
        },
    },
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;  
