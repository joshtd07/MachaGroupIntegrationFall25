import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation
import './AccessControl.css'; // Reuse the same CSS file for consistency in styling
import logo from '../assets/MachaLogo.png';  // Adjust the path relative to the current file location
import Navbar from "./Navbar"; // Import the Navbar
/**/

//test editions part 1
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useBuilding } from '../Context/BuildingContext';

function CrisisInterventionPage() {
  const navigate = useNavigate();  // Initialize useNavigate hook

  // Test editions part 2
  const db = getFirestore();
  const { buildingId } = useBuilding();


  //********************************************************* */

  //  Add local state to hold progress for each form
  const [progress, setProgress] = useState({
    'Conflict Resolution': { answered: 0, total: 0 },
    'Emergency Communication': { answered: 0, total: 0 },
    'First Aid Response': { answered: 0, total: 0 },
  });

  //  Fetch progress from Firestore when the page loads
  useEffect(() => {
    if (!buildingId) return; // safety check

    async function fetchProgress() {
      const sections = [
        'Conflict Resolution',
        'Emergency Communication',
        'First Aid Response',
      ];


      const newProgress = {};

      for (const section of sections) {
        const formDocRef = doc(db, 'forms', 'Emergency Preparedness', section, buildingId);
        try {
          const snap = await getDoc(formDocRef);

          if (snap.exists()) {
            const { answered = 0, total = 0 } = snap.data().progress || {};
            newProgress[section] = { answered, total };
          } else {
            newProgress[section] = { answered: 0, total: 0 };
          }
        } catch (err) {
          console.error('Error fetching progress for', section, err);
          newProgress[section] = { answered: 0, total: 0 };
        }
      }

      setProgress(newProgress);
    }

    fetchProgress();
  }, [buildingId, db]);


//********************************************************* */

  const handleButtonClick = (section) => {
    console.log(`Button clicked for: ${section}`);
    // Add logic for handling button click, e.g., open a modal or navigate

    switch (section) {
      case 'Conflict Resolution':
          navigate('/ConflictResolution');
          break;
      case 'Emergency Communication':
          navigate('/EmergencyCommunication');
          break;
      case 'First Aid Response':
          navigate('/FirstAidResponse');
          break;
      default:
          console.log('Unknown section');
  }
  };

  return (
    <div className="form-page">
      {/* Header Section */}
      <header className="header">
        <Navbar />
        <button className="back-button" onClick={() => window.history.back()}>←</button> {/* Use window.history.back for navigation */}
        <h1>The MACHA Group</h1>
        <img src={logo} alt="Logo" className="logo" />
      </header>

      {/* Crisis Intervention Section */}
      <main className="form-container">
        <h2>Crisis Intervention</h2>
        <form>
          {/* Crisis Intervention Buttons */}

          {['Conflict Resolution', 'Emergency Communication', 'First Aid Response'].map((section, index) => {
            const p = progress[section] || { answered: 0, total: 0 };
            return (
              <div key={index} className="form-section">
                <label>{section}</label>

                <p style={{ fontSize: '0.9rem', color: '#444', margin: '6px 0' }}>
                  {p.answered} of {p.total} questions answered
                </p>

                <button type="button" className="form-button" onClick={() => handleButtonClick(section)}>
                  Enter Here
                </button>
              </div>
            );
          })}

        </form>
      </main>
    </div>
  );
}

export default CrisisInterventionPage;