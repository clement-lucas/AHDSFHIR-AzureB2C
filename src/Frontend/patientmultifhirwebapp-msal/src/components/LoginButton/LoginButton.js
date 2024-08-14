// src\Frontend\patientmultifhirwebapp\src\components\LoginButton\LoginButton.js  

import React from 'react';
import { useMsal } from '@azure/msal-react';
import appConfig from '../../appConfig'; // Import the appConfig  

const LoginButton = ({ user }) => {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect({
            scopes: ["openid", "offline_access"]
        }).catch(error => {
            console.error('Login error:', error);
        });
    };

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: "/"
        }).catch(error => {
            console.error('Logout error:', error);
        });
    };

    const handleDeleteAccount = () => {
        instance.loginRedirect({
            authority: appConfig.deleteAuthorityURL,
            scopes: ["openid"]
        }).catch(error => {
            console.error('Delete user error:', error);
        });
    };

    return (
        <div style={{ textAlign: 'center', padding: '10px' }}>
            {user ? (
                <>
                    <button onClick={handleLogout}>Logout</button>
                    <button onClick={handleDeleteAccount}>Delete Account</button>
                </>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </div>
    );
};

export default LoginButton;  
