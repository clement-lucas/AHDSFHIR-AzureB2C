// src\Frontend\patientmultifhirwebapp\src\App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { MsalProvider, useIsAuthenticated, useMsal } from '@azure/msal-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import  
import msalInstance from './msalConfig';
import './styles.css';
import CallbackPage from './components/CallbackPage/CallbackPage';  // Import CallbackPage component  
import appConfig from './appConfig';
import LoginButton from './components/LoginButton/LoginButton';
import Loader from './components/Loader/Loader';
import PatientInfo from './components/PatientInfo/PatientInfo';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';

const facilities = appConfig.facilities;

const App = () => (
    <MsalProvider instance={msalInstance}>
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/callback" element={<CallbackPage />} />
            </Routes>
        </Router>
    </MsalProvider>
);

const Home = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [patientDataList, setPatientDataList] = useState([]);
    const [accessTokenList, setAccessTokenList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            const account = accounts[0];
            setUser(account);
            fetchAllPatientData(account); // Fetch data for all facilities when user is loaded    
        }
    }, [isAuthenticated, accounts]);

    const handleLogin = () => {
        instance.loginPopup({
            scopes: ['openid', 'profile'],
            prompt: 'select_account'
        }).catch(error => {
            console.error('Login error:', error);
        });
    };

    const handleLogout = () => {
        instance.logoutPopup({
            postLogoutRedirectUri: appConfig.postLogoutRedirectURL,
        });
    };

    const fetchAllPatientData = async (account) => {
        setLoading(true);
        setError(null); // Clear any previous error  

        try {
            if (account) {
                for (const facility of facilities) {
                    await fetchPatientData(account, facility);
                }
            }
        } catch (e) {
            console.error('Error:', e);
            setError('An error occurred while fetching patient data. Please try again.');
            setPatientDataList([]); // Clear patient data on error  
            setAccessTokenList([]); // Clear access tokens on error  
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientData = async (user, facilityCode) => {
        console.log('objectId:', user.idTokenClaims.oid, 'facilityCode:', facilityCode);

        try {
            // Attempt to acquire token silently with ssoSilent to force token refresh  
            const response = await instance.ssoSilent({
                authority: appConfig.authorityURL,
                scopes: appConfig.scopes,
                redirectUri: appConfig.redirectURL,
                account: user,
                forceRefresh: true,
                extraQueryParameters: {
                    objectId: user.idTokenClaims.oid,
                    facilityCode: facilityCode
                },
            });

            const refreshedAccessToken = response.accessToken;
            console.log('refreshedAccessToken:', refreshedAccessToken);
            const decodedToken = jwtDecode(refreshedAccessToken);
            console.log('decodedToken:', decodedToken);
            const fhirUrl = decodedToken.fhirUser;

            if (!fhirUrl) {
                throw new Error('FHIR URL not found in token');
            }

            const patientDataResponse = await axios.get(fhirUrl, {
                headers: {
                    Authorization: `Bearer ${refreshedAccessToken}`,
                },
            });

            console.log('Patient Data:', patientDataResponse.data);

            setAccessTokenList(prevAccessTokenList => ({
                ...prevAccessTokenList,
                [facilityCode]: refreshedAccessToken
            }));

            setPatientDataList(prevPatientDataList => ({
                ...prevPatientDataList,
                [facilityCode]: patientDataResponse.data
            }));

            setError(null); // Clear any previous error  

        } catch (error) {
            console.error('Error fetching patient data:', error);
            handleFetchError(facilityCode);
        }
    };

    const handleFetchError = (facilityCode) => {
        setAccessTokenList(prevAccessTokenList => {
            const newAccessTokenList = { ...prevAccessTokenList };
            delete newAccessTokenList[facilityCode];
            return newAccessTokenList;
        });

        setPatientDataList(prevPatientDataList => {
            const newPatientDataList = { ...prevPatientDataList };
            delete newPatientDataList[facilityCode];
            return newPatientDataList;
        });

        setError('An error occurred while fetching patient data. Please try again.');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to Demo App</h1>
                <h2>Multiple FHIR service access with Azure B2C Authentication using custom policy</h2>
                <LoginButton user={user} handleLogin={handleLogin} handleLogout={handleLogout} />
                {error && <ErrorMessage error={error} />}
                {loading ? (
                    <Loader /> // Show loader when loading    
                ) : (
                    <div className="patient-info">
                        {facilities.map((facility, index) => (
                            <PatientInfo key={index} facility={facility} patientData={patientDataList[facility]} />
                        ))}
                    </div>
                )}
            </header>
        </div>
    );
};

export default App;