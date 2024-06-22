import React from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

const Auth = () => {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch(e => {
            console.error(e);
        });
    };

    return (
        <button onClick={handleLogin}>
            Sign In
        </button>
    );
};

export default Auth;  
