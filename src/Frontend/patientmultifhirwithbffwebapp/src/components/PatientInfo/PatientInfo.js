// src/PatientInfo.js  

import React from 'react';
import './PatientInfo.css';

const PatientInfo = ({ facility, patientData }) => {
    if (!facility) return null;
    if (!patientData) return null;

    const { resourceType, id, active, birthDate, gender, name } = patientData;

    return (
        <div>
            <h2>Patient Information</h2>
            <p><strong>Facility:</strong> {facility}</p>
            <p><strong>Resource Type:</strong> {resourceType}</p>
            <p><strong>ID:</strong> {id}</p>
            <p><strong>Active:</strong> {active ? 'Yes' : 'No'}</p>
            <p><strong>Birth Date:</strong> {birthDate}</p>
            <p><strong>Gender:</strong> {gender}</p>
            <div>
                <strong>Name:</strong>
                {name.map((nameEntry, index) => (
                    <div key={index}>
                        <p><strong>Use:</strong> {nameEntry.use}</p>
                        <p><strong>Family:</strong> {nameEntry.family}</p>
                        <p><strong>Given:</strong> {nameEntry.given.join(' ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientInfo;  
