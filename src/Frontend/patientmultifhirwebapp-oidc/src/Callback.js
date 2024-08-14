// src/Callback.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userManager from './authConfig';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        userManager.signinRedirectCallback().then(user => {
            console.log('User loaded after callback:', user);
            navigate('/'); // Redirect to home page after successful login  
        }).catch(error => {
            console.error('Error during the callback handling:', error);
        });
    }, [navigate]);

    return <div>Loading...</div>;
};

export default Callback;  
