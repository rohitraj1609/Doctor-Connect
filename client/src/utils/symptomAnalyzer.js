// Comprehensive symptom-to-specialization mapping — English + Hindi/Hinglish
const SYMPTOM_MAP = [
  {
    specialization: 'Cardiologist',
    keywords: [
      'chest pain', 'heart', 'palpitation', 'blood pressure', 'bp', 'heartbeat', 'cardiac', 'breathless', 'shortness of breath', 'cholesterol',
      'chest tightness', 'irregular heartbeat', 'swelling feet', 'fainting', 'blue lips', 'heart attack', 'heart failure', 'angina',
      'seene mein dard', 'chhati mein dard', 'dil', 'dhadkan', 'saans', 'sans phoolna', 'bp badh', 'raktchap',
      'seene mein jakdan', 'pair sujna', 'behoshi', 'dil ki dhadkan tez',
    ],
    conditions: ['Heart disease / Dil ki bimari', 'Hypertension / Ucch raktchap', 'Arrhythmia', 'Angina', 'Heart attack'],
    followUp: 'How long have you been experiencing this? Chest tightness or pain radiating to your arm?\n\nYeh kab se ho raha hai? Seene mein jakdan ya haath mein dard?',
  },
  {
    specialization: 'Dermatologist',
    keywords: [
      'skin', 'rash', 'acne', 'pimple', 'itching', 'eczema', 'allergy', 'hair loss', 'dandruff', 'fungal', 'ringworm', 'pigmentation', 'dark spots',
      'psoriasis', 'warts', 'burns', 'stretch marks', 'nail infection', 'vitiligo', 'boils', 'hives', 'scabies', 'sunburn', 'dry skin', 'oily skin',
      'chamdi', 'twacha', 'khujli', 'daad', 'kharish', 'muhase', 'baal girna', 'baal tutna', 'dane', 'lal dane', 'funsi',
      'safed daag', 'jhaiyan', 'nakhun', 'jalna', 'chheele', 'khurpi', 'fodi', 'allergy', 'suji hui chamdi',
    ],
    conditions: ['Dermatitis / Chamdi ki bimari', 'Eczema', 'Acne / Muhase', 'Psoriasis', 'Fungal infection / Daad', 'Vitiligo / Safed daag'],
    followUp: 'Where on your body? Itching, redness, or swelling?\n\nShareer mein kahan hai? Khujli, lali ya sujan?',
  },
  {
    specialization: 'Orthopedic',
    keywords: [
      'bone', 'joint', 'knee', 'back pain', 'fracture', 'sprain', 'shoulder', 'hip', 'spine', 'arthritis', 'muscle pain', 'leg pain', 'neck pain', 'slip disc',
      'sciatica', 'stiffness', 'cramps', 'swollen joints', 'frozen shoulder', 'tennis elbow', 'ligament', 'cartilage', 'scoliosis', 'osteoporosis',
      'haddi', 'jod', 'ghutna', 'kamar dard', 'peeth dard', 'kandha', 'toot gaya', 'haddi toot', 'moch', 'gathiya', 'pair dard', 'gardan dard', 'uthna baithna',
      'hath pair tutna', 'chalne mein dikkat', 'kamar uthna nahi', 'tang akad gayi', 'jodo mein sujan', 'haddi mein dard', 'akdan', 'marore',
    ],
    conditions: ['Arthritis / Gathiya', 'Fracture / Haddi tootna', 'Sprain / Moch', 'Slip disc', 'Sciatica', 'Frozen shoulder'],
    followUp: 'Which joint or area? Any recent injury?\n\nKaunsa jod ya jagah? Koi chot lagi hai?',
  },
  {
    specialization: 'Neurologist',
    keywords: [
      'headache', 'head pain', 'head is paining', 'head ache', 'migraine', 'seizure', 'dizziness', 'numbness', 'tingling', 'memory', 'brain', 'nerve', 'paralysis', 'stroke', 'tremor', 'epilepsy',
      'confusion', 'blurred vision', 'weakness one side', 'speech difficulty', 'vertigo', 'fainting spells', 'brain fog',
      'sir dard', 'sar dard', 'sir mein', 'sar mein', 'sar bhaari', 'chakkar', 'sunn', 'sunnpan', 'dimag', 'yaaddash', 'lakwa', 'mirgi', 'kampan', 'behoshi',
      'hath pair sunn', 'aankho ke aage andhera', 'bolne mein dikkat', 'bhoolna', 'ek taraf kamzori',
    ],
    conditions: ['Migraine / Sir dard', 'Epilepsy / Mirgi', 'Stroke / Lakwa', 'Vertigo / Chakkar', 'Neuropathy'],
    followUp: 'How frequent? Vision changes or weakness on one side?\n\nKitni baar hota hai? Nazar mein badlav ya ek taraf kamzori?',
  },
  {
    specialization: 'Pediatrician',
    keywords: [
      'child', 'baby', 'infant', 'kid', 'toddler', 'vaccination', 'growth', 'fever child', 'child cough', 'newborn',
      'child rash', 'child diarrhea', 'not eating child', 'crying baby', 'slow weight gain', 'child vomiting', 'teething',
      'bachcha', 'bacche', 'bache', 'shishu', 'teeka', 'tika', 'bachche ko bukhar', 'bachche ko khansi',
      'bachcha khana nahi khata', 'bachcha ro raha', 'bachche ko dast', 'bachche ko ulti', 'bachche ka vajan', 'daant nikalna',
    ],
    conditions: ['Common cold / Sardi', 'Growth issues', 'Vaccination / Teekakaran', 'Childhood infections', 'Teething / Daant aana'],
    followUp: 'How old is the child? What symptoms?\n\nBachche ki umar? Kya taklif hai?',
  },
  {
    specialization: 'Psychiatrist',
    keywords: [
      'anxiety', 'depression', 'stress', 'sleep', 'insomnia', 'panic', 'mental', 'mood', 'sad', 'suicidal', 'ocd', 'phobia', 'anger', 'emotional',
      'hallucination', 'addiction', 'bipolar', 'trauma', 'self harm', 'loneliness', 'panic attack', 'overthinking',
      'chinta', 'tanav', 'tension', 'neend nahi', 'neend na aana', 'ghabrahat', 'udaas', 'gussa', 'dar lagna', 'darr', 'pareshani', 'dimagi', 'pagal',
      'mann nahi lagta', 'rona aata hai', 'akela feel', 'zyada sochna', 'nasha', 'nashe ki lat', 'ajeeb lagta hai',
    ],
    conditions: ['Anxiety / Chinta rog', 'Depression / Avsaad', 'Insomnia / Anidra', 'Panic disorder', 'OCD', 'Addiction / Lat'],
    followUp: 'How long have you been feeling this way? Affecting daily life?\n\nKab se aisa feel ho raha hai? Roz ke kaam mein dikkat?',
  },
  {
    specialization: 'ENT Specialist',
    keywords: [
      'ear', 'nose', 'throat', 'sinus', 'hearing', 'tonsil', 'snoring', 'voice', 'sore throat', 'nasal', 'congestion',
      'ear discharge', 'ear ringing', 'tinnitus', 'nosebleed', 'loss of smell', 'swollen throat', 'adenoids', 'polyps',
      'kaan', 'naak', 'gala', 'gale mein dard', 'kaan dard', 'naak band', 'sunai', 'khurrate', 'awaaz', 'tonsil',
      'kaan se pani', 'kaan mein awaaz', 'naak se khoon', 'soonghne mein dikkat', 'gala baith gaya', 'gala sujna',
    ],
    conditions: ['Sinusitis / Sinus', 'Tonsillitis / Tonsil', 'Hearing loss / Sunai kam', 'Tinnitus / Kaan mein awaaz', 'Nasal polyps'],
    followUp: 'Ear, nose, or throat? Any discharge or difficulty swallowing?\n\nKaan, naak ya gale ki taklif? Rishav ya nigalne mein dikkat?',
  },
  {
    specialization: 'Ophthalmologist',
    keywords: [
      'eye', 'vision', 'blurry', 'glasses', 'cataract', 'glaucoma', 'red eye', 'eye pain', 'watery eyes',
      'dry eyes', 'floaters', 'itchy eyes', 'night blindness', 'swollen eyelid', 'eye infection', 'squinting',
      'aankh', 'aankh mein dard', 'aankh dard', 'nazar', 'nazar kamzor', 'dhundla', 'chasma', 'motiyabind', 'aankh lal', 'aankh se pani',
      'aankh sukhna', 'aankh mein kuch', 'aankh suji', 'raat mein dikhna', 'aankh mein infection',
    ],
    conditions: ['Refractive error / Nazar kamzor', 'Cataract / Motiyabind', 'Glaucoma', 'Conjunctivitis', 'Dry eye'],
    followUp: 'Blurry vision, pain, or redness? Which eye?\n\nDhundla dikhna, dard, ya lali? Kaunsi aankh?',
  },
  {
    specialization: 'Dentist',
    keywords: [
      'tooth', 'teeth', 'dental', 'gum', 'cavity', 'toothache', 'tooth aching', 'tooth pain', 'braces', 'wisdom tooth', 'bleeding gums', 'mouth ulcer',
      'jaw pain', 'bad breath', 'loose tooth', 'sensitivity', 'broken tooth', 'root canal', 'crown', 'plaque',
      'daant', 'dant', 'masude', 'daant dard', 'masude se khoon', 'munh', 'munh ka chala', 'munh se badbu',
      'jabde mein dard', 'daant hilna', 'daant tootna', 'thanda garam lagna', 'daant mein keeda',
    ],
    conditions: ['Cavity / Daant mein keeda', 'Gum disease / Masude ki bimari', 'Tooth infection', 'Jaw pain / Jabde mein dard', 'Bad breath / Munh se badbu'],
    followUp: 'Which tooth? Swelling or bleeding?\n\nKaunsa daant? Sujan ya khoon?',
  },
  {
    specialization: 'Gastroenterologist',
    keywords: [
      'stomach', 'digestion', 'acidity', 'gastric', 'liver', 'vomiting', 'nausea', 'diarrhea', 'constipation', 'bloating', 'abdomen', 'ulcer', 'jaundice',
      'heartburn', 'food poisoning', 'loss of appetite', 'bloody stool', 'piles', 'hemorrhoids', 'crohn', 'ibs', 'gallbladder', 'hernia',
      'pet', 'pet dard', 'paet', 'pait', 'pachan', 'khatti dakar', 'gas', 'ulti', 'ji machlana', 'dast', 'kabz', 'pet phulna', 'piliya', 'liver',
      'pet kharab', 'pet mein jalan', 'khana hazam nahi', 'loose motion', 'pet mein gas', 'bhook nahi', 'khoon ki dast', 'bawaseer', 'pet mein marore',
    ],
    conditions: ['Gastritis / Pet mein jalan', 'GERD / Acidity', 'IBS', 'Liver disease', 'Piles / Bawaseer', 'Food poisoning'],
    followUp: 'Where exactly is the pain? Nausea, vomiting, or bowel changes?\n\nDard kahan hai? Ulti, ji machlana, ya latrine mein badlav?',
  },
  {
    specialization: 'Pulmonologist',
    keywords: [
      'cough', 'breathing', 'lung', 'asthma', 'wheeze', 'bronchitis', 'pneumonia', 'tb', 'tuberculosis', 'chest congestion', 'phlegm',
      'chest tightness breathing', 'night sweats', 'chronic cough', 'oxygen low', 'sneezing', 'copd', 'lung infection',
      'khansi', 'saans phoolna', 'phephda', 'dama', 'saans lene mein dikkat', 'balgam', 'khoon ki khansi', 'tuberculosis',
      'chhati bhari lagna', 'raat ko pasina', 'purani khansi', 'saans fulna', 'chheenk', 'khansi mein khoon',
    ],
    conditions: ['Asthma / Dama', 'Bronchitis', 'Pneumonia / Nimonia', 'TB / Tuberculosis', 'COPD', 'Lung infection'],
    followUp: 'How long the cough? Blood in sputum or breathing difficulty?\n\nKhansi kab se? Balgam mein khoon ya saans mein dikkat?',
  },
  {
    specialization: 'Urologist',
    keywords: [
      'urine', 'urination', 'kidney stone', 'kidney', 'bladder', 'prostate', 'uti', 'urinary', 'burning urine', 'blood in urine', 'frequent urination', 'urine infection',
      'bed wetting', 'incontinence', 'erectile', 'infertility male',
      'peshab', 'peshab mein jalan', 'pathri', 'gurda', 'kidney', 'peshab ruk ruk ke', 'peshab mein khoon', 'baar baar peshab',
      'peshab kam aana', 'peshab rok nahi paana', 'raat ko peshab', 'prostate',
    ],
    conditions: ['Kidney stone / Pathri', 'UTI / Peshab mein infection', 'Prostate issues', 'Bladder infection', 'Kidney disease / Gurde ki bimari'],
    followUp: 'Burning during urination? Blood in urine? Frequency?\n\nPeshab mein jalan? Khoon? Kitni baar jaate hain?',
  },
  {
    specialization: 'Gynecologist',
    keywords: [
      'periods', 'pregnancy', 'pcod', 'pcos', 'menstrual', 'menstruation', 'irregular periods', 'heavy bleeding', 'white discharge', 'vaginal',
      'ovary', 'uterus', 'breast lump', 'infertility', 'miscarriage', 'cramps periods', 'prenatal', 'postpartum', 'contraception',
      'mahawari', 'mc', 'periods irregular', 'pet ke neeche dard', 'safed paani', 'garbh', 'pregnancy test', 'bacha hona',
      'mahawari mein dard', 'mahawari band', 'zyada bleeding', 'breast mein gaanth', 'baanjhpan',
    ],
    conditions: ['PCOD/PCOS', 'Irregular periods / Asamanya mahawari', 'UTI', 'Pregnancy care', 'Breast lump', 'Infertility / Baanjhpan'],
    followUp: 'Is it related to periods, pregnancy, or discharge?\n\nKya yeh mahawari, pregnancy, ya discharge se related hai?',
  },
  {
    specialization: 'Oncologist',
    keywords: [
      'cancer', 'tumor', 'lump', 'abnormal growth', 'chemotherapy', 'biopsy', 'malignant', 'benign', 'blood cancer', 'leukemia',
      'unexplained weight loss', 'persistent fatigue', 'lymph nodes swollen',
      'cancer', 'gaanth', 'rasauli', 'gilti', 'khoon ka cancer', 'wajan ghatna', 'bina wajah kamzori', 'gilti badi ho rahi',
    ],
    conditions: ['Cancer / Cancer', 'Tumor / Rasauli', 'Lymphoma', 'Leukemia / Khoon ka cancer'],
    followUp: 'Where is the lump? Any unexplained weight loss or fatigue?\n\nGaanth kahan hai? Bina wajah vajan ghatna ya thakan?',
  },
  {
    specialization: 'Endocrinologist',
    keywords: [
      'hormone', 'thyroid', 'diabetes type', 'insulin', 'sugar level', 'sugar high', 'sugar low', 'metabolism', 'adrenal', 'pituitary',
      'excessive thirst', 'excessive hunger', 'weight gain unexplained', 'growth hormone',
      'harmone', 'thyroid badha', 'thyroid kam', 'sugar control', 'sugar ki bimari', 'motapa', 'bahut pyaas', 'bahut bhook',
      'vajan badhna', 'harmone imbalance', 'insulin', 'pcos hormonal',
    ],
    conditions: ['Diabetes / Sugar ki bimari', 'Thyroid disorder', 'Hormonal imbalance / Harmone ki gadbadi', 'PCOS hormonal', 'Obesity / Motapa'],
    followUp: 'Any sugar/thyroid history? Weight changes, thirst, or fatigue?\n\nSugar/thyroid ka itihas? Vajan, pyaas, ya thakan mein badlav?',
  },
  {
    specialization: 'Nephrologist',
    keywords: [
      'kidney failure', 'dialysis', 'kidney disease', 'swelling body', 'creatinine', 'kidney function', 'nephrotic',
      'protein in urine', 'kidney transplant', 'chronic kidney',
      'gurde fail', 'dialysis', 'poora shareer sujna', 'gurde ki bimari', 'creatinine badha', 'peshab mein protein',
      'gurde kaam nahi', 'kidney kharab',
    ],
    conditions: ['Chronic kidney disease / Gurde ki bimari', 'Kidney failure / Gurde fail', 'Nephrotic syndrome', 'Dialysis needed'],
    followUp: 'Any swelling in body? Previous kidney tests?\n\nShareer mein sujan? Pehle kidney ki jaanch hui hai?',
  },
  {
    specialization: 'General Physician',
    keywords: [
      'fever', 'cold', 'flu', 'weakness', 'fatigue', 'body pain', 'weight', 'diabetes', 'thyroid', 'infection', 'general', 'check up', 'not feeling well', 'unwell', 'sick', 'tired',
      'chills', 'sweating', 'dehydration', 'swollen glands', 'loss of appetite', 'malaria', 'dengue', 'typhoid', 'viral', 'bacterial',
      'bukhar', 'sardi', 'zukaam', 'kamzori', 'thakan', 'badan dard', 'shareer dard', 'vajan', 'sugar', 'madhumeh', 'tabiyat kharab', 'bimar', 'thand lagna',
      'tabiyat theek nahi', 'tabiyat bigad gayi', 'acha nahi lag raha', 'bimaar pad gaya', 'bukhar utarta nahi', 'jukaam ho gaya', 'thand lag gayi',
      'pasina', 'pani ki kami', 'bhook nahi lag rahi', 'malaria', 'dengue', 'typhoid',
    ],
    conditions: ['Viral fever / Bukhar', 'Common cold / Sardi-Zukaam', 'Diabetes / Sugar', 'Dengue', 'Typhoid', 'Malaria', 'General weakness / Kamzori'],
    followUp: 'How long unwell? Fever, body aches, or other symptoms?\n\nKab se tabiyat kharab? Bukhar, badan dard, ya koi aur taklif?',
  },
];

// Location/severity keywords for follow-up understanding
const LOCATION_MAP = {
  'right side': 'right side / daayein taraf',
  'left side': 'left side / baayein taraf',
  'daayein': 'right side / daayein taraf',
  'baayein': 'left side / baayein taraf',
  'right': 'right side',
  'left': 'left side',
  'upper': 'upper area',
  'lower': 'lower area',
  'center': 'center',
  'upar': 'upper area',
  'neeche': 'lower area',
  'beech': 'center',
  'front': 'front side',
  'back': 'back side',
  'aage': 'front side',
  'peeche': 'back side',
};

const DURATION_MAP = {
  'today': 'since today',
  'yesterday': 'since yesterday',
  'kal': 'since yesterday / kal se',
  'aaj': 'since today / aaj se',
  'week': 'about a week',
  'hafte': 'about a week / ek hafte se',
  'month': 'about a month',
  'mahine': 'about a month / ek mahine se',
  'long time': 'a long time',
  'bahut din': 'a long time / bahut din se',
  '2 din': '2 days',
  '3 din': '3 days',
  'parso': 'day before yesterday',
  'subah se': 'since morning',
  'raat se': 'since last night',
};

const SEVERITY_MAP = {
  'severe': 'severe',
  'mild': 'mild',
  'tez': 'severe / tez',
  'halka': 'mild / halka',
  'bahut': 'very much',
  'thoda': 'a little',
  'very': 'very much',
  'unbearable': 'unbearable',
  'bardasht nahi': 'unbearable',
  'extreme': 'extreme',
  'moderate': 'moderate',
  'intermittent': 'on and off',
  'aata jaata': 'on and off',
  'lagatar': 'continuous',
  'continuous': 'continuous',
};

function extractDetails(text) {
  const lower = text.toLowerCase();
  const details = {};
  for (const [kw, label] of Object.entries(LOCATION_MAP)) {
    if (lower.includes(kw)) { details.location = label; break; }
  }
  for (const [kw, label] of Object.entries(DURATION_MAP)) {
    if (lower.includes(kw)) { details.duration = label; break; }
  }
  for (const [kw, label] of Object.entries(SEVERITY_MAP)) {
    if (lower.includes(kw)) { details.severity = label; break; }
  }
  return details;
}

export function analyzeSymptoms(text, previousDiagnosis = null) {
  const lower = text.toLowerCase();
  const matches = [];

  for (const entry of SYMPTOM_MAP) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(' ').length;
      }
    }
    if (score > 0) {
      matches.push({ ...entry, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  const bestScore = matches.length > 0 ? matches[0].score : 0;
  const isWeakMatch = bestScore <= 1 && previousDiagnosis;

  if ((matches.length === 0 || isWeakMatch) && previousDiagnosis) {
    const details = extractDetails(text);
    if (Object.keys(details).length > 0) {
      let message = `Thank you for the details. `;
      if (details.location) message += `Pain location: **${details.location}**. `;
      if (details.duration) message += `Duration: **${details.duration}**. `;
      if (details.severity) message += `Severity: **${details.severity}**. `;
      message += `\n\nBased on your ${previousDiagnosis.specialization.toLowerCase()} symptoms`;
      if (details.location) message += ` on the **${details.location}**`;
      message += `, I still recommend consulting a **${previousDiagnosis.specialization}** as soon as possible.`;
      message += `\n\nWould you like to see available doctors? / Kya aap doctor dekhna chahenge?`;
      return {
        found: true, message, isFollowUp: true,
        primarySpecialization: previousDiagnosis.specialization,
        conditions: previousDiagnosis.conditions,
        suggestions: [{ specialization: previousDiagnosis.specialization, conditions: previousDiagnosis.conditions, score: 10 }],
      };
    }
    return {
      found: false, previousDiagnosis, suggestions: [],
      message: `I understand you're still describing your **${previousDiagnosis.conditions[0]}** symptoms. Could you tell me:\n\n- **Where** exactly? (right side, left side, upper, lower)\n- **How long?** (today, yesterday, week)\n- **How severe?** (mild, severe)\n\nDard kahan hai? Kab se hai? Kitna tez hai?`,
    };
  }

  if (matches.length === 0) {
    return {
      found: false, suggestions: [],
      message: "I couldn't identify a specific condition. Could you describe in more detail?\n\nAapki taklif samajh nahi aayi. Kripya detail mein batayein - kahan dard hai, kab se hai, aur kya karne se badhta hai?",
    };
  }

  const top = matches[0];
  const others = matches.slice(1, 3);
  let message = `Based on your symptoms, this could be related to **${top.conditions[0]}**.\n\n`;
  message += `I recommend consulting a **${top.specialization}**.\n\n`;
  message += `${top.followUp}`;
  if (others.length > 0) {
    message += `\n\nYou may also consider: ${others.map(o => `**${o.specialization}**`).join(', ')}.`;
  }

  return {
    found: true, message,
    primarySpecialization: top.specialization,
    conditions: top.conditions,
    suggestions: matches.map(m => ({ specialization: m.specialization, conditions: m.conditions, score: m.score })),
  };
}

export function getGreeting() {
  return "Hello! I'm your health assistant. Tell me what's bothering you and I'll help you find the right doctor.\n\nNamaste! Main aapka health assistant hoon. Apni taklif batayein, main sahi doctor dhundne mein madad karunga.\n\nExamples:\n- *\"I have a headache and dizziness\"*\n- *\"Mera pet dard kar raha hai\"*\n- *\"Peshab mein jalan ho rahi hai\"*\n- *\"Bachche ko bukhar hai\"*";
}
