import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

const Header = () => {
    const { instance, accounts } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect(loginRequest);
    };

    return (
        <header className="app-header">
            <h1>Demo App for B2C Authentication for Multiple FHIR Services</h1>
            <div className="user-info">
                {accounts.length > 0 ? (
                    <span>Welcome, {accounts[0].username}</span>
                ) : (
                    <button onClick={handleLogin}>Login</button>
                )}
            </div>
        </header>
    );
};

export default Header;  
