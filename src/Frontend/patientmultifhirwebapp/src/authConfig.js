import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
    auth: {
        clientId: "661862bb-946b-4580-8bec-b7ae75905ab6",
        authority: "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1a_signup_signin",
        knownAuthorities: [
            "https://uvancehlpfdemo.b2clogin.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com",
            "https://uvancehlpfdemo.b2clogin.com/uvancehlpfdemo.onmicrosoft.com/b2c_1a_signup_signin"
        ],        
        redirectUri: "http://localhost:3000"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest = {
    scopes: [
        "openid",
        "profile",
        "offline_access",        
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/fhirUser",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/launch",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/launch.patient",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/online_access",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.all.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.AllergyIntolerance.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.CarePlan.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.CareTeam.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Condition.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Device.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.DiagnosticReport.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.DocumentReference.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Encounter.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Goal.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Immunization.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Location.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Medication.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.MedicationRequest.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Observation.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Organization.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Patient.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Practitioner.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.PractitionerRole.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Procedure.read",
        //"https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/patient.Provenance.read",
        "https://uvancehlpfdemo.onmicrosoft.com/661862bb-946b-4580-8bec-b7ae75905ab6/user_impersonation",
    ]
};

export const msalInstance = new PublicClientApplication(msalConfig);