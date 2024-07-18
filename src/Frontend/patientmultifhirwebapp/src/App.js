// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import userManager from './authConfig';
import appConfig from './appConfig';
import Callback from './Callback';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './styles.css';
import MainComponent from './components/MainComponent/MainComponent';

const facilities = appConfig.facilities;

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
        // Clear the local state  
        setPatientDataList([]);
        setAccessTokenList([]);
        setError(null);
        setLoading(false);
        setRefreshToken(null);
        setUser(null);

        // Perform the logout  
        userManager.signoutRedirect();
    };

    async function getScopesString(objectId) {
        const url = "https://smart-on-fhir-authhandler-func.azurewebsites.net/api/GetFHIRScope?code=ze3QL0zdQLIIg73Y9ifUnhrL06avzNqPz_bTZFGFE6TYAzFuZ-BMOw%3D%3D";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ objectId }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.scope; // Assuming the API returns an object with scopesString
        } catch (error) {
            console.error("Failed to fetch scopesString:", error);
            return null;
        }
    }

    const fetchAllPatientData = async (refreshToken) => {
        setLoading(true);
        setError(null); // Clear any previous error

        try {
            const user = await userManager.getUser();
            if (user) {
                // Call the function to get scopesString and prepend "openid offline_access"
                let scopesString = await getScopesString(user.profile.sub); // Fetch dynamic scopes based on objectId
                scopesString = "openid offline_access https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/user_impersonation " + scopesString; // Prepend static scopes

                await Promise.all(facilities.map(
                    facility => fetchPatientData(refreshToken, user, facility, scopesString)
                ));
            }
        } catch (e) {
            console.error('Error:', e);
            setError('An error occurred while fetching patient data. Please try again.');
            setPatientDataList([]); // Clear patient data on error  
            setAccessTokenList([]); // Clear access tokens on error  
        } finally {
            setLoading(false);
        }
    }

    const fetchPatientData = async (refreshToken, user, facility, scopesString) => {
        try {

            // Refresh the access token first
            const refreshedAccessToken = await refreshAccessToken(refreshToken, user.profile.sub, facility, scopesString);
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
            setAccessTokenList(prevAccessTokenList => ({
                ...prevAccessTokenList,
                [facility]: refreshedAccessToken
            }));
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

            setAccessTokenList(prevAccessTokenList => {
                const newAccessTokenList = { ...prevAccessTokenList };
                delete newAccessTokenList[facility];
                return newAccessTokenList;
            });

            setPatientDataList(prevPatientDataList => {
                const newPatientDataList = { ...prevPatientDataList };
                delete newPatientDataList[facility];
                return newPatientDataList;
            });
        }
    };

    const refreshAccessToken = async (refreshToken, objectId, facilityCode, scopesString) => {
        const url = appConfig.tokenURL;
        // Define the list of scopes
        // const scopes = [
        //     "openid",
        //     "offline_access",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/launch",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/fhirUser",
        //     "https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Patient.read",
        //     "https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/user_impersonation",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.AllergyIntolerance.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Condition.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Immunization.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Observation.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Procedure.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.MedicationRequest.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Observation.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Location.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Practitioner.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.PractitionerRole.read",
        //     //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Organization.read",
        // ];

        //// Join the scopes array into a single string with spaces
        //const scopesString = scopes.join(' ');

        const requestBody = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: appConfig.clientID,
            //scope: appConfig.refreshTokenScope,
            scope: scopesString,
            refresh_token: refreshToken,
            redirect_uri: appConfig.redirectURL,
            objectId: objectId, // Add objectId  
            facilityCode: facilityCode // Add facilityCode  
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
            <MainComponent
                user={user}
                error={error}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                loading={loading}
                facilities={facilities}
                patientDataList={patientDataList}
            />
            <Routes> {/* Updated from Switch to Routes */}
                <Route path="/callback" element={<Callback />} /> {/* Updated from component to element */}
                {/* Add other routes as needed */}
            </Routes>
        </Router>
    );
};

export default App;