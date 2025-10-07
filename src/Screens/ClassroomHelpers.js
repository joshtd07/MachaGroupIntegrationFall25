import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useBuilding } from '../Context/BuildingContext';
import './FormQuestions.css';
import logo from '../assets/MachaLogo.png';
import Navbar from "./Navbar";
import { getFunctions, httpsCallable } from "firebase/functions";

function ClassroomHelpersPage() {
    const navigate = useNavigate();
    const { buildingId } = useBuilding();
    const db = getFirestore();
    const functions = getFunctions();
    const uploadClassroomHelpersImage = httpsCallable(functions, 'uploadClassroomHelpersImage');

    const [formData, setFormData] = useState({});
    const [imageData, setImageData] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        if (!buildingId) {
            alert('No building selected. Redirecting to Building Info...');
            navigate('BuildingandAddress');
            return;
        }

        const fetchFormData = async () => {
            setLoading(true);
            setLoadError(null);

            try {
                const formDocRef = doc(db, 'forms', 'Community Partnership', 'Classroom Helpers', buildingId);
                const docSnapshot = await getDoc(formDocRef);

                if (docSnapshot.exists()) {
                    setFormData(docSnapshot.data().formData || {});
                } else {
                    setFormData({});
                }
            } catch (error) {
                console.error("Error fetching form data:", error);
                setLoadError("Failed to load form data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [buildingId, db, navigate]);


const handleChange = async (e) => {
       const { name, value } = e.target;
          const newFormData = { ...formData, [name]: value };
                setFormData(newFormData);
                                 
                try {
                const buildingRef = doc(db, 'Buildings', buildingId); // Create buildingRef
                const formDocRef = doc(db, 'forms', 'Community Partnership', 'Classroom Helpers', buildingId);
                    await setDoc(formDocRef, { formData: { ...newFormData, building: buildingRef } }, { merge: true }); // Use merge and add building
                    console.log("Form data saved to Firestore:", { ...newFormData, building: buildingRef });
                    } catch (error) {
                      console.error("Error saving form data to Firestore:", error);
                   alert("Failed to save changes. Please check your connection and try again.");
                                        }
                                    };  

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageData(reader.result);
        };
        reader.readAsDataURL(file);
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

        if (imageData) {
            try {
                const uploadResult = await uploadClassroomHelpersImage({ imageData: imageData });
                setImageUrl(uploadResult.data.imageUrl);
                setFormData({ ...formData, imageUrl: uploadResult.data.imageUrl });
                setImageUploadError(null);
            } catch (error) {
                console.error('Error uploading image:', error);
                setImageUploadError(error.message);
            }
        }

        try {
            const formDocRef = doc(db, 'forms', 'Community Partnership', 'Classroom Helpers', buildingId);
            await setDoc(formDocRef, { formData: formData }, { merge: true });
            console.log('Form data submitted successfully!');
            alert('Form submitted successfully!');
            navigate('/Form');
        } catch (error) {
            console.error("Error saving form data to Firestore:", error);
            alert("Failed to save changes. Please check your connection and try again.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (loadError) {
        return <div>Error: {loadError}</div>;
    }

    return (
        <div className="form-page">
            <header className="header">
                <Navbar />
                <button className="back-button" onClick={handleBack}>←</button>
                <h1>Classroom Helpers</h1>
                <img src={logo} alt="Logo" className="logo" />
            </header>

            <main className="form-container">
                <form onSubmit={handleSubmit}>
                    <h2>6.3.1.2.1. Classroom Helpers</h2>
                    {[
                        { name: "classroomHelpersTraining", label: "What training is provided to classroom helpers regarding student safety and emergency procedures?" },
                        { name: "screeningClassroomHelpers", label: "How are classroom helpers screened to ensure they are suitable for working with students?" },
                        { name: "maintainingASafeEnviroment", label: "In what ways do classroom helpers contribute to maintaining a safe and supportive environment in the classroom?" },
                        { name: "informingClassroomHelpers", label: "How are classroom helpers informed about the school’s safety policies and reporting procedures?" },
                        { name: "feedbackMechanisms", label: "What feedback mechanisms are in place for classroom helpers to communicate concerns or suggestions about safety in the classroom?" }
                    ].map((question, index) => (
                        <div key={index} className="form-section">
                            <label>{question.label}</label>
                            <input
                                type="text"
                                name={question.name}
                                placeholder={question.label}
                                value={formData[question.name] || ''}
                                onChange={handleChange}
                            />
                        </div>
                    ))}
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {imageUrl && <img src={imageUrl} alt="Uploaded Image" />}
                    {imageUploadError && <p style={{ color: 'red' }}>{imageUploadError}</p>}
                    <button type="submit">Submit</button>
                </form>
            </main>
        </div>
    );
}

export default ClassroomHelpersPage;