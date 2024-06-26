// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import userManager from './authConfig';
import Callback from './Callback';
import axios from 'axios';
import PatientInfo from './PatientInfo';
import Loader from './Loader';
import { jwtDecode } from 'jwt-decode';
import './styles.css';

const facilities = ['1001', '1002', '1003', '1004'];

const App = () => {
    const [patientDataList, setPatientDataList] = useState([]);
    const [accessTokenList, setAccessTokenList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshToken, setRefreshToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        userManager.events.addUserLoaded(user => {
            console.log('User loaded', user);
            setUser(user);
            setRefreshToken(user.refresh_token);
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
                setRefreshToken(user.refresh_token);
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
        userManager.signoutRedirect();
    };

    const fetchAllPatientData = async (refreshToken) => {
        setLoading(true);
        try {
            const user = await userManager.getUser();
            if (user) {
                // Promise.allを使用して並列に処理
                await Promise.all(facilities.map(
                    facility => fetchPatientData(refreshToken, user, facility)
                ));
            }
        } catch (e) {
            console.error('Error:', e);
            setError('An error occurred while fetching patient data. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const fetchPatientData = async (refreshToken, user, facility) => {
        try {
            // Refresh the access token first  
            const refreshedAccessToken = await refreshAccessToken(refreshToken, user.profile.sub, facility);
            // Decode the refreshed access token to get the fhirUrl  
            const decodedToken = jwtDecode(refreshedAccessToken);
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

            // Update the AccessTokenList with the refreshed access token
            accessTokenList[facility] = refreshedAccessToken;
            setAccessTokenList(accessTokenList);

            // Update the patient data for the selected facility
            patientDataList[facility] = response.data;
            setPatientDataList(patientDataList);

            setError(null);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            if (error.response && error.response.status === 403) {
                // Handle the case where the refreshed token is also not valid  
                setError('An error occurred while fetching patient data. Looks like Access token claim issue. Please try again.');
            } else {
                setError('An error occurred while fetching patient data. Please try again.');
            }

            if ('facility' in accessTokenList) {
                delete accessTokenList['facility'];
            }
            setAccessTokenList(accessTokenList);

            if ('facility' in patientDataList) {
                delete patientDataList['facility'];
            }
            setPatientDataList(patientDataList);

        } finally {
        }
    };

    const refreshAccessToken = async (refreshToken, objectId, facilityCode) => {
        const url = `https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/token`;
        const requestBody = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: "661862bb-946b-4580-8bec-b7ae75905ab6",
            scope: 'openid offline_access https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.all.read',
            refresh_token: refreshToken,
            redirect_uri: "https://green-sea-0cde26500.5.azurestaticapps.net/callback", // Updated redirect URI  
            objectId: objectId, // Added objectId  
            facilityCode: facilityCode // Added facilityCode  
        });
        try {
            const response = await axios.post(url, requestBody, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            console.log('Refreshed Access Token:', response.data.access_token);
            setRefreshToken(response.data.refresh_token); // Update the refresh token if it's included in the response  
            return response.data.access_token;
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw error;
        }
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Welcome to Demo App</h1>
                    <h2>Multiple FHIR service access with Azure B2C Authentication using custom policy</h2>
                    <div>
                        {user ? (
                            <button onClick={handleLogout}>Logout</button>
                        ) : (
                            <button onClick={handleLogin}>Login</button>
                        )}
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        )}
                        {loading ? (
                            <Loader /> // Show loader when loading  
                        ) : (
                            <div className="patient-info">
                                {facilities.map((facility, index) => (
                                    <PatientInfo key={index} facility={facility} patientData={patientDataList[facility]} />
                                ))}
                            </div>
                        )}
                    </div>
                </header>
            </div>
            <Routes> {/* Updated from Switch to Routes */}
                <Route path="/callback" element={<Callback />} /> {/* Updated from component to element */}
                {/* Add other routes as needed */}
            </Routes>
        </Router>
    );
};

export default App;

