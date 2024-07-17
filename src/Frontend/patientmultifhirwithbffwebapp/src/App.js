import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import appConfig from './appConfig';
import Callback from './Callback';
import MainComponent from './components/MainComponent/MainComponent';
import './styles.css';

const facilities = appConfig.facilities;

const App = () => {
    const [patientDataList, setPatientDataList] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sessionToken, setSessionToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedSessionToken = localStorage.getItem('sessionToken');
        if (storedSessionToken) {
            setSessionToken(storedSessionToken);
            fetchAllPatientData(storedSessionToken);
        }
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.get(`${appConfig.apiBaseURL}/api/Login`);
            window.location.href = response.data.loginUrl;
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('sessionToken');
        setSessionToken(null);
        setUser(null);
        setPatientDataList({});
    };

    const fetchAllPatientData = async (sessionToken) => {
        try {
            setLoading(true);
            setError(null);
            const patientDataPromises = facilities.map(facilityCode =>
                fetchPatientData(sessionToken, facilityCode)
            );
            const patientDataResults = await Promise.all(patientDataPromises);
            const newDataList = {};
            patientDataResults.forEach(({ facilityCode, data }) => {
                newDataList[facilityCode] = data;
            });
            setPatientDataList(newDataList);
        } catch (error) {
            setError('Error fetching patient data');
            console.error('Error fetching patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientData = async (sessionToken, facilityCode) => {
        try {
            const response = await axios.get(`${appConfig.apiBaseURL}/api/DataRetrieval`, {
                headers: {
                    'session-token': sessionToken
                },
                params: {
                    facilityCode: facilityCode
                }
            });
            return { facilityCode, data: response.data };
        } catch (error) {
            console.error(`Error fetching data for facility ${facilityCode}:`, error);
            return { facilityCode, data: null };
        }
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/callback" element={<Callback />} />
                    <Route
                        path="/"
                        element={
                            <MainComponent
                                user={user}
                                error={error}
                                handleLogin={handleLogin}
                                handleLogout={handleLogout}
                                loading={loading}
                                facilities={facilities}
                                patientDataList={patientDataList}
                            />
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;  
