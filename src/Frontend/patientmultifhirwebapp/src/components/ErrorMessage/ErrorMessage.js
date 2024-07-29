// src\Frontend\patientmultifhirwebapp\src\components\ErrorMessage\ErrorMessage.js

import React from 'react';
import './ErrorMessage.css'; // Import CSS for ErrorMessage  

const ErrorMessage = ({ error }) => (
    <div className="error-message">
        <p>{error}</p>
    </div>
);

export default ErrorMessage;