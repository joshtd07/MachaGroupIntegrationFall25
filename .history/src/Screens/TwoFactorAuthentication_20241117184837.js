import React, { useState } from 'react';
import './FormQuestions.css';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, doc } from 'firebase/firestore';
import { useBuilding } from '../Context/BuildingContext'; // Context for buildingId
import logo from '../assets/MachaLogo.png'; // Adjust the path if necessary

function TwoFactorAuthenticationPage() {
  const navigate = useNavigate();
  const { setBuildingId, buildingId } = useBuilding();
  const db = getFirestore();

  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buildingId) {
      alert('Building ID is missing. Please start from the Building Information page.');
      return;
    }

    try {
      const buildingRef = doc(db, 'Buildings', buildingId);
      const formsRef = collection(db, 'forms/Cybersecurity/Two-Factor Authentication');
      await addDoc(formsRef, {
        building: buildingRef,
        formData: formData,
      });

      console.log('Form data submitted successfully!');
      alert('Form submitted successfully!');
      navigate('/Form');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please try again.');
    }
  };

  return (
    <div className="form-page">
      <header className="header">
        <button className="back-button" onClick={handleBack}>←</button>
        <h1>Two-Factor Authentication Assessment</h1>
        <img src={logo} alt="Logo" className="logo" />
      </header>

      <main className="form-container">
        <form onSubmit={handleSubmit}>
          <h2>4.3.2.2.1 Two-Factor Authentication (e.g., SMS codes, authenticator apps)</h2>

          {/* Implementation and Adoption */}
          <h3>4.3.2.2.1.1 Implementation and Adoption:</h3>
          <div className="form-section">
            <label>4.3.2.2.1.1.1. What percentage of employees and users have successfully enrolled in the two-factor authentication (2FA) system?</label>
            <textarea name="enrollmentPercentage" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.1.2. Are there specific systems or applications within the organization that require mandatory 2FA? If so, which ones?</label>
            <textarea name="mandatory2FA" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.1.3. How is the 2FA requirement communicated to all employees, and what steps are taken to ensure full compliance?</label>
            <textarea name="communicationCompliance" onChange={handleChange}></textarea>
          </div>

          {/* Security and Effectiveness */}
          <h3>4.3.2.2.1.2 Security and Effectiveness:</h3>
          <div className="form-section">
            <label>4.3.2.2.1.2.1. How does the organization evaluate the effectiveness of 2FA in preventing unauthorized access or reducing the risk of security breaches?</label>
            <textarea name="effectivenessEvaluation" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.2.2. Have there been any documented incidents of attempted unauthorized access that were thwarted by 2FA?</label>
            <textarea name="thwartedIncidents" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.2.3. Are there any known vulnerabilities or security risks associated with the current 2FA methods (e.g., SIM swapping for SMS codes)?</label>
            <textarea name="knownRisks" onChange={handleChange}></textarea>
          </div>

          {/* User Experience and Usability */}
          <h3>4.3.2.2.1.3 User Experience and Usability:</h3>
          <div className="form-section">
            <label>4.3.2.2.1.3.1. How do employees and users perceive the ease of use and convenience of the 2FA methods currently implemented?</label>
            <textarea name="userPerception" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.3.2. Are there any reported issues or challenges faced by users when setting up or using 2FA?</label>
            <textarea name="userIssues" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.3.3. What support or resources are available to assist users who experience problems with 2FA?</label>
            <textarea name="userSupport" onChange={handleChange}></textarea>
          </div>

          {/* Backup and Recovery Options */}
          <h3>4.3.2.2.1.4 Backup and Recovery Options:</h3>
          <div className="form-section">
            <label>4.3.2.2.1.4.1. What backup or recovery options are available if an employee or user loses access to their primary 2FA method?</label>
            <textarea name="backupOptions" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.4.2. Are there guidelines for securely storing backup codes or recovery information?</label>
            <textarea name="backupGuidelines" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.4.3. How does the organization handle 2FA reset requests?</label>
            <textarea name="resetRequests" onChange={handleChange}></textarea>
          </div>

          {/* Integration and Compatibility */}
          <h3>4.3.2.2.1.5 Integration and Compatibility:</h3>
          <div className="form-section">
            <label>4.3.2.2.1.5.1. How well does the 2FA system integrate with other security measures?</label>
            <textarea name="integrationCompatibility" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.5.2. Are there any compatibility issues with specific devices?</label>
            <textarea name="compatibilityIssues" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.5.3. Does the organization have plans to expand or modify 2FA?</label>
            <textarea name="futurePlans" onChange={handleChange}></textarea>
          </div>

          {/* Policy and Compliance */}
          <h3>4.3.2.2.1.6 Policy and Compliance:</h3>
          <div className="form-section">
            <label>4.3.2.2.1.6.1. Are there documented policies and guidelines outlining when and how 2FA should be used?</label>
            <textarea name="documentedPolicies" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.6.2. How does the organization ensure ongoing compliance with 2FA policies?</label>
            <textarea name="complianceProcess" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.6.3. Are there regular audits or reviews to ensure that 2FA settings remain up-to-date?</label>
            <textarea name="regularAudits" onChange={handleChange}></textarea>
          </div>

          {/* Continuous Improvement and Feedback */}
          <h3>4.3.2.2.1.7 Continuous Improvement and Feedback:</h3>
          <div className="form-section">
            <label>4.3.2.2.1.7.1. How often does the organization review and update its 2FA methods?</label>
            <textarea name="methodReview" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.7.2. Is there a process for collecting feedback from users on their experience with 2FA?</label>
            <textarea name="userFeedback" onChange={handleChange}></textarea>
          </div>

          <div className="form-section">
            <label>4.3.2.2.1.7.3. Are there any planned upgrades or changes to the 2FA system?</label>
            <textarea name="plannedUpgrades" onChange={handleChange}></textarea>
          </div>

          <button type="submit">Submit</button>
        </form>
      </main>
    </div>
  );
}

export default TwoFactorAuthenticationPage;
