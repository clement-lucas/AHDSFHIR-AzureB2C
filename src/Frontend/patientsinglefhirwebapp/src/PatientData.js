import React, { useState, useEffect } from "react";
import { useFhirService } from "./fhirService";

const PatientData = () => {
    const { fetchPatientData } = useFhirService();
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getPatient = async () => {
            try {
                const data = await fetchPatientData();
                console.log("Fetched data:", data); // Log the data to see its structure  
                setPatient(data);
            } catch (error) {
                console.error("Error loading patient data:", error);
                setError(error);
            }
        };

        getPatient();
    }, []); // Empty dependency array ensures useEffect runs only once  

    return (
        <div>
            <h1>Patient Data</h1>
            {error ? (
                <p>Error loading patient data: {error.message}</p>
            ) : !patient ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>{patient.name.map(name => name.given.join(" ") + " " + name.family).join(", ")}</h2>
                    <p><strong>ID:</strong> {patient.id}</p>
                    <p><strong>Gender:</strong> {patient.gender}</p>
                    <p><strong>Birth Date:</strong> {patient.birthDate}</p>
                </div>
            )}
        </div>
    );
};

export default PatientData;  
