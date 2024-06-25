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
    const [patientData, setPatientData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshToken, setRefreshToken] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        userManager.events.addUserLoaded(user => {
            console.log('User loaded', user);
            setUser(user);
            setRefreshToken(user.refresh_token);
            setAccessToken(user.access_token);
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
                setAccessToken(user.access_token);
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

    const handleFacilitySelect = async (facility) => {
        setLoading(true);
        setSelectedFacility(facility); // This will still update the state, but we won't rely on it immediately  
        try {
            const user = await userManager.getUser();
            if (user) {
                fetchPatientData(accessToken, user, facility); // Pass facility directly  
            }
        } catch (e) {
            console.error('Error:', e);
            setError('An error occurred while selecting the facility. Please try again.');
            setLoading(false);
        }
    };

    const fetchPatientData = async (accessToken, user, facility) => {
        setLoading(true); // Show loader when data fetching starts  
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
            setPatientData(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            if (error.response && error.response.status === 403) {
                // Handle the case where the refreshed token is also not valid  
                setError('An error occurred while fetching patient data. Looks like Access token claim issue. Please try again.');
            } else {
                setError('An error occurred while fetching patient data. Please try again.');
            }
            setPatientData(null); // Clear patient data on error  
        } finally {
            setLoading(false); // Hide loader after data is fetched or in case of error  
        }
    };

    const refreshAccessToken = (refreshToken, objectId, facilityCode) => {
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
        return axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(response => {
            console.log('Refreshed Access Token:', response.data.access_token);
            setAccessToken(response.data.access_token); // Update the access token  
            setRefreshToken(response.data.refresh_token); // Update the refresh token if it's included in the response  
            return response.data.access_token;
        }).catch(error => {
            console.error('Error refreshing access token:', error);
            throw error;
        });
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
                        <div className="facility-buttons">
                            <h2>Select Facility</h2>
                            {facilities.map(facility => (
                                <button key={facility} onClick={() => handleFacilitySelect(facility)}>
                                    {facility}
                                </button>
                            ))}
                        </div>
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        )}
                        {loading ? (
                            <Loader /> // Show loader when loading  
                        ) : (
                            <div className="patient-info">
                                <PatientInfo patientData={patientData} />
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

