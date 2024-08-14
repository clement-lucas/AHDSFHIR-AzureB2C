// src/Callback.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userManager from '../../authConfig';
//import appConfig from '../../appConfig';

const Callback = () => {
    const navigate = useNavigate();
    // Get the home page URL from environment variables
    //const homePageUrl = appConfig.homeURL || '/';

    useEffect(() => {
        userManager.signinRedirectCallback().then(user => {
            console.log('User loaded after callback:', user);
            navigate(); // Redirect to home page after successful login  
        }).catch(error => {
            console.error('Error during the callback handling:', error);
        });
    }, [navigate]);

    return <div>Loading...</div>;
};

export default Callback;