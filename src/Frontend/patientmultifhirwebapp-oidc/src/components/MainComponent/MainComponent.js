// src/components/MainComponent/MainComponent.js

import React from 'react';
import LoginButton from '../LoginButton/LoginButton';
import Loader from '../Loader/Loader';
import PatientInfo from '../PatientInfo/PatientInfo';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './MainComponent.css';

function MainComponent({ user, error, handleLogin, handleLogout, handleDeleteUser, loading, facilities, patientDataList }) {
    const email = user?.profile?.email || user?.profile?.userPrincipalName; // Get email from user profile
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to Demo App</h1>
                <h2>Multiple FHIR service access with Azure B2C Authentication using custom policy</h2>
                <div>
                    <LoginButton
                        user={user}
                        handleLogin={handleLogin}
                        handleLogout={handleLogout}
                        handleDeleteUser={handleDeleteUser}
                    />
                    {user && (
                        <div className="user-info">
                            <span>Logged-in as: {user.profile.name}</span>
                            <span>Email: {email}</span>
                        </div>
                    )}
                    {error && <ErrorMessage error={error} />}
                    {loading ? (
                        <Loader />
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
    );
}

export default MainComponent;