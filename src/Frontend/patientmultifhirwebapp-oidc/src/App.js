// src/App.js

import React, { useState, useEffect } from 'react';
import userManager from './authConfig';
import appConfig from './appConfig';
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
    const [initialized, setInitialized] = useState(false);


    useEffect(() => {
        const handleUserLoad = (user) => {
            console.log('User loaded', user);
            setUser(user);
        };

        const handleUserUnload = () => {
            console.log('User unloaded');
            setUser(null);
        };

        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            userManager.signinRedirectCallback().then(user => {
                console.log('User signin redirect successful');
                setUser(user);
                if (!initialized) {
                    fetchAllPatientData(user.refresh_token);
                    setInitialized(true);
                }
                // Clear the URL parameters  
                window.history.replaceState({}, document.title, window.location.pathname);
            }).catch(error => {
                console.error('Error handling redirect callback', error);
            });
        } else {
            userManager.getUser().then(user => {
                if (user && !initialized) {
                    console.log('User:', user);
                    setUser(user);
                    fetchAllPatientData(user.refresh_token);
                    setInitialized(true);
                }
            }).catch(error => {
                console.error('Error getting user:', error);
            });
        }

        userManager.events.addUserLoaded(handleUserLoad);
        userManager.events.addUserUnloaded(handleUserUnload);

        return () => {
            userManager.events.removeUserLoaded(handleUserLoad);
            userManager.events.removeUserUnloaded(handleUserUnload);
        };
    }, [initialized]);

    const handleLogin = () => {
        userManager.signinRedirect();
    };

    const handleLogout = () => {
        // Clear the local state  
        setPatientDataList([]);
        setError(null);
        setLoading(false);
        setUser(null);
        setInitialized(false);
        // Perform the logout  
        userManager.signoutRedirect();
    };

    const handleDeleteAccount = () => {
        userManager.signinRedirect({
            authority: appConfig.deleteAuthorityURL,
            scope: "openid",
            response_type: "code",
            redirect_uri: appConfig.redirectURL,
            post_logout_redirect_uri: appConfig.postLogoutRedirectURL // where to redirect after deletion  
        }).catch(error => {
            console.error('Delete user error:', error);
            setError('An error occurred while deleting the account. Please try again.');
        });
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

            // Decode the refreshed access token to get the fhirUrl 
            const decodedToken = jwtDecode(refreshedAccessToken);
            console.log('Decoded Token:', JSON.stringify(decodedToken));

            const fhirUrl = decodedToken.fhirUser;

            if (!fhirUrl) {
                throw new Error('FHIR URL not found in token');
            }

            // Extract the facility code from the FHIR URL  
            const facilityCode = facility; // Assuming facility code is passed correctly  
            if (!facilityCode) {
                throw new Error('Facility code not found');
            }

            // Uncomment this block if you want to fetch patient data directly from FHIR server instead of using APIM.
            // const response = await axios.get(fhirUrl, {
            //     headers: {
            //         Authorization: `Bearer ${refreshedAccessToken}`,
            //     },
            // });

            // Comment this block if you want to fetch patient data directly from FHIR server instead of using APIM.
            const patientId = fhirUrl.split('/').pop(); // Extract patient resource ID  
            const apimUrl = `${appConfig.apimBaseUrl}/${facilityCode}/Patient/${patientId}`;
            // Fetch the patient data using the constructed APIM URL 
            const response = await axios.get(apimUrl, {
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
        <MainComponent
            user={user}
            error={error}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            handleDeleteAccount={handleDeleteAccount}
            loading={loading}
            facilities={facilities}
            patientDataList={patientDataList}
        />
    );
};

export default App;