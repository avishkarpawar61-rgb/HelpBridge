/**
 * Synthetic Demo Scenarios (Strictly labeled "SYNTHETIC DEMO DATA")
 * Designed for one-click testing and the 90-second hackathon live demo:
 * Scenario A: Elderly patient with blurry handwritten prescription + Hindi voice note
 * Scenario B: Caregiver describing a child's high fever (103°F) and spreading rash
 * Scenario C: Chaotic mix of old lab values + ACUTE RED-FLAG CARDIAC SYMPTOM
 */

/**
 * Generates a realistic synthetic handwritten prescription slip on a canvas
 */
function createSyntheticPrescriptionCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');

  // Paper background (creamy off-white with subtle texture)
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clinic Header
  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText('SHARMA WELLNESS CLINIC & HEART CARE', 50, 70);

  ctx.fillStyle = '#475569';
  ctx.font = '18px sans-serif';
  ctx.fillText('Dr. R. K. Sharma, MBBS, MD (Medicine) - Reg No: MH-49281', 50, 105);
  ctx.fillText('104, Sunrise Chambers, M.G. Road, Pune | Tel: 020-2567XXXX', 50, 130);

  // Divider line
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, 150);
  ctx.lineTo(850, 150);
  ctx.stroke();

  // Patient metadata
  ctx.fillStyle = '#1e293b';
  ctx.font = '20px sans-serif';
  ctx.fillText('Patient: Ramesh Patel', 50, 190);
  ctx.fillText('Age/Sex: 71 Y / Male', 450, 190);
  ctx.fillText('Date: 18-Oct-2026', 700, 190);
  ctx.fillText('BP: 162/96 mmHg', 50, 225);
  ctx.fillText('Weight: 68 kg', 450, 225);
  ctx.fillText('Known: T2D, HTN', 700, 225);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 245);
  ctx.lineTo(850, 245);
  ctx.stroke();

  // Rx symbol
  ctx.fillStyle = '#0f766e';
  ctx.font = 'italic bold 48px serif';
  ctx.fillText('Rx', 50, 310);

  // Handwritten cursive simulated text (blurry / doctor handwriting simulation)
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'italic 28px "Caveat", "Brush Script MT", cursive, sans-serif';
  ctx.fillText('1. Tab. Metformin 500mg ------ 1 tab BD (after meals)', 120, 350);
  ctx.fillText('2. Tab. Telmisartan 40mg ------ 1 tab OD (morning)', 120, 420);
  ctx.fillText('3. Tab. Amlodipine 5mg  ------ 1 tab HS (night)', 120, 490);
  ctx.fillText('4. Tab. Atorvastatin 20mg ----- 1 tab HS', 120, 560);
  ctx.fillText('5. Cap. Pantoprazole 40mg ----- 1 cap empty stomach OD', 120, 630);

  // Blurry scribbled notes
  ctx.fillStyle = '#334155';
  ctx.font = 'italic 24px "Caveat", cursive, sans-serif';
  ctx.fillText('Note: Advised low salt diet, check fasting blood sugar weekly.', 120, 720);
  ctx.fillText('Report ankle swelling if persists. Review with S.Creatinine after 2 wks.', 120, 770);

  // Doctor Signature
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(620, 950);
  ctx.bezierCurveTo(660, 910, 700, 990, 750, 930);
  ctx.bezierCurveTo(770, 900, 800, 920, 830, 950);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '18px sans-serif';
  ctx.fillText('Dr. R.K. Sharma (Signature)', 620, 990);

  // Prominent Synthetic Watermark
  ctx.save();
  ctx.translate(450, 600);
  ctx.rotate(-Math.PI / 6);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
  ctx.font = 'bold 50px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SYNTHETIC DEMO DATA — NOT REAL PHI', 0, 0);
  ctx.restore();

  return canvas;
}

/**
 * Generates a synthetic emergency lab report canvas with abnormal cardiac/metabolic markers
 */
function createSyntheticLabReportCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('METROPATH DIAGNOSTIC LABORATORIES', 50, 60);
  ctx.fillStyle = '#64748b';
  ctx.font = '16px sans-serif';
  ctx.fillText('ISO 15189 Certified Reference Lab | Urgent Cardiac & Metabolic Panel', 50, 90);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 110);
  ctx.lineTo(850, 110);
  ctx.stroke();

  // Patient Info
  ctx.fillStyle = '#0f172a';
  ctx.font = '16px monospace';
  ctx.fillText('Patient: Ashok K. Deshmukh       Age/Sex: 58 Y / Male      Date: 23-Oct-2026 11:45', 50, 140);
  ctx.fillText('Ref By: Self / Walk-in Emergency    Sample ID: MP-982143      Status: CRITICAL ALERT', 50, 165);

  // Table Header
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(50, 190, 800, 35);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('TEST DESCRIPTION', 65, 213);
  ctx.fillText('OBSERVED VALUE', 360, 213);
  ctx.fillText('REFERENCE RANGE', 550, 213);
  ctx.fillText('STATUS', 750, 213);

  // Test rows
  const tests = [
    { name: 'Cardiac Troponin-I (High Sensitivity)', val: '1.42 ng/mL', ref: '< 0.04 ng/mL', alert: true },
    { name: 'Glycated Hemoglobin (HbA1c)', val: '8.9 %', ref: '< 5.7 % (Normal)', alert: true },
    { name: 'Estimated Average Glucose (eAG)', val: '208 mg/dL', ref: '70 - 100 mg/dL', alert: true },
    { name: 'Total Serum Cholesterol', val: '248 mg/dL', ref: '< 200 mg/dL', alert: true },
    { name: 'LDL Cholesterol (Calculated)', val: '165 mg/dL', ref: '< 100 mg/dL', alert: true },
    { name: 'Serum Creatinine', val: '1.28 mg/dL', ref: '0.70 - 1.20 mg/dL', alert: false },
    { name: 'Blood Urea Nitrogen (BUN)', val: '22 mg/dL', ref: '7 - 20 mg/dL', alert: false }
  ];

  let y = 260;
  tests.forEach((t, i) => {
    if (i % 2 === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(50, y - 22, 800, 32);
    }
    ctx.fillStyle = t.alert ? '#b91c1c' : '#334155';
    ctx.font = t.alert ? 'bold 15px sans-serif' : '15px sans-serif';
    ctx.fillText(t.name, 65, y);
    ctx.fillText(t.val, 360, y);
    ctx.fillStyle = '#64748b';
    ctx.fillText(t.ref, 550, y);

    if (t.alert) {
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(t.name.includes('Troponin') ? 'CRITICAL HIGH' : 'HIGH', 740, y);
    } else {
      ctx.fillStyle = '#16a34a';
      ctx.font = '14px sans-serif';
      ctx.fillText('Normal', 750, y);
    }
    y += 40;
  });

  // Pathology note
  ctx.fillStyle = '#fee2e2';
  ctx.fillRect(50, 580, 800, 70);
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('PATHOLOGY CRITICAL ALERT NOTE:', 65, 605);
  ctx.font = '14px sans-serif';
  ctx.fillText('Significantly elevated high-sensitivity Troponin-I. Telephonic panic alert informed to ER team.', 65, 630);

  // Watermark
  ctx.save();
  ctx.translate(450, 750);
  ctx.rotate(-Math.PI / 6);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
  ctx.font = 'bold 46px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SYNTHETIC DEMO DATA — NOT REAL PHI', 0, 0);
  ctx.restore();

  return canvas;
}

export const DEMO_SCENARIOS = [
  {
    id: 'scenario_a',
    title: 'Scenario A: Elderly Patient (Blurry Rx + Hindi Note)',
    badge: 'Chronic Care & Polypharmacy',
    description: 'Elderly diabetic/hypertensive patient with blurry doctor prescription and caregiver Hindi voice transcript about ankle swelling & confusion.',
    category: 'ROUTINE / SOON_THIS_WEEK',
    patientName: 'Ramesh Patel (71 Y / Male)',
    targetOutputLanguage: 'English',
    textNote: `[Hindi Voice Recording Transcript from Caregiver Daughter]:
"पिताजी (रमेश पटेल, उम्र 71) पिछले 4 दिनों से कह रहे हैं कि उठते समय हल्का चक्कर आता है और शाम को दोनों पैरों के टखनों (ankles) में सूजन आ जाती है। 
उनकी शुगर और बीपी की पुरानी दवाइयां चल रही हैं, लेकिन पर्ची बहुत पुरानी और धुंधली है। समझ नहीं आ रहा कि Amlodipine 5mg और Telmisartan 40mg दोनों साथ लेनी हैं या एक? 
कल रात वह रात वाली गोली लेना भी भूल गए थे। उन्होंने 2 दिन पहले पेट दर्द के लिए बिना पूछे कोई दर्द की गोली (Combiflam) भी ले ली थी। कृपया बताएं कि अभी क्या करना चाहिए?"`,
    hasPrescriptionImage: true,
    generateImage: createSyntheticPrescriptionCanvas,
    imageFilename: 'synthetic_handwritten_prescription_patel.jpg'
  },
  {
    id: 'scenario_b',
    title: "Scenario B: Caregiver Note (Child's High Fever & Rash)",
    badge: 'Pediatric Caregiver Triage',
    description: 'Stressed mother describing 4-year-old child with persistent 103.2°F fever, weak cry, refusal of fluids, and spreading spots.',
    category: 'URGENT_24H',
    patientName: 'Ananya (4 Y / Female)',
    targetOutputLanguage: 'English',
    textNote: `Patient: Ananya (Age 4 years, weight 15kg).
Reported by Mother:
"My 4-year-old daughter Ananya has had a high fever for the past 3 days reaching 103.2°F (39.5°C). 
She is crying very weakly, irritable, and completely refusing water, milk, or ORS since this morning. 
She has not urinated for almost 9 hours. 
This morning we noticed tiny reddish-purple pinpoint spots and rash spreading across her chest, neck, and tummy. 
She vomited twice yesterday after food. We gave Calpol (Paracetamol) syrup 2.5ml about 4 hours ago, but the temperature barely came down to 102.4°F. 
No known drug allergies. What should we do right now? We are very worried."`,
    hasPrescriptionImage: false
  },
  {
    id: 'scenario_c',
    title: 'Scenario C: Red-Flag Cardiac Emergency (Mixed Lab + Chest Pain)',
    badge: 'CRITICAL EMERGENCY (Red Flag)',
    description: '58-year-old diabetic male with abnormal lab report plus sudden crushing chest pain, cold sweating & left arm radiation.',
    category: 'EMERGENCY',
    patientName: 'Ashok Deshmukh (58 Y / Male)',
    targetOutputLanguage: 'English',
    textNote: `[Emergency Call Transcript / Urgent Pasted Note]:
"Patient Ashok Deshmukh, 58 years old male. Long history of Type 2 Diabetes and high cholesterol. 
Attached recent lab report shows HbA1c 8.9% and elevated LDL. 
ACUTE COMPLAINT RIGHT NOW (Started 45 minutes ago):
Sudden onset of severe, crushing pressure and tight squeezing sensation in the center of the chest, feels like a heavy weight or elephant sitting on his chest. 
The pain is actively radiating into the left shoulder, left arm, and jaw. 
Patient is pale, visibly drenching in cold sweat (diaphoresis), nauseated, and complaining of shortness of breath. 
Wife gave him an antacid Gelusil syrup thinking it was gas/acidity, but the pain is intensifying and he feels faint. 
He has never had pain this severe before."`,
    hasPrescriptionImage: true,
    generateImage: createSyntheticLabReportCanvas,
    imageFilename: 'synthetic_emergency_lab_troponin_deshmukh.jpg'
  }
];
