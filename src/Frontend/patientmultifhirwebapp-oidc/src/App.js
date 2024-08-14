// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import userManager from './authConfig';
import appConfig from './appConfig';
import Callback from './components/Callback/Callback';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './styles.css';
import MainComponent from './components/MainComponent/MainComponent';

const facilities = appConfig.facilities;

const App = () => {
    const [patientDataList, setPatientDataList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        userManager.events.addUserLoaded(user => {
            console.log('User loaded', user);
            setUser(user);
            fetchAllPatientData(user.refresh_token); // Fetch data for all facilities when user is loaded
        });
        userManager.events.addUserUnloaded(() => {
            console.log('User unloaded');
            setUser(null);
        });
        userManager.getUser().then(user => {
            if (user) {
                console.log('User:', user);
                setUser(user);
                fetchAllPatientData(user.refresh_token); // Fetch data for all facilities when user is loaded
            }
        }).catch(error => {
            console.error('Error getting user:', error);
        });
    }, []);

    const handleLogin = () => {
        userManager.signinRedirect();
    };

    const handleLogout = () => {
        // Clear the local state
        setPatientDataList([]);
        setError(null);
        setLoading(false);
        setUser(null);

        // Perform the logout  
        userManager.signoutRedirect();
    };

    const fetchAllPatientData = async (refreshToken) => {
        setLoading(true);
        setError(null); // Clear any previous error

        try {
            const user = await userManager.getUser();
            if (user) {
                await Promise.all(facilities.map(
                    facility => fetchPatientData(refreshToken, user, facility)
                ));
            }
        } catch (e) {
            console.error('Error:', e);
            setError('An error occurred while fetching patient data. Please try again.');
            setPatientDataList([]); // Clear patient data on error
        } finally {
            setLoading(false);
        }
    }

    const fetchPatientData = async (refreshToken, user, facility) => {
        try {

            // Refresh the access token first
            const refreshedAccessToken = await refreshAccessToken(refreshToken, user.profile.sub, facility);
            console.log('Refreshed Access Token:', refreshedAccessToken);

            // Decode the refreshed access token to get the fhirUrl 
            const decodedToken = jwtDecode(refreshedAccessToken);
            console.log('Decoded Token:', JSON.stringify(decodedToken));

            const fhirUrl = decodedToken.fhirUser;

            if (!fhirUrl) {
                throw new Error('FHIR URL not found in token');
            }
            // Use the refreshed access token to fetch the FHIR data
            const response = await axios.get(fhirUrl, {
                headers: {
                    Authorization: `Bearer ${refreshedAccessToken}`,
                },
            });

            console.log('Patient Data:', response.data);

            // Update the PatientDataList with the fetched patient data
            setPatientDataList(prevPatientDataList => ({
                ...prevPatientDataList,
                [facility]: response.data
            }));

            setError(null); // Clear any previous error  

        } catch (error) {
            console.error('Error fetching patient data:', error);

            if (error.response && error.response.status === 403) {
                setError('An error occurred while fetching patient data. Looks like Access token claim issue. Please try again.');
            } else {
                setError('An error occurred while fetching patient data. Please try again.');
            }

            setPatientDataList(prevPatientDataList => {
                const newPatientDataList = { ...prevPatientDataList };
                delete newPatientDataList[facility];
                return newPatientDataList;
            });
        }
    };

    const refreshAccessToken = async (refreshToken, objectId, facilityCode) => {
        const url = appConfig.tokenURL;

        const requestBody = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: appConfig.clientID,
            scope: appConfig.refreshTokenScope,
            refresh_token: refreshToken,
            redirect_uri: appConfig.redirectURL,
            objectId: objectId,
            facilityCode: facilityCode
        });

        try {
            const response = await axios.post(url, requestBody, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            console.log('Refreshed Access Token:', response.data.access_token);
            return response.data.access_token;
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw error;
        }
    };

    return (
        <Router>
            <MainComponent
                user={user}
                error={error}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                loading={loading}
                facilities={facilities}
                patientDataList={patientDataList}
            />
            <Routes>
                <Route path="/callback" element={<Callback />} />
            </Routes>
        </Router>
    );
};

export default App;