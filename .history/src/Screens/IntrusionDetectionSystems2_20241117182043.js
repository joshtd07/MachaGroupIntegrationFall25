import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useBuilding } from '../Context/BuildingContext'; // Context for buildingId
import './FormQuestions.css';
import logo from '../assets/MachaLogo.png'; // Adjust the path if necessary

function IntrusionDetectionSystems2Page() {
    const navigate = useNavigate();
    const { setBuildingId, buildingId } = useBuilding(); // Access and update buildingId from context
    const db = getFirestore();

    const [formData, setFormData] = useState();

    useEffect(() => {
        const fetchBuildingIdFromBuildings = async () => {
            if (!buildingId) {
                try {
                    // Replace 'BuildingDocumentID' with your actual document ID in the Buildings collection
                    const buildingDocRef = doc(db, 'Buildings', 'BuildingDocumentID'); 
                    const buildingSnapshot = await getDoc(buildingDocRef);

                    if (buildingSnapshot.exists()) {
                        const buildingData = buildingSnapshot.data();
                        setBuildingId(buildingData.buildingId); // Set buildingId from the fetched document
                    } else {
                        alert('Building information not found. Redirecting...');
                        navigate('/BuildingandAddress');
                    }
                } catch (error) {
                    console.error('Error fetching building ID:', error);
                    alert('Error fetching building information.');
                }
            }
        };

        fetchBuildingIdFromBuildings();
    }, [buildingId, navigate, setBuildingId, db]);

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
          // Create a document reference to the building in the 'Buildings' collection
          const buildingRef = doc(db, 'Buildings', buildingId); 

          // Store the form data in the specified Firestore structure
          const formsRef = collection(db, 'forms/Cybersecurity/Intrusion Detection System2');
          await addDoc(formsRef, {
              building: buildingRef, // Reference to the building document
              formData: formData, // Store the form data as a nested object
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
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <h1>Intrusion Detection Systems (IDS)</h1>
        <img src={logo} alt="Logo" className="logo" />
      </header>

      <main className="form-container">
        <form onSubmit={handleSubmit}>
          <h2>4.4.1.1.2 Intrusion Detection Systems</h2>

          {/* System Deployment and Configuration */}
          <h3>4.4.1.1.2.1 System Deployment and Configuration</h3>
          <div className="form-section">
            <label>4.4.1.1.2.1.1. How are IDS solutions deployed across the network (e.g., inline, passive, distributed) and what areas or segments do they cover?</label>
            <textarea name="idsDeployment" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.1.2. What are the key configuration settings for the IDS, and how are they tuned to match the organization’s security requirements?</label>
            <textarea name="idsConfigSettings" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.1.3. Are there any known limitations or blind spots in the IDS deployment that need to be addressed?</label>
            <div>
              <input type="radio" name="idsBlindSpots" value="Yes" onChange={handleChange} /> Yes
              <input type="radio" name="idsBlindSpots" value="No" onChange={handleChange} /> No
            </div>
          </div>

          {/* Detection Capabilities */}
          <h3>4.4.1.1.2.2 Detection Capabilities</h3>
          <div className="form-section">
            <label>4.4.1.1.2.2.1. What types of intrusions and attacks does the IDS aim to detect (e.g., network-based attacks, host-based attacks, zero-day exploits)?</label>
            <textarea name="idsDetectionTypes" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.2.2. How does the IDS differentiate between legitimate and malicious activities to minimize false positives and false negatives?</label>
            <textarea name="idsFalsePositivesHandling" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.2.3. Are there specific signatures, heuristics, or anomaly detection methods used to identify potential threats?</label>
            <textarea name="idsDetectionMethods" onChange={handleChange}></textarea>
          </div>

          {/* Real-time Monitoring and Alerting */}
          <h3>4.4.1.1.2.3 Real-time Monitoring and Alerting</h3>
          <div className="form-section">
            <label>4.4.1.1.2.3.1. Does the IDS provide real-time monitoring of network and system activities to identify suspicious or malicious behavior?</label>
            <div>
              <input type="radio" name="realTimeMonitoring" value="Yes" onChange={handleChange} /> Yes
              <input type="radio" name="realTimeMonitoring" value="No" onChange={handleChange} /> No
            </div>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.3.2. How are alerts generated and managed, and what processes are in place to ensure timely response to detected threats?</label>
            <textarea name="idsAlertManagement" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.3.3. What is the procedure for escalating alerts to the appropriate response teams or individuals?</label>
            <textarea name="alertEscalationProcedure" onChange={handleChange}></textarea>
          </div>

          {/* Incident Response Integration */}
          <h3>4.4.1.1.2.4 Incident Response Integration</h3>
          <div className="form-section">
            <label>4.4.1.1.2.4.1. How is the IDS integrated with incident response processes and tools, such as SIEM systems or ticketing systems?</label>
            <textarea name="idsIncidentIntegration" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.4.2. Are there predefined incident response protocols for handling alerts and incidents detected by the IDS?</label>
            <div>
              <input type="radio" name="incidentProtocols" value="Yes" onChange={handleChange} /> Yes
              <input type="radio" name="incidentProtocols" value="No" onChange={handleChange} /> No
            </div>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.4.3. How are the effectiveness and accuracy of the IDS in supporting incident response efforts evaluated?</label>
            <textarea name="idsIncidentEffectiveness" onChange={handleChange}></textarea>
          </div>

          {/* Data Logging and Analysis */}
          <h3>4.4.1.1.2.5 Data Logging and Analysis</h3>
          <div className="form-section">
            <label>4.4.1.1.2.5.1. What types of data and logs are collected by the IDS, and how are they stored and managed?</label>
            <textarea name="idsLogCollection" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.5.2. How are IDS logs analyzed to identify trends, patterns, or recurring issues related to security incidents?</label>
            <textarea name="idsLogAnalysis" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.5.3. Are there tools or processes in place to correlate IDS data with other security logs or events?</label>
            <div>
              <input type="radio" name="logCorrelation" value="Yes" onChange={handleChange} /> Yes
              <input type="radio" name="logCorrelation" value="No" onChange={handleChange} /> No
            </div>
          </div>

          {/* System Maintenance and Updates */}
          <h3>4.4.1.1.2.6 System Maintenance and Updates</h3>
          <div className="form-section">
            <label>4.4.1.1.2.6.1. What is the process for updating and maintaining IDS signatures, rules, and configurations to stay current with emerging threats?</label>
            <textarea name="idsMaintenance" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.6.2. How often are system updates and patches applied to the IDS, and how is the impact on system performance and security assessed?</label>
            <textarea name="idsUpdatesFrequency" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.6.3. Are there procedures for testing and validating updates to ensure they do not disrupt normal operations?</label>
            <div>
              <input type="radio" name="updateValidation" value="Yes" onChange={handleChange} /> Yes
              <input type="radio" name="updateValidation" value="No" onChange={handleChange} /> No
            </div>
          </div>

          {/* Performance and Effectiveness Evaluation */}
          <h3>4.4.1.1.2.7 Performance and Effectiveness Evaluation</h3>
          <div className="form-section">
            <label>4.4.1.1.2.7.1. How is the performance of the IDS monitored, and are there metrics or benchmarks used to assess its effectiveness?</label>
            <textarea name="idsPerformanceMonitoring" onChange={handleChange}></textarea>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.7.2. Are there periodic reviews or assessments conducted to evaluate the IDS’s ability to detect and respond to threats?</label>
            <div>
              <input type="radio" name="periodicAssessment" value="Yes" onChange={handleChange} /> Yes
              <input type="radio" name="periodicAssessment" value="No" onChange={handleChange} /> No
            </div>
          </div>
          <div className="form-section">
            <label>4.4.1.1.2.7.3. How are feedback and lessons learned from past incidents incorporated into the IDS configuration and deployment strategy?</label>
            <textarea name="feedbackIncorporation" onChange={handleChange}></textarea>
          </div>

          <button type="submit">Submit</button>
        </form>
      </main>
    </div>
  );
}

export default IntrusionDetectionSystems2Page;
