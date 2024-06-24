// src/App.js  
import React, { useState } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import axios from 'axios';
import PatientInfo from './PatientInfo';
import Loader from './Loader'; // Import the Loader component  
import './styles.css';

const facilities = ['1001', '1002', '1003', '1004'];

const App = () => {
    const { instance, accounts } = useMsal();
    const [patientData, setPatientData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // State for loader  

    const handleLogin = () => {
        instance.loginRedirect(loginRequest).catch(e => {
            console.error(e);
        });
    };

    const handleLogout = () => {
        instance.logoutRedirect().catch(e => {
            console.error(e);
        });
    };

    const handleFacilitySelect = async (facility) => {
        setLoading(true); // Show loader  
        try {
            const accessToken = await getAccessToken();
            const fhirUrl = await getFhirUserUrl(facility, accounts[0].idTokenClaims.sub, accessToken);
            fetchPatientData(fhirUrl, accessToken);
        } catch (e) {
            console.error('Error:', e);
            setError('An error occurred while selecting the facility. Please try again.');
            setLoading(false); // Hide loader in case of error  
        }
    };

    const getAccessToken = () => {
        return new Promise((resolve, reject) => {
            if (accounts.length > 0) {
                const account = accounts[0];
                const tokenRequest = {
                    scopes: loginRequest.scopes,
                    account: account,
                };
                instance.acquireTokenSilent(tokenRequest)
                    .then(response => {
                        console.log('Access Token:', response.accessToken);
                        resolve(response.accessToken);
                    })
                    .catch(e => {
                        console.error('Silent token acquisition failed. Acquiring token using redirect.');
                        instance.acquireTokenRedirect(tokenRequest)
                            .catch(err => {
                                console.error('Token acquisition failed.', err);
                                reject(err);
                            });
                    });
            } else {
                reject(new Error('No accounts found'));
            }
        });
    };  


    const getFhirUserUrl = (facilityCode, objectId, accessToken) => {
        const url = 'https://smart-on-fhir-authhandler-func.azurewebsites.net/api/GetFHIRUser?code=Bs_8tOyRCsj_98OeGjw-KoZJJ_aG8kvWHK0LvawiW7XSAzFuPZTOVg%3D%3D';
        const requestBody = {
            facilityCode: facilityCode,
            objectId: objectId
        };
        return axios.post(url, requestBody, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.data.fhirUser;
        }).catch(error => {
            console.error('Error fetching FHIR user URL:', error);
            setError('An error occurred while fetching the FHIR user URL. Please try again.');
            setPatientData(null); // Clear patient data on error  
            setLoading(false); // Hide loader in case of error  
            throw error;
        });
    };  


    const fetchPatientData = (fhirUrl, accessToken) => {
        axios.get(fhirUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then(response => {
                console.log('Patient Data:', response.data);
                setPatientData(response.data);
                setError(null);
                setLoading(false); // Hide loader after data is fetched  
            })
            .catch(error => {
                console.error('Error fetching patient data:', error);
                setError('An error occurred while fetching patient data. Please try again.');
                setPatientData(null); // Clear patient data on error  
                setLoading(false); // Hide loader in case of error  
            });
    };  


    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to Demo App</h1>
                <h2>Multiple FHIR service access with Azure B2C Authentication using custom policy</h2>
                <AuthenticatedTemplate>
                    <div>
                        <button onClick={handleLogout}>Logout</button>
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
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <button onClick={handleLogin}>Login</button>
                </UnauthenticatedTemplate>
            </header>
        </div>
    );
};

export default App;  

