import axios from "axios";
import { useMsalAuth } from "./useMsalAuth";

export const useFhirService = () => {
    const { getAccessToken } = useMsalAuth();

    const fetchPatientData = async () => {
        try {
            const token = await getAccessToken();
            console.log("Access Token:", token); // Log the token to verify it's being retrieved  

            const response = await axios.get("https://smartonfhirservehealth-fhirdata.fhir.azurehealthcareapis.com/Patient/5819837e-bca8-4653-9ff1-fa4a04923cfd", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            console.log("API Response:", response); // Log the response to check the API call  
            return response.data;
        } catch (error) {
            console.error("Error fetching patient data:", error);
            if (error.response) {
                // Server responded with a status other than 200 range  
                console.error("Response error data:", error.response.data);
                console.error("Response error status:", error.response.status);
                console.error("Response error headers:", error.response.headers);
            } else if (error.request) {
                // Request was made but no response received  
                console.error("Request error:", error.request);
            } else {
                // Something happened in setting up the request  
                console.error("General error:", error.message);
            }
            throw error;  // rethrow the error after logging it  
        }
    };

    return { fetchPatientData };
};  
