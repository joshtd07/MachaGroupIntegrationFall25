// Rewritten ExecutiveSummary.js — full file
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "firebase/firestore";
import './ExecutiveSummary.css';
import questions from './Questions.js'; // mapping used by AssessmentDetails

function ExecutiveSummary() {
    const navigate = useNavigate();
    const location = useLocation();
    const db = getFirestore();

    // Editable executive form state (unchanged)
    const [formData, setFormData] = useState({
        reportedBy: '',
        fileName: 'ExecutiveSummary',
        dateOfReport: new Date().toISOString().slice(0, 10),
        reportLead: '',
        assessors: [''],
        purpose: '',
        background: '',
        focusAreas: '',
        sitesAssessed: '',
        sitesNotAssessed: '',
        leaderAreasOfInterest: '',
        observationsHigh: 0,
        observationsSignificant: 0,
        observationsModerate: 0,
        observationsLow: 0,
        pointsOfContact: '',
    });

    // Raw fetched assessment (single) -- preserved for backward navigation support
    const [assessment, setAssessment] = useState(null);
    const [loadingAssessment, setLoadingAssessment] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // State for building dropdown and the fetched assessments list
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [assessments, setAssessments] = useState([]); // array of assessment detail objects
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Categories / subcategories (copied from PastAssessments to match queries)
    const formCategories = [
        "Community Partnership",
        "Continuous Improvement - Safety and Security",
        "Cybersecurity",
        "Emergency Preparedness",
        "Personnel Training and Awareness",
        "Physical Security",
        "Policy and Compliance"
    ];

    const subCategories = {
        "Community Partnership": [
            "Active Shooter Drills with Police",
            "Assessing Community Needs and Priorities",
            "Back-to-School Nights",
            "Classroom Helpers",
            "Crisis Intervention Workshops",
            "Emergency Response Training2",
            "Feedback Collection from Community",
            "Fire Department Access to School Facilities",
            "Fire Drills and Evacuation Planning",
            "Fire Safety Education for Students",
            "Firefighter Training Sessions",
            "Fundraising Events",
            "Mutual Aid Agreements",
            "Parent Chaperones for Field Trips",
            "Parent Workshops on Student Safety",
            "Parent-Teacher Conferences",
            "Planning Community Outreach Strategies",
            "SRO Roles and Responsibilities",
            "SRO Training and Certification"
        ],
        "Continuous Improvement - Safety and Security": [
            "Access Control Systems Assessment",
            "Backup Systems and Redundancies",
            "Biometric Access Control Systems",
            "CCTV Camera Installation and Monitoring",
            "Communication Protocols2",
            "Critical Function Identification",
            "Cybersecurity Vulnerability Assessment",
            "Data Encryption Protocols",
            "Endpoint Security Solutions",
            "Enviromental Hazards Assessment",
            "Evacuation Procedures Training",
            "External Communication Protocols",
            "External Threats",
            "Fire Drills 2",
            "Fire Safety Training",
            "Firewall Implementation and Configuration",
            "Identifying Suspicious Behavior 2",
            "Internal Communication Protocols",
            "Internal Threats",
            "Intrusion Detection Systems 3",
            "Intrusion Prevention Systems",
            "Keycard Access Systems",
            "Likelihood and Impact Assessment",
            "Lockdown Drills 3",
            "Perimter Security Evaluations",
            "Perimter Security Fencing",
            "Physical Hazards Assessment",
            "Regular Data Backups",
            "Response To Security Threats",
            "Roles and Responsilibilities of Emergency Response Team",
            "Safety and Security Training",
            "Simulated Emergency Drills"
        ],
        "Cybersecurity": [
            "Access Control Lists",
            "Antivirus Software",
            "Device Encryption",
            "Firewall Policies",
            "Incident Response Patch Management",
            "Malware Removal Tools",
            "Network Anomaly Detection",
            "Patch Management",
            "Security Information and Event Management"
        ],
        "Emergency Preparedness": [
            "Classroom Lockdownm Protocols",
            "Conflict Resolution",
            "Disaster Drills",
            "Drill Scenerios",
            "Earthquake Drills",
            "Emergency Communication",
            "Evacuation Procedures",
            "Fire Alarm Systems",
            "Fire Drill",
            "Fire Extinguisher Locations",
            "First Aid Response",
            "Law Enforcement Coordination",
            "Lockdown Communication Protocols",
            "Severe Weather Monitoring",
            "Tornado Drills",
            "Tornado Shelter Locations"
        ],
        "Personnel Training and Awareness": [
            "Acceptable Use Policy Training",
            "Active Shooter Response",
            "Anonymous Reporting Systems",
            "Basic First Aid Techniques",
            "CPR Certification",
            "Curriculum Integration",
            "Cyber Bullying",
            "Data Handling Guidelines",
            "Data Protection",
            "Emergency Communication",
            "Emergency Contacts",
            "Emergency Evacuation Procedures",
            "Emergency Response Protocols",
            "Emergency Shelters",
            "Fire Department Collaboration",
            "Fire Drills",
            "First Aid CPR Training",
            "Healthcare Provider Engagement",
            "Identifying Suspicious Behavior",
            "Incident Reporting Procedures",
            "Internet Safety",
            "Law Enforcement Partnerships",
            "Lockdown Drills",
            "Medical Facilities",
            "Parent Advisory Committees",
            "Parent Involvement",
            "Parent Volunteer Programs",
            "Parent-Teacher Associations",
            "Password Security",
            "Peer Support Networks",
            "Phishing Awareness",
            "Physical Bullying",
            "Post-Incident Support",
            "Recertification Schedule",
            "Recognizing Security Breaches",
            "Recognizing Security Incidents",
            "Response Protocols",
            "Role-PLaying Scenarios",
            "Safety Demonstrations",
            "Safety Workshop",
            "Severe Weather Preparedness",
            "Stranger Danger Awareness",
            "Student Handbook",
            "Student Leadership",
            "Training Materials",
            "Training Providers",
            "Trusted Adults",
            "Verbal Bullying"
        ],
        "Physical Security": [
            "Access Control Keypads",
            "Access Control Software",
            "Access Control Systems",
            "Biometric Scanners",
            "Bullet Cameras",
            "Card Readers",
            "Dome Cameras",
            "Door Alarms",
            "Door Locks",
            "Fence Sensors",
            "Floodlights",
            "Front Desk Security",
            "Gate Alarms",
            "Glass Break Sensors",
            "Infrared Cameras",
            "Motion Activated Lights",
            "Motion Sensors",
            "PTZ Cameras",
            "Perimeter Fencing",
            "Razor Wire",
            "Roving Patrols",
            "Security Gates",
            "Stationed Guards",
            "Turnstiles",
            "Vehicle Barrier",
            "Vehicle Barriers",
            "Visitor Check-In",
            "WeatherProof Cameras",
            "Weatherproof Cameras",
            "Window Locks"
        ],
        "Policy and Compliance": [
            "Access Restrictions",
            "Compliance with Regulations",
            "Consent Management",
            "Data Access Controls",
            "Data Breach Notification Procedures",
            "Data Classification",
            "Data Minimization",
            "Data Protection Impact Assessments",
            "Data Retention Periods",
            "Data Security Requirements",
            "Data Sharing Policies",
            "Documentation Of Policy Changes",
            "Effectiveness In Addressing Security Risks",
            "Encrpytion Requirements",
            "Personal Device Usage",
            "Policy Revision Approval Workflow",
            "Staff input On Policy Impact",
            "Student Data Privacy Policies",
            "Student Privacy Rights"
        ]
    };

    // --- Handlers & helpers for editable inputs (unchanged) ---
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (e.target.valueAsNumber || parseInt(value, 10) || 0) : value;
        setFormData(prevData => ({
            ...prevData,
            [name]: val,
        }));
    };

    const handleAssessorChange = (index, value) => {
        const updatedAssessors = [...formData.assessors];
        updatedAssessors[index] = value;
        setFormData(prevData => ({
            ...prevData,
            assessors: updatedAssessors,
        }));
    };

    const addAssessor = () => {
        setFormData(prevData => ({
            ...prevData,
            assessors: [...prevData.assessors, ''],
        }));
    };

    const removeAssessor = (index) => {
        if (formData.assessors.length <= 1) return;
        const updatedAssessors = formData.assessors.filter((_, i) => i !== index);
        setFormData(prevData => ({
            ...prevData,
            assessors: updatedAssessors,
        }));
    };

    // helper: determine if a key is a comment key
    const isCommentKey = (key) => /comment$/i.test(key) || /_comment$/i.test(key) || / comment$/i.test(key);

    // helper: get a comment for a question key (try several possible comment key names)
    const getCommentForKey = (fd, key) => {
        if (!fd) return undefined;
        const candidates = [
            `${key}Comment`,
            `${key} comment`,
            `${key}_comment`,
            `${key}Comment`.toLowerCase(),
            `${key}comment`,
        ];
        for (const c of candidates) {
            if (Object.prototype.hasOwnProperty.call(fd, c) && fd[c] !== undefined && fd[c] !== null) {
                return fd[c];
            }
        }
        // fallback: try keys that end with 'comment' and start with the same prefix
        const prefix = key.replace(/Comment$/i, '');
        for (const k of Object.keys(fd)) {
            if (isCommentKey(k) && k.toLowerCase().startsWith(prefix.toLowerCase())) {
                return fd[k];
            }
        }
        return undefined;
    };

    // helper: make a pretty label if questions mapping is missing
    const prettyLabel = (key) => {
        if (!key) return '';
        if (questions && questions[key]) return questions[key];
        // convert camelCase / snake_case / kebab-case to Title Case
        let s = String(key)
            // replace underscores/hyphens with spaces
            .replace(/[_\-]+/g, ' ')
            // insert spaces before camelCase boundaries
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            // trim
            .trim();
        // split and capitalize each word
        s = s.split(/\s+/).map(word => {
            if (!word) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        return s;
    };

    // --- Generate PDF (enhanced to include all assessments and to skip comment-key duplication) ---
    const generatePdf = () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();

        const leftMargin = 15;
        const topMargin = 20;
        const bottomMargin = 20;
        const usableWidth = pageWidth - 2 * leftMargin;
        const valueIndent = 8; // smaller indent for Answer lines
        const baseFontSize = 11;
        const titleFontSize = 18;
        const headingFontSize = 14;
        const lineHeight = 6;
        const sectionSpacing = lineHeight * 1.5;
        const headerSpacing = lineHeight * 0.8;

        let yPos = topMargin;

        const checkPageBreak = (heightNeeded) => {
            if (yPos + heightNeeded >= pageHeight - bottomMargin) {
                pdf.addPage();
                yPos = topMargin;
            }
        };

        const addWrappedText = (text, x, maxWidth, options = {}) => {
            if (!text) text = '-';
            const lines = pdf.splitTextToSize(String(text), maxWidth);
            const blockHeight = lines.length * lineHeight;
            checkPageBreak(blockHeight);
            const originalSize = pdf.getFontSize();
            const originalStyle = pdf.getFont().fontStyle;
            pdf.setFontSize(options.fontSize || baseFontSize);
            pdf.setFont(undefined, options.fontStyle || 'normal');
            if (options.color) pdf.setTextColor(options.color);
            pdf.text(lines, x, yPos);
            yPos += blockHeight;
            pdf.setFontSize(originalSize);
            pdf.setFont(undefined, originalStyle);
            pdf.setTextColor(0, 0, 0);
        };

        const addQuestionBlock = (questionLabel, answerText, commentText) => {
            // Print question label in bold
            checkPageBreak(lineHeight);
            pdf.setFontSize(baseFontSize);
            pdf.setFont(undefined, 'bold');
            pdf.text(questionLabel, leftMargin, yPos);
            yPos += lineHeight * 0.9;

            // Print Answer: <answerText>
            pdf.setFont(undefined, 'normal');
            addWrappedText(`Answer: ${answerText}`, leftMargin + valueIndent, usableWidth - valueIndent);

            // Print Comment if present
            if (commentText) {
                addWrappedText(`Comment: ${String(commentText)}`, leftMargin + valueIndent, usableWidth - valueIndent, { fontSize: baseFontSize - 1 });
            }

            // Small spacing after each block
            yPos += sectionSpacing * 0.2;
        };

        const addSectionHeader = (title) => {
            checkPageBreak(headingFontSize * 0.5 + headerSpacing + sectionSpacing);
            pdf.setFontSize(headingFontSize);
            pdf.setFont(undefined, 'bold');
            pdf.text(title, leftMargin, yPos);
            yPos += headerSpacing;
            pdf.setLineWidth(0.3);
            pdf.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
            yPos += sectionSpacing;
        };

        // --- Document title ---
        checkPageBreak(titleFontSize * 0.5);
        pdf.setFontSize(titleFontSize);
        pdf.setFont(undefined, 'bold');
        pdf.text('Executive Summary Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += titleFontSize * 0.5 + sectionSpacing;

        // --- Top-level executive details ---
        addSectionHeader('Report Details');
        pdf.setFontSize(baseFontSize);
        pdf.setFont(undefined, 'normal');
        addQuestionBlock('Reported By', formData.reportedBy || '-', null);
        addQuestionBlock('File Name', formData.fileName || '-', null);
        addQuestionBlock('Date of Report', formData.dateOfReport || '-', null);
        addQuestionBlock('Report Lead', formData.reportLead || '-', null);

        addSectionHeader('Team Composition');
        pdf.setFontSize(baseFontSize);
        pdf.setFont(undefined, 'normal');
        const validAssessors = formData.assessors ? formData.assessors.filter(a => a && a.trim() !== '') : [];
        if (validAssessors.length > 0) {
            validAssessors.forEach((assessor) => {
                addWrappedText(`- ${assessor}`, leftMargin + 5, usableWidth - 5);
            });
            yPos += sectionSpacing * 0.5;
        } else {
            addWrappedText('- None listed', leftMargin + 5, usableWidth - 5);
            yPos += sectionSpacing * 0.5;
        }

        addSectionHeader('Executive Summary');
        pdf.setFontSize(baseFontSize);
        pdf.setFont(undefined, 'normal');
        addQuestionBlock('1) Purpose', formData.purpose || '-', null);
        addQuestionBlock('2) Background', formData.background || '-', null);
        addQuestionBlock('3) Focus Areas', formData.focusAreas || '-', null);
        addQuestionBlock('4) Sites Assessed', formData.sitesAssessed || '-', null);
        addQuestionBlock('5) Sites Not Assessed', formData.sitesNotAssessed || '-', null);
        addQuestionBlock("6) Leader's areas of interest", formData.leaderAreasOfInterest || '-', null);

        // Observations
        checkPageBreak(lineHeight * 1.5);
        pdf.setFontSize(baseFontSize);
        pdf.setFont(undefined, 'bold');
        pdf.text('7) Observations (Findings):', leftMargin, yPos);
        pdf.setFont(undefined, 'normal');
        yPos += lineHeight;
        const obsText = `High: ${formData.observationsHigh || 0}, Significant: ${formData.observationsSignificant || 0}, Moderate: ${formData.observationsModerate || 0}, Low: ${formData.observationsLow || 0}`;
        addWrappedText(obsText, leftMargin + valueIndent, usableWidth - valueIndent);
        yPos += sectionSpacing * 0.5;

        addQuestionBlock('8) Points of Contact', formData.pointsOfContact || '-', null);

        // Print each assessment (all fetched assessments) in full
        if (assessments && assessments.length > 0) {
            addSectionHeader(`All Assessments (${assessments.length})`);
            for (const a of assessments) {
                const assessmentTitle = `${a.formName || a.id}${a.formType ? ` — ${a.formType}` : ''}`;
                checkPageBreak(lineHeight * 2);
                pdf.setFontSize(baseFontSize);
                pdf.setFont(undefined, 'bold');
                pdf.text(assessmentTitle, leftMargin, yPos);
                yPos += lineHeight;
                if (a.buildingName) {
                    pdf.setFont(undefined, 'normal');
                    addWrappedText(`Building: ${a.buildingName}`, leftMargin + 5, usableWidth - 5);
                }

                const fd = a.formData || {};
                // iterate formData keys in stable order, skipping keys that look like comments
                const entries = Object.entries(fd).filter(([k]) => !isCommentKey(k));

                for (const [key, value] of entries) {
                    if (key === 'building') continue; // already printed building
                    const questionLabel = prettyLabel(key);

                    // image detection
                    const isImageField = key.toLowerCase().includes('image') ||
                        key.toLowerCase().includes('imageurl') ||
                        (typeof value === 'string' && value.startsWith('http') && (key.toLowerCase().includes('photo') || key.toLowerCase().includes('image')));

                    if (isImageField) {
                        // For PDF we print the URL (embedding images is a separate enhancement)
                        const urlText = typeof value === 'string' ? value : '[image]';
                        addQuestionBlock(questionLabel, urlText, getCommentForKey(fd, key));
                        continue;
                    }

                    let renderedValue;
                    if (Array.isArray(value)) {
                        renderedValue = value.join(', ');
                    } else if (value && typeof value === 'object') {
                        try { renderedValue = JSON.stringify(value); } catch (e) { renderedValue = String(value); }
                    } else {
                        renderedValue = (value === '' || value === null || value === undefined) ? '-' : String(value);
                    }

                    addQuestionBlock(questionLabel, renderedValue, getCommentForKey(fd, key));
                }

                yPos += sectionSpacing * 0.5;
            }
        }

        // Also include the single assessment loaded via navigation state (if present) and not already in assessments
        if (assessment && (!assessments || !assessments.find(a => a.id === assessment.id))) {
            addSectionHeader('Selected Assessment');
            const a = assessment;
            const assessmentTitle = `${a.formName || a.id}${a.formType ? ` — ${a.formType}` : ''}`;
            pdf.setFontSize(baseFontSize);
            pdf.setFont(undefined, 'bold');
            pdf.text(assessmentTitle, leftMargin, yPos);
            yPos += lineHeight;
            if (a.buildingName) {
                pdf.setFont(undefined, 'normal');
                addWrappedText(`Building: ${a.buildingName}`, leftMargin + 5, usableWidth - 5);
            }
            const fd = a.formData || {};
            const entries = Object.entries(fd).filter(([k]) => !isCommentKey(k));
            for (const [key, value] of entries) {
                if (key === 'building') continue;
                const questionLabel = prettyLabel(key);

                const isImageField = key.toLowerCase().includes('image') ||
                    key.toLowerCase().includes('imageurl') ||
                    (typeof value === 'string' && value.startsWith('http') && (key.toLowerCase().includes('photo') || key.toLowerCase().includes('image')));

                if (isImageField) {
                    const urlText = typeof value === 'string' ? value : '[image]';
                    addQuestionBlock(questionLabel, urlText, getCommentForKey(fd, key));
                    continue;
                }

                let renderedValue;
                if (Array.isArray(value)) {
                    renderedValue = value.join(', ');
                } else if (value && typeof value === 'object') {
                    try { renderedValue = JSON.stringify(value); } catch (e) { renderedValue = String(value); }
                } else {
                    renderedValue = (value === '' || value === null || value === undefined) ? '-' : String(value);
                }

                addQuestionBlock(questionLabel, renderedValue, getCommentForKey(fd, key));
            }
        }

        pdf.save(`${formData.fileName || 'ExecutiveSummary'}.pdf`);
    };

    const handleGoBack = () => navigate(-1);

    // Map flexible keys from fetched assessment into the editable formData structure
    const mapAssessmentToFormData = (raw) => {
        if (!raw || !raw.formData) return {};
        const src = raw.formData;

        const pick = (keys, defaultVal = '') => {
            for (const k of keys) {
                if (src[k] !== undefined && src[k] !== null) return src[k];
            }
            return defaultVal;
        };

        const toArray = (val) => {
            if (!val) return [''];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') return val.split(/,|\n/).map(s => s.trim()).filter(Boolean);
            return [String(val)];
        };

        return {
            reportedBy: pick(['reportedBy', 'reported_by', 'author', 'creator'], ''),
            fileName: pick(['fileName', 'filename', 'reportFileName'], `ExecutiveSummary`),
            dateOfReport: (() => {
                const d = pick(['dateOfReport', 'reportDate', 'reported_at', 'report_date'], '');
                try {
                    if (d) {
                        const parsed = new Date(d);
                        if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
                    }
                } catch (e) { /* ignore */ }
                return new Date().toISOString().slice(0, 10);
            })(),
            reportLead: pick(['reportLead', 'lead', 'report_lead'], ''),
            assessors: toArray(pick(['assessors', 'assessorList', 'team', 'team.assessors', 'assessor'], [])),
            purpose: pick(['purpose', 'summaryPurpose', 'reportPurpose', 'Purpose'], ''),
            background: pick(['background', 'context', 'reportBackground', 'Background'], ''),
            focusAreas: pick(['focusAreas', 'focus', 'areasOfFocus', 'FocusAreas'], ''),
            sitesAssessed: (() => {
                const v = pick(['sitesAssessed', 'sites_assessed', 'assessedSites', 'siteName', 'buildingName'], '');
                if (Array.isArray(v)) return v.join(', ');
                return String(v || '');
            })(),
            sitesNotAssessed: pick(['sitesNotAssessed', 'sites_not_assessed', 'notAssessedSites'], ''),
            leaderAreasOfInterest: pick(['leaderAreasOfInterest', 'leader_interest', 'leadersInterest'], ''),
            observationsHigh: Number(pick(['observationsHigh', 'high', 'obs.high', 'observations.high'], 0)) || 0,
            observationsSignificant: Number(pick(['observationsSignificant', 'significant', 'obs.significant', 'observations.significant'], 0)) || 0,
            observationsModerate: Number(pick(['observationsModerate', 'moderate', 'obs.moderate', 'observations.moderate'], 0)) || 0,
            observationsLow: Number(pick(['observationsLow', 'low', 'obs.low', 'observations.low'], 0)) || 0,
            pointsOfContact: pick(['pointsOfContact', 'points_of_contact', 'contacts'], ''),
        };
    };

    // --- Fetch buildings (same as PastAssessments) ---
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const buildingsRef = collection(db, 'Buildings');
                const querySnapshot = await getDocs(buildingsRef);
                const buildingData = querySnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));
                setBuildings(buildingData);
            } catch (err) {
                console.error('Error fetching buildings:', err);
                setError("Error fetching building data.");
            }
        };
        fetchBuildings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Helpers to fetch assessments for a building (copied/adapted from PastAssessments) ---
    const getAssessmentDetails = useCallback(async (docSnap, category1, category2) => {
        try {
            const data = docSnap.data();
            const formName = category1 || 'N/A';
            const formType = category2 || 'N/A';
            return {
                id: docSnap.id,
                ...data,
                formName,
                formType,
            };
        } catch (err) {
            console.error('Error processing assessment details:', err);
            return null;
        }
    }, []);

    const fetchAssessments = useCallback(async (buildingId) => {
        setLoading(true);
        setError(null);
        setAssessments([]);

        if (!buildingId) {
            setLoading(false);
            return;
        }

        const buildingRef = doc(db, "Buildings", buildingId);

        try {
            const buildingSnap = await getDoc(buildingRef);
            if (!buildingSnap.exists()) {
                setLoading(false);
                setError('Building document not found.');
                return;
            }
        } catch (err) {
            console.error('Error fetching building document:', err);
            setError('Error fetching building document.');
            setLoading(false);
            return;
        }

        const allAssessments = [];
        const allPromises = [];

        for (const category1 of formCategories) {
            if (subCategories[category1]) {
                for (const category2 of subCategories[category1]) {
                    const collectionRef = collection(db, `forms/${category1}/${category2}`);
                    const q = query(collectionRef, where('formData.building', '==', buildingRef));
                    allPromises.push(getDocs(q));
                }
            }
        }

        try {
            const snapshots = await Promise.all(allPromises);
            let i = 0;
            for (const category1 of formCategories) {
                if (subCategories[category1]) {
                    for (const category2 of subCategories[category1]) {
                        const snapshot = snapshots[i];
                        snapshot.forEach(docSnap => {
                            allAssessments.push({
                                doc: docSnap,
                                category1,
                                category2
                            });
                        });
                        i++;
                    }
                }
            }
            const details = await Promise.all(allAssessments.map(a => getAssessmentDetails(a.doc, a.category1, a.category2)));
            const filtered = details.filter(Boolean);
            setAssessments(filtered);
        } catch (err) {
            console.error('Error fetching assessments:', err);
            setError('Error fetching assessments.');
        } finally {
            setLoading(false);
        }
    }, [db, formCategories, subCategories, getAssessmentDetails]);

    // When user selects a building, fetch all assessments for it and display them (no further selection)
    const handleBuildingChange = (e) => {
        const buildingId = e.target.value;
        setSelectedBuilding(buildingId);
        fetchAssessments(buildingId);
    };

    // Backwards compatibility: if navigated with location.state containing assessmentId/category1/category2, auto-load it
    useEffect(() => {
        const { assessmentId, category1, category2 } = location.state || {};
        if (assessmentId && category1 && category2) {
            // fetch that single assessment and populate assessment + formData as before
            const fetchSingle = async () => {
                setLoadingAssessment(true);
                setLoadError(null);
                try {
                    const docRef = doc(db, `forms/${category1}/${category2}`, assessmentId);
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        setLoadError('Assessment document not found.');
                        setAssessment(null);
                        setLoadingAssessment(false);
                        return;
                    }
                    const assessmentData = docSnap.data() || {};
                    let buildingName = '';
                    try {
                        const buildingRef = assessmentData.formData && assessmentData.formData.building;
                        if (buildingRef && typeof buildingRef === 'object' && buildingRef?.id) {
                            const bSnap = await getDoc(buildingRef);
                            if (bSnap.exists()) {
                                const bData = bSnap.data();
                                buildingName = bData?.buildingName || bData?.name || '';
                            }
                        } else if (assessmentData.formData && (assessmentData.formData.buildingName || assessmentData.formData.siteName)) {
                            buildingName = assessmentData.formData.buildingName || assessmentData.formData.siteName;
                        }
                    } catch (err) {
                        console.warn('Error fetching building ref', err);
                    }
                    const combined = { ...assessmentData, id: assessmentId, buildingName };
                    setAssessment(combined);
                    const mapped = mapAssessmentToFormData(assessmentData);
                    setFormData(prev => ({ ...prev, ...mapped }));
                } catch (err) {
                    console.error('Failed to fetch assessment', err);
                    setLoadError('Failed to load assessment data.');
                    setAssessment(null);
                } finally {
                    setLoadingAssessment(false);
                }
            };
            fetchSingle();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    // Render a single assessment (unsplit). Accepts an assessment object parameter.
    const renderSingleAssessment = (a) => {
        if (!a || !a.formData) return null;
        const fd = a.formData;
        // filter out keys that are comment keys; iterate main keys only
        const entries = Object.entries(fd).filter(([k]) => !isCommentKey(k));

        return (
            <div className="full-assessment-preview" key={a.id}>
                <h3 className="assessment-heading">{a.formName || a.id} {a.formType ? `— ${a.formType}` : ''}</h3>
                {a.buildingName && <div className="preview-row"><strong>Building:</strong> <span>{a.buildingName}</span></div>}
                {entries.map(([key, value]) => {
                    if (key === 'building') return null;
                    const label = prettyLabel(key);
                    const comment = getCommentForKey(fd, key);

                    // image detection
                    const isImageField = key.toLowerCase().includes('image') || key.toLowerCase().includes('imageurl') ||
                        (typeof value === 'string' && value.startsWith('http') && (key.toLowerCase().includes('photo') || key.toLowerCase().includes('image')));

                    if (isImageField) {
                        return (
                            <div className="question-answer-container" key={key}>
                                <strong>{label}</strong>
                                <div className="answer-line">Answer: {typeof value === 'string' && value.startsWith('http') ? <img src={value} alt={label} style={{ maxWidth: '100%', maxHeight: 300 }} /> : String(value)}</div>
                                {comment && <div className="comment-line"><em>Comment:</em> {comment}</div>}
                            </div>
                        );
                    }

                    let renderedValue;
                    if (Array.isArray(value)) {
                        renderedValue = value.join(', ');
                    } else if (value && typeof value === 'object') {
                        try { renderedValue = JSON.stringify(value); } catch (e) { renderedValue = String(value); }
                    } else {
                        renderedValue = (value === '' || value === null || value === undefined) ? '-' : String(value);
                    }

                    return (
                        <div className="question-answer-container" key={key}>
                            <strong>{label}</strong>
                            <div className="answer-line">Answer: {renderedValue}</div>
                            {comment && <div className="comment-line"><em>Comment:</em> {comment}</div>}
                        </div>
                    );
                })}
            </div>
        );
    };

    // JSX
    return (
        <div className="executive-summary-container">
            <button onClick={handleGoBack} className="back-button">&larr; Back</button>

            <h1>Executive Summary Report</h1>

            {/* Building select only — selecting a building fetches and displays all assessments for it */}
            <section className="filters">
                <div className="filter-group">
                    <label htmlFor="building">Building:</label>
                    <select id="building" name="building" value={selectedBuilding} onChange={handleBuildingChange}>
                        <option value="">Select Building</option>
                        {buildings.map((building) => (
                            <option key={building.id} value={building.id}>
                                {building.buildingName}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Executive editable form (unchanged) */}
            <div className="report-content-form-only">
                <h2>Report Details</h2>
                <div className="form-grid">
                    <label>
                        Reported By:
                        <input type="text" name="reportedBy" value={formData.reportedBy} onChange={handleChange} />
                    </label>
                    <label>
                        File Name (for PDF):
                        <input type="text" name="fileName" value={formData.fileName} onChange={handleChange} />
                    </label>
                    <label>
                        Date of Report:
                        <input type="date" name="dateOfReport" value={formData.dateOfReport} onChange={handleChange} />
                    </label>
                    <label>
                        Report Lead:
                        <input type="text" name="reportLead" value={formData.reportLead} onChange={handleChange} />
                    </label>
                </div>

                <h2>Team Composition</h2>
                <div className="assessors-section">
                    {formData.assessors.map((assessor, index) => (
                        <div key={index} className="assessor-item">
                            <label>
                                Assessor Name {index + 1}:
                                <input
                                    type="text"
                                    value={assessor}
                                    onChange={(e) => handleAssessorChange(index, e.target.value)}
                                    placeholder="Enter assessor name"
                                />
                            </label>
                            {formData.assessors.length > 1 && (
                                <button type="button" onClick={() => removeAssessor(index)} className="remove-btn">Remove</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addAssessor} className="add-btn">Add Assessor</button>
                </div>

                <h2>Executive Summary</h2>
                <label>
                    1) Purpose:
                    <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows="4" />
                </label>
                <label>
                    2) Background:
                    <textarea name="background" value={formData.background} onChange={handleChange} rows="4" />
                </label>
                <label>
                    3) Focus Areas:
                    <textarea name="focusAreas" value={formData.focusAreas} onChange={handleChange} rows="4" />
                </label>
                <label>
                    4) Sites Assessed:
                    <textarea name="sitesAssessed" value={formData.sitesAssessed} onChange={handleChange} rows="4" />
                </label>
                <label>
                    5) Sites Not Assessed:
                    <textarea name="sitesNotAssessed" value={formData.sitesNotAssessed} onChange={handleChange} rows="4" />
                </label>
                <label>
                    6) Leader's areas of interest:
                    <textarea name="leaderAreasOfInterest" value={formData.leaderAreasOfInterest} onChange={handleChange} rows="4" />
                </label>

                <fieldset>
                    <legend>7) Observations (Number of findings)</legend>
                    <div className="observations-grid">
                        <label>
                            High:
                            <input type="number" name="observationsHigh" min="0" value={formData.observationsHigh} onChange={handleChange} />
                        </label>
                        <label>
                            Significant:
                            <input type="number" name="observationsSignificant" min="0" value={formData.observationsSignificant} onChange={handleChange} />
                        </label>
                        <label>
                            Moderate:
                            <input type="number" name="observationsModerate" min="0" value={formData.observationsModerate} onChange={handleChange} />
                        </label>
                        <label>
                            Low:
                            <input type="number" name="observationsLow" min="0" value={formData.observationsLow} onChange={handleChange} />
                        </label>
                    </div>
                </fieldset>

                <label>
                    8) Points of Contact:
                    <textarea name="pointsOfContact" value={formData.pointsOfContact} onChange={handleChange} rows="4" />
                </label>
            </div>

            {/* When a building is selected we render ALL assessments' full forms (unsplit) */}
            <section className="assessments-list">
                <h2>Assessments</h2>
                {loading && <p>Loading assessments...</p>}
                {error && <p className="error-text">Error: {error}</p>}
                {assessments && assessments.length === 0 && !loading && <p>No assessments found for this building.</p>}
                {assessments.map(a => renderSingleAssessment(a))}
            </section>

            {/* If a single assessment was loaded via navigation state, also render it (backwards compatibility) */}
            {assessment && (
                <section className="assessment-single-legacy">
                    <h2>Selected Assessment</h2>
                    {renderSingleAssessment(assessment)}
                </section>
            )}

            {/* Export button moved to BOTTOM so PDF will capture full page content (executive + all assessments) */}
            <div style={{ marginTop: 16 }}>
                <button onClick={generatePdf} className="export-button">Export to PDF</button>
            </div>
        </div>
    );
}

export default ExecutiveSummary;
