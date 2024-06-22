import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './authConfig';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';

const App = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <div className="app-container">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </MsalProvider>
  );
};

export default App;  
