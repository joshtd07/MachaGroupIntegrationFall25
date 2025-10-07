import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useBuilding } from '../Context/BuildingContext'; // Context for buildingId
import './FormQuestions.css';

function PolicyRevisionApprovalWorkflowPage() {
  const navigate = useNavigate();  // Initialize useNavigate hook for navigation
  const { buildingId } = useBuilding();
  const db = getFirestore();

  const [formData, setFormData] = useState();

  useEffect(() => {
    if(!buildingId) {
      alert('No builidng selected. Redirecting to Building Info...');
      navigate('BuildingandAddress'); 
    }
  }, [buildingId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to handle back button
  const handleBack = () => {
    navigate(-1);  // Navigates to the previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!buildingId) {
      alert('Building ID is missing. Please start the assessment from the correct page.');
      return;
    }

    try {
      // Create a document reference to the building in the 'Buildings' collection
      const buildingRef = doc(db, 'Buildings', buildingId);

      // Store the form data in the specified Firestore structure
      const formsRef = collection(db, 'forms/Policy and Compliance/Policy Revision Approval Workflow');
      await addDoc(formsRef, {
        buildling: buildingRef,
        formData: formData,
      });
      console.log('Form Data submitted successfully!')
      alert('Form Submitted successfully!');
      navigate('/Form');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please try again.');
    }
  };


  return (
    <div className="form-page">
        <header className="header">
            {/* Back Button */}
        <button className="back-button" onClick={handleBack}>←</button> {/* Back button at the top */}
            <h1>5.4.2.1 Change Management Process</h1>
        </header>

        <main className="form-container">
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                {/* Policy Revision Approval Workflow */}
                <h3>5.4.2.1.1 Policy Revision Approval Workflow</h3>
                <label>What are the steps involved in the policy revision approval process?</label>
            <div>
              <input type="text" name="revisionApprovalSteps" placeholder="Describe the steps involved in the approval process" />
            </div>
          </div>

          <div className="form-section">
            <label>Who are the key stakeholders involved in approving policy revisions?</label>
            <div>
              <input type="text" name="approvalStakeholders" placeholder="Describe the key stakeholders involved in policy revisions" />
            </div>
          </div>

          <div className="form-section">
            <label>How are revisions communicated to all affected parties once approved?</label>
            <div>
              <input type="text" name="revisionCommunication" placeholder="Describe how revisions are communicated to stakeholders" />
            </div>
          </div>

          <div className="form-section">
            <label>What timelines are established for reviewing and approving proposed policy changes?</label>
            <div>
              <input type="text" name="revisionTimelines" placeholder="Describe the timelines for reviewing and approving revisions" />
            </div>
          </div>

          <div className="form-section">
            <label>How is the effectiveness of the policy revision process evaluated after implementation?</label>
            <div>
              <input type="text" name="revisionEffectivenessEvaluation" placeholder="Describe how effectiveness is evaluated" />
            </div>
          </div>

                    {/* Submit Button */}
                    <button type="submit">Submit</button>

            </form>
        </main>
    </div>
  )
}

export default PolicyRevisionApprovalWorkflowPage;