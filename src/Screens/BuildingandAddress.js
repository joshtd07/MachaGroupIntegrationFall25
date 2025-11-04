import React, { useState } from 'react';
import {
  getFirestore,
  collection,
  // addDoc, // removed: using setDoc for custom IDs
  doc,
  setDoc,
  getDoc,
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useBuilding } from '../Context/BuildingContext';
import './FormQuestions.css';
import logo from '../assets/MachaLogo.png';
 
function BuildingInfoPage() {
    const [buildingName, setBuildingName] = useState('');
    const [buildingAddress, setBuildingAddress] = useState('');
    const [companyName, setCompanyName] = useState('');
    const { setBuildingId } = useBuilding();
    const navigate = useNavigate();
    const db = getFirestore();
 
    const handleBack = () => {
        navigate(-1);
    };

    // sanitize string to be safe for Firestore IDs and readable
    const sanitizeForId = (str) =>
      String(str || '')
        .trim()
        // remove Firestore-forbidden characters and reduce repeated whitespace
        .replace(/[.#$/\[\]]/g, '')
        .replace(/\s+/g, '_')
        // remove anything not alphanumeric or underscore or hyphen
        .replace(/[^a-zA-Z0-9_\-]/g, '')
        // trim long tails
        .slice(0, 200);

    const handleSubmit = async (e) => {
        e.preventDefault();
 
        if (!buildingName || !buildingAddress || !companyName) {
            alert('Please fill in all fields before proceeding.');
            return;
        }
 
        try {
            // First: keep your existing exact-match check (buildingName + buildingAddress + companyName)
            const q = query(
                collection(db, 'Buildings'),
                where('buildingName', '==', buildingName),
                where('buildingAddress', '==', buildingAddress),
                where('companyName', '==', companyName)
            );
            const querySnapshot = await getDocs(q);
 
            if (!querySnapshot.empty) {
                // Existing building found (by exact fields) — reuse it
                const existingBuildingDoc = querySnapshot.docs[0];
                setBuildingId(existingBuildingDoc.id);
                navigate('/form'); // Navigate to the form page
                return; // Stop further processing
            }
 
            // Build custom ID using Company_Building_Year
            const currentYear = new Date().getFullYear();
            const companyPart = sanitizeForId(companyName);
            const buildingPart = sanitizeForId(buildingName);
            const customDocId = `${companyPart}_${buildingPart}_${currentYear}`;
 
            // Check if a document already exists at that custom path
            const buildingRef = doc(db, 'Buildings', customDocId);
            const existingById = await getDoc(buildingRef);
            if (existingById.exists()) {
              // Document with our custom ID already exists — reuse it
              console.log('Found existing building doc by custom ID:', customDocId);
              setBuildingId(customDocId);
              navigate('/form');
              return;
            }
 
            // Create the document with the custom ID (setDoc won't auto-generate random ID)
            await setDoc(buildingRef, {
                buildingId: customDocId,
                buildingName,
                buildingAddress,
                companyName,
                timestamp: Timestamp.now()
            });
 
            console.log('Building info submitted successfully! Document ID:', customDocId);
            setBuildingId(customDocId);
            navigate('/form');
        } catch (error) {
            console.error('Error saving building info:', error);
            alert('Failed to save building info. Please try again.');
        }
    };
 
    return (
        <div className="form-page">
            <header className="header">
                <button className="back-button" onClick={handleBack}>←</button> {/* Back Button */}
                <img src={logo} alt="Logo" className="logo" />
                <h1>Building Information</h1>
            </header>
 
            <main className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <label>Building Name</label>
                        <input
                            type="text"
                            value={buildingName}
                            onChange={(e) => setBuildingName(e.target.value)}
                            placeholder="Enter building name"
                            required
                        />
                    </div>
 
                    <div className="form-section">
                        <label>Building Address</label>
                        <input
                            type="text"
                            value={buildingAddress}
                            onChange={(e) => setBuildingAddress(e.target.value)}
                            placeholder="Enter building address"
                            required
                        />
                    </div>
 
                    <div className="form-section">
                        <label>Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter company name"
                            required
                        />
                    </div>
 
                    <button type="submit">Submit and Start Assessment</button>
                </form>
            </main>
        </div>
    );
}
 
export default BuildingInfoPage;