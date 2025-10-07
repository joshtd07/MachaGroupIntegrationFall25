import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation
import './AccessControl.css'; // Reuse the same CSS file for consistency in styling
import logo from '../assets/MachaLogo.png';  // Adjust the path relative to the current file location
/**/
function EmergencyProceduresPage() {
  const navigate = useNavigate();  // Initialize useNavigate hook

  const handleButtonClick = (section) => {
    console.log(`Button clicked for: ${section}`);
    // Add logic for handling button click, e.g., open a modal or navigate

    switch (section) {
      case 'Curriculum Integration':
        navigate('/CurriculumIntegration');
        break;
      case 'Student Handbooks':
        navigate('/StudentHandbooks');
        break;
      case 'Parent Involvement':
        navigate('/ParentInvolvement2');
        break;
      case 'Fire Drills':
        navigate('/FireDrills');
        break;
      case 'Lockdown Drills':
        navigate('/LockdownDrills2');
        break;
      case 'Severe Weather Preparedness':
        navigate('/SevereWeatherPreparedness');
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

      {/* Emergency Procedures Section */}
      <main className="form-container">
        <h2>Emergency Procedures</h2>
        <form>
          {/* Emergency Procedures Buttons */}
          {['Curriculum Integration', 'Student Handbooks', 'Parent Involvement', 'Fire Drills', 'Lockdown Drills', 'Severe Weather Preparedness'].map((section, index) => (
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

export default EmergencyProceduresPage;