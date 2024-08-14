// src\Frontend\patientmultifhirwebapp\src\components\MainComponent\MainComponent.js

import React from 'react';
import LoginButton from '../LoginButton/LoginButton'; // Adjust the import path as necessary
import Loader from '../Loader/Loader'; // Adjust the import path as necessary
import PatientInfo from '../PatientInfo/PatientInfo'; // Adjust the import path as necessary
import ErrorMessage from '../ErrorMessage/ErrorMessage'; // Adjust the import path as necessary

function MainComponent({ user, error, handleLogin, handleLogout, loading, facilities, patientDataList }) {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to Demo App</h1>
                <h2>Multiple FHIR service access with Azure B2C Authentication using custom policy</h2>

                <div>
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
                </div>
            </header>
        </div>
    );
}

export default MainComponent;