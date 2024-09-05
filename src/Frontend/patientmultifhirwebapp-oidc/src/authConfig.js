// src/authConfig.js  
import { UserManager, WebStorageStateStore } from 'oidc-client';
import appConfig from './appConfig';

const signInSignUpPolicy = {
    authority: appConfig.authorityURL,
    client_id: appConfig.clientID,
    redirect_uri: appConfig.redirectURL,
    response_type: appConfig.oidcResponseType,
    scope: appConfig.oidcLoginScope,
    post_logout_redirect_uri: appConfig.homeURL,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const deleteUserPolicy = {
    authority: appConfig.deleteAuthorityURL,
    client_id: appConfig.clientID,
    redirect_uri: appConfig.homeURL,
    response_type: appConfig.oidcResponseType,
    scope: appConfig.oidcDeleteUserScope,
    post_logout_redirect_uri: appConfig.homeURL,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const signInSignUpManager = new UserManager(signInSignUpPolicy);
const deleteUserManager = new UserManager(deleteUserPolicy);

signInSignUpManager.events.addUserLoaded((user) => {
    console.log("User loaded from signInSignUpManager", user);
});

signInSignUpManager.events.addUserUnloaded(() => {
    console.log("User unloaded from signInSignUpManager");
});

deleteUserManager.events.addUserLoaded((user) => {
    console.log("User loaded from deleteUserManager", user);
});

deleteUserManager.events.addUserUnloaded(() => {
    console.log("User unloaded from deleteUserManager");
});

export { signInSignUpManager, deleteUserManager };
