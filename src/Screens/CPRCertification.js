import React, { useState, useEffect } from 'react';
// Firestore
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from 'react-router-dom';
import { useBuilding } from '../Context/BuildingContext';
import './FormQuestions.css';
import logo from '../assets/MachaLogo.png';
import Navbar from "./Navbar";

function CPRCertificationFormPage() {
    const navigate = useNavigate();
    const { buildingId } = useBuilding();
    const db = getFirestore();
    const functions = getFunctions();
    const uploadImage = httpsCallable(functions, 'uploadCPRCertificationImage');

    // state
    const [formData, setFormData] = useState({});
    const [imageData, setImageData] = useState(null);      // base64 preview before upload
    const [imageUrl, setImageUrl] = useState(null);        // stored image URL
    const [imageUploadError, setImageUploadError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // questions (kept from your original)
    const questions = [
        { name: "cpr-certification-standards", label: "What certification standards or guidelines are followed for CPR training, such as those set by recognized organizations like the American Heart Association (AHA), American Red Cross (ARC), or similar accredited institutions?" },
        { name: "cpr-standards-alignment", label: "Are CPR certification courses aligned with the latest industry standards, guidelines, and best practices for adult, child, and infant CPR techniques, as well as automated external defibrillator (AED) use and choking relief procedures?" },
        { name: "cpr-techniques-addressed", label: "How do certification programs address specific CPR techniques, compression-to-ventilation ratios, rescuer fatigue management, and other factors that may impact the effectiveness of CPR interventions?" },
        { name: "cpr-instructor-qualifications", label: "What qualifications, credentials, and experience do CPR instructors possess to deliver high-quality training and ensure participant competency?" },
        { name: "instructor-certification", label: "Are CPR instructors certified by recognized CPR training organizations and accredited to teach CPR courses to school staff members?" },
        { name: "certifying-organizations", label: "List the organizations" },
        { name: "instructor-updates", label: "How do instructors stay updated on changes in CPR protocols, instructional methodologies, and training techniques to deliver relevant and effective CPR certification programs?" },
        { name: "course-delivery-methods", label: "How are CPR certification courses delivered to accommodate diverse learning styles, preferences, and scheduling constraints of school staff members?" },
        { name: "training-delivery-modes", label: "Are training sessions conducted in-person, online, or through blended learning approaches that combine both classroom instruction and self-paced online modules?" },
        { name: "training-resources-utilized", label: "What training resources, materials, and technologies are utilized to enhance participant engagement, skills acquisition, and knowledge retention during CPR certification courses?" },
        { name: "cpr-skills-assessment", label: "How are CPR skills assessed and evaluated to ensure staff members achieve and maintain proficiency in performing CPR techniques effectively?" },
        { name: "hands-on-practice-opportunities", label: "Are participants provided with opportunities for hands-on practice, skills demonstrations, and scenario-based simulations to apply CPR skills in simulated emergency situations?" },
        { name: "competency-criteria", label: "What criteria or performance standards are used to measure participant competency, and how are assessments conducted to verify skill mastery and readiness to respond to cardiac arrest events?" },
        { name: "recertification-requirements", label: "What are the recertification requirements and intervals for maintaining CPR certification among school staff members, as recommended by CPR training organizations or regulatory agencies?" },
        { name: "recertification-course-availability", label: "Are recertification courses offered regularly to ensure staff members renew their CPR certification within the specified timeframe and stay updated on CPR protocols and techniques?" },
        { name: "recertification-communication", label: "How are staff members informed about recertification deadlines, renewal procedures, and opportunities for continuing education to sustain their CPR skills and knowledge over time?" },
    ];

    // progress display values
    const totalQuestions = questions.length;
    const answeredCount = Object.values(formData).filter(v => v === 'yes' || v === 'no').length;

    // fetch saved form data on mount
    useEffect(() => {
        if (!buildingId) {
            alert('No building selected. Redirecting to Building Info...');
            navigate('/BuildingandAddress');
            return;
        }

        const fetchFormData = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const formDocRef = doc(db, 'forms', 'Personnel Training and Awareness', 'CPR Certification', buildingId);
                const snap = await getDoc(formDocRef);
                if (snap.exists()) {
                    const saved = snap.data().formData || {};
                    setFormData(saved);
                    setImageUrl(saved.imageUrl || null);
                } else {
                    setFormData({});
                }
            } catch (err) {
                console.error("Error fetching CPR form data:", err);
                setLoadError("Failed to load form data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [buildingId, db, navigate]);

    // handleChange: update state and auto-save (with progress)
    const handleChange = async (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        if (!buildingId) return;

        try {
            const buildingRef = doc(db, 'Buildings', buildingId);
            const formDocRef = doc(db, 'forms', 'Personnel Training and Awareness', 'CPR Certification', buildingId);

            const dataToSave = {
                ...newFormData,
                building: buildingRef,
                ...(imageUrl && { imageUrl })
            };

            // compute progress
            const total = questions.length;
            const answered = Object.values(newFormData).filter(v => v === 'yes' || v === 'no').length;

            await setDoc(formDocRef, { formData: dataToSave, progress: { answered, total } }, { merge: true });
            // don't alert on every save
        } catch (err) {
            console.error("Error auto-saving CPR form data:", err);
            // optional: set a transient UI message, but avoid alerts on every change
        }
    };

    // image selection (base64 preview stored in imageData)
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageData(reader.result);   // base64 string
            setImageUrl(null);             // clear previous URL until upload
            setImageUploadError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleBack = () => navigate(-1);

    // final submit: upload image (if any) and save final form data + progress
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!buildingId) {
            alert('Building ID is missing. Please start from the Building Information page.');
            return;
        }

        setLoading(true);
        setImageUploadError(null);
        let finalImageUrl = formData.imageUrl || null;
        let submissionError = null;

        // 1) upload image if new base64 provided
        if (imageData) {
            try {
                const uploadResult = await uploadImage({ imageData, buildingId });
                finalImageUrl = uploadResult.data.imageUrl;
                setImageUrl(finalImageUrl);
            } catch (err) {
                console.error("Image upload failed:", err);
                setImageUploadError(err.message || "Failed to upload image.");
                submissionError = "Image upload failed. Form data will be saved without the new image.";
                finalImageUrl = formData.imageUrl || null;
            }
        }

        // 2) save final form + progress
        try {
            const buildingRef = doc(db, 'Buildings', buildingId);
            const formDocRef = doc(db, 'forms', 'Personnel Training and Awareness', 'CPR Certification', buildingId);

            const finalFormData = {
                ...formData,
                ...(finalImageUrl && { imageUrl: finalImageUrl }),
                building: buildingRef
            };

            const total = questions.length;
            const answered = Object.values(finalFormData).filter(v => v === 'yes' || v === 'no').length;

            await setDoc(formDocRef, { formData: finalFormData, progress: { answered, total } }, { merge: true });

            if (!submissionError) {
                alert('Form submitted successfully!');
            } else {
                alert(submissionError);
            }
            navigate('/Form');
        } catch (err) {
            console.error("Error saving final form data:", err);
            alert("Failed to save final form data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // render loading / error
    if (loading && !loadError) return <div>Loading...</div>;
    if (loadError) return <div>Error: {loadError}</div>;

    return (
        <div className="form-page">
            <header className="header">
                <Navbar />
                <button className="back-button" onClick={handleBack}>←</button>
                <h1>CPR Certification Assessment</h1>
                <img src={logo} alt="Company logo" className="logo" />
            </header>

            <main className="form-container">
                <p style={{ fontWeight: 'bold', marginBottom: 10 }}>
                    {answeredCount} of {totalQuestions} questions answered
                </p>

                <form onSubmit={handleSubmit}>
                    <h2>CPR Certification Questions</h2>

                    {questions.map((q) => (
                        <div key={q.name} className="form-section">
                            <label>{q.label}</label>
                            <div>
                                <input
                                    type="radio"
                                    id={`${q.name}-yes`}
                                    name={q.name}
                                    value="yes"
                                    checked={formData[q.name] === "yes"}
                                    onChange={handleChange}
                                />
                                <label htmlFor={`${q.name}-yes`}> Yes</label>

                                <input
                                    type="radio"
                                    id={`${q.name}-no`}
                                    name={q.name}
                                    value="no"
                                    checked={formData[q.name] === "no"}
                                    onChange={handleChange}
                                />
                                <label htmlFor={`${q.name}-no`}> No</label>
                            </div>

                            <input
                                type="text"
                                name={`${q.name}Comment`}
                                placeholder="Additional comments"
                                value={formData[`${q.name}Comment`] || ''}
                                onChange={handleChange}
                                className="comment-input"
                            />
                        </div>
                    ))}

                    <div className="form-section">
                        <label htmlFor="imageUpload">Upload Supporting Image (Optional):</label>
                        <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} />
                        {imageUrl && !imageData && <img src={imageUrl} alt="Uploaded evidence" style={{ maxWidth: 200, marginTop: 10 }} />}
                        {imageData && <img src={imageData} alt="Preview" style={{ maxWidth: 200, marginTop: 10 }} />}
                        {imageUploadError && <p style={{ color: 'red' }}>{imageUploadError}</p>}
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default CPRCertificationFormPage;