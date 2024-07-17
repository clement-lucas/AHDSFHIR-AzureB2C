import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import appConfig from './appConfig';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (code) {
                    const response = await axios.post(`${appConfig.apiBaseURL}/api/TokenCallback`, { code });
                    const { sessionToken } = response.data;

                    localStorage.setItem('sessionToken', sessionToken);
                    navigate('/'); // Redirect to home page after successful login  
                }
            } catch (error) {
                console.error('Error during the callback handling:', error);
            }
        };

        handleCallback();
    }, [navigate]);

    return <div>Loading...</div>;
};

export default Callback;  
