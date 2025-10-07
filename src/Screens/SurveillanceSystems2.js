import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation
import './PhysicalSecurity.css'; // Reuse the same CSS file for consistency in styling
import logo from '../assets/MachaLogo.png';  // Adjust the path relative to the current file location

function SurveillanceSystems2Page() {
  const navigate = useNavigate();  // Initialize useNavigate hook

  const handleButtonClick = (section) => {
    // Navigate to specific routes based on section
    switch (section) {
        case 'CCTV Camera Installation and Monitoring':
            navigate('/CCTVCameraInstallation');
            break;
        case 'Intrusion Detection Systems':
            navigate('/IntrusionDetectionSystems3');
            break;
        case 'Perimeter Security Fencing':
            navigate('/PerimeterSecurityFencing');
            break;
        default:
            console.log('Unknown section');
    }
  };

  return (
    <div className="form-page">
      {/* Header Section */}
      <header className="header">
        <button className="back-button" onClick={() => window.history.back()}>←</button> {/* Use window.history.back for navigation */}
        <h1>The MACHA Group</h1>
        <img src={logo} alt="Logo" className="logo" />
      </header>

      {/* Surveillance Systems */}
      <main className="form-container">
        <h2>Surveillance Systems</h2>
        <form>
          {/* Surveillance Systems Buttons */}
          {['CCTV Camera Installation and Monitoring', 'Intrusion Detection Systems', 'Perimeter Security Fencing'].map((section, index) => (
            <div key={index} className="form-section">
              <label>{section}</label>
              <button type="button" className="form-button" onClick={() => handleButtonClick(section)}>
                Enter Here
              </button>
            </div>
          ))}
        </form>
      </main>
    </div>
  );
}

export default SurveillanceSystems2Page;