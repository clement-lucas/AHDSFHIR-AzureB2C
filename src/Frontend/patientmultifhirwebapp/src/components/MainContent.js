import React, { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const facilityCodes = ["FacilityA", "FacilityB"]; // Hardcoded facility codes  

const MainContent = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [loading, setLoading] = useState(false);
    const [patientData, setPatientData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated && accounts.length > 0) {
            fetchFHIRData();
        }
    }, [isAuthenticated, accounts]);

    const fetchFHIRData = async () => {
        setLoading(true);
        setError(null);
        const userTokens = [];

        try {
            for (const code of facilityCodes) {
                const token = await getFHIRUserToken(code);
                const decodedToken = jwtDecode(token);
                const fhirUserUrl = decodedToken.extension_fhirUser;
                userTokens.push({ facilityCode: code, token, fhirUserUrl });
            }

            // Fetch patient data from each FHIR service  
            const patientDetailsPromises = userTokens.map(({ facilityCode, token, fhirUserUrl }) =>
                fetchPatientDetails(fhirUserUrl, token)
            );

            const patientDetails = await Promise.all(patientDetailsPromises);
            setPatientData(patientDetails);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getFHIRUserToken = async (facilityCode) => {
        const request = {
            scopes: ["https://<your-tenant>.onmicrosoft.com/<your-api>/user_impersonation"],
            extraQueryParameters: { facility_code: facilityCode }
        };

        try {
            const response = await instance.acquireTokenSilent(request);
            return response.accessToken;
        } catch (e) {
            if (e instanceof msal.InteractionRequiredAuthError) {
                const response = await instance.acquireTokenRedirect(request);
                return response.accessToken;
            } else {
                throw e;
            }
        }
    };

    const fetchPatientDetails = async (fhirUserUrl, token) => {
        const response = await axios.get(fhirUserUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };

    return (
        <main className="app-main">
            {loading ? (
                <div className="loader">Fetching data from FHIR services...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="patient-details">
                    {patientData.map((data, index) => (
                        <div key={index}>
                            <h2>Patient Details for {facilityCodes[index]}</h2>
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default MainContent;  
