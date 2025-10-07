import React from 'react';
import './AccessControl.css'; // Reuse the same CSS file for consistency in styling
import logo from '../assets/MachaLogo.png';  // Adjust the path relative to the current file location
import { useNavigate } from 'react-router-dom';

function PolicyEvaluationCriteriaPage() {
  const navigate = useNavigate();

  const handleButtonClick = (section) => {
    console.log(`Button clicked for: ${section}`);
    
    switch (section) {
      case 'Compliance with Regulations':
        navigate('/ComplianceWithRegulations');
        break;
      case 'Effectiveness in Addressing Security Risks':
        navigate('/EffectivenessInAddressingSecurityRisks');
        break;
      default:
        console.log('Unkown section');
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

      {/* Policy Evaluation Criteria Section */}
      <main className="form-container">
        <h2>Policy Evaluation Criteria</h2>
        <form>
          {/* Policy Evaluation Criteria Buttons */}
          {['Compliance with Regulations', 'Effectiveness in Addressing Security Risks'].map((section, index) => (
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

export default PolicyEvaluationCriteriaPage;