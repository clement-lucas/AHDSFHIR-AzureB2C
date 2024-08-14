// src/authConfig.js

import { UserManager } from 'oidc-client';
import appConfig from './appConfig';

const oidcConfig = {
    authority: appConfig.authorityURL,
    client_id: appConfig.clientID,
    redirect_uri: appConfig.redirectURL,
    response_type: appConfig.oidcResponseType,
    scope: appConfig.oidcLoginScope,
    post_logout_redirect_uri: appConfig.homeURL,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: true,
};

const userManager = new UserManager(oidcConfig);
export default userManager;