// src\Frontend\patientmultifhirwebapp\src\components\CallbackPage\CallbackPage.js  

import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';

const CallbackPage = () => {
    const { instance } = useMsal();
    const navigate = useNavigate();

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                await instance.handleRedirectPromise();
                navigate('/');  // Redirect to home page after handling the redirect  
            } catch (error) {
                console.error('Error handling redirect:', error);
                navigate('/');  // Redirect to home page even if there's an error  
            }
        };

        handleRedirect();
    }, [instance, navigate]);

    return (
        <div className="callback-page">
            <h2>Processing login...</h2>
        </div>
    );
};

export default CallbackPage;  
