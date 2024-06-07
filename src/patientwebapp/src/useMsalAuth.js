import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export const useMsalAuth = () => {
    const { instance, accounts } = useMsal();

    const login = () => {
        instance.loginPopup(loginRequest).catch((e) => {
            console.error("Login error:", e);
        });
    };

    const logout = () => {
        instance.logoutPopup().catch((e) => {
            console.error("Logout error:", e);
        });
    };

    const getAccessToken = async () => {
        const request = {
            ...loginRequest,
            account: accounts[0],
        };

        try {
            const response = await instance.acquireTokenSilent(request);
            return response.accessToken;
        } catch (e) {
            console.error("Token acquisition error:", e);
            if (e.name === "InteractionRequiredAuthError") {
                try {
                    const response = await instance.acquireTokenPopup(request);
                    return response.accessToken;
                } catch (popupError) {
                    console.error("Popup token acquisition error:", popupError);
                    throw popupError;
                }
            } else {
                throw e;
            }
        }
    };

    return { login, logout, getAccessToken, accounts };
};  
