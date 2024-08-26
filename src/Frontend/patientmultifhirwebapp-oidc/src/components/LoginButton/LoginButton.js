// src/components/LoginButton/LoginButton.js 

import React from 'react';

const LoginButton = ({ user, handleLogin, handleLogout, handleDeleteAccount }) => (
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

export default LoginButton;