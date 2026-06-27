// ============ DATA: Questions & Results ============

const questions = [
    {
        id: 'origin',
        title: 'Where are you coming from?',
        desc: 'This determines your visa requirements and registration process.',
        options: [
            { id: 'eu', icon: '🇪🇺', label: 'EU / EEA / Switzerland', sub: 'Free movement rights apply' },
            { id: 'non_eu_visa_free', icon: '🌍', label: 'Non-EU (visa-free country)', sub: 'USA, Canada, Australia, Japan, South Korea, UK, etc.' },
            { id: 'non_eu_visa', icon: '🛂', label: 'Non-EU (visa required)', sub: 'Most other countries' },
            { id: 'refugee', icon: '🕊️', label: 'Refugee / Asylum seeker', sub: 'Seeking international protection' }
        ]
    },
    {
        id: 'purpose',
        title: 'What is the purpose of your stay?',
        desc: 'Different purposes require different permits and documents.',
        options: [
            { id: 'work', icon: '💼', label: 'Employment', sub: 'You have a job offer or contract' },
            { id: 'job_search', icon: '🔍', label: 'Job seeking', sub: 'Looking for work (Chancenkarte / Job Seeker Visa)' },
            { id: 'study', icon: '🎓', label: 'Study / Research', sub: 'University, language course, or research position' },
            { id: 'family', icon: '👨‍👩‍👧', label: 'Family reunification', sub: 'Joining a spouse, parent, or child in Germany' },
            { id: 'self_employed', icon: '🏢', label: 'Self-employment / Freelance', sub: 'Starting or running your own business' }
        ]
    },
    {
        id: 'qualification',
        title: 'What is your qualification level?',
        desc: 'This affects which residence permit type you qualify for.',
        options: [
            { id: 'university', icon: '🎓', label: 'University degree (recognized)', sub: 'Bachelor\'s, Master\'s, or PhD from a recognized institution' },
            { id: 'vocational', icon: '🔧', label: 'Vocational training', sub: 'Recognized professional qualification (Ausbildung equivalent)' },
            { id: 'experience', icon: '⭐', label: 'Professional experience (no formal degree)', sub: '3+ years of relevant work experience' },
            { id: 'none', icon: '📋', label: 'No recognized qualification yet', sub: 'May need credential recognition process' }
        ]
    },
    {
        id: 'housing',
        title: 'Do you already have housing in Germany?',
        desc: 'Registration (Anmeldung) requires a confirmed address.',
        options: [
            { id: 'yes', icon: '🏠', label: 'Yes, I have a rental contract', sub: 'Or a confirmed place to stay with landlord confirmation' },
            { id: 'temporary', icon: '🏨', label: 'Temporary accommodation only', sub: 'Hotel, Airbnb, staying with friends' },
            { id: 'no', icon: '❌', label: 'Not yet', sub: 'Still searching for housing' }
        ]
    },
    {
        id: 'insurance',
        title: 'Do you have health insurance for Germany?',
        desc: 'Health insurance is mandatory in Germany for all residents.',
        options: [
            { id: 'public', icon: '🏥', label: 'Yes — public (gesetzlich)', sub: 'TK, AOK, Barmer, DAK, etc.' },
            { id: 'private', icon: '🩺', label: 'Yes — private', sub: 'Private health insurance (PKV)' },
            { id: 'travel', icon: '✈️', label: 'Only travel insurance', sub: 'Temporary coverage, not sufficient long-term' },
            { id: 'none', icon: '❌', label: 'No insurance yet', sub: 'Need to arrange this' }
        ]
    }
];

// ============ RESULT GENERATION ============

function generateResults(answers) {
    const steps = [];
    const { origin, purpose, qualification, housing, insurance } = answers;

    // --- STEP 1: Visa (before arrival) ---
    if (origin === 'eu') {
        steps.push({
            number: 'Before Arrival',
            title: 'No visa needed — Freedom of Movement',
            timing: 'No deadline',
            description: 'As an EU/EEA/Swiss citizen, you have the right to live and work in Germany without a visa or residence permit.',
            documents: ['Valid passport or national ID card'],
            tip: 'You still need to complete the Anmeldung (address registration) after arrival.'
        });
    } else if (origin === 'non_eu_visa_free') {
        steps.push({
            number: 'Before Arrival',
            title: 'Enter Germany visa-free, apply for residence permit after arrival',
            timing: 'Apply for residence permit within 90 days of arrival',
            description: 'Citizens of visa-free countries can enter Germany and apply for the appropriate residence permit at the local immigration office (Ausländerbehörde).',
            documents: [
                'Valid passport (6+ months validity)',
                'Proof of purpose (job contract, university admission, etc.)',
                'Proof of financial means',
                'Health insurance confirmation'
            ],
            tip: 'Book your Ausländerbehörde appointment as early as possible — wait times can be several weeks.'
        });
    } else if (origin === 'non_eu_visa') {
        let visaType = 'National Visa (D-Visa)';
        let docs = [
            'Valid passport (6+ months validity, 2 blank pages)',
            'Completed visa application form (Videx)',
            '2 biometric passport photos',
            'Proof of health insurance',
            'Proof of financial means / blocked account (Sperrkonto)'
        ];

        if (purpose === 'work' && qualification === 'university') {
            visaType = 'EU Blue Card Visa or Work Visa (§18a/18b AufenthG)';
            docs.push('Employment contract with minimum salary of €50,700/year (or €45,934 for shortage occupations)');
            docs.push('Recognized university degree (check anabin database)');
        } else if (purpose === 'work') {
            visaType = 'Work Visa (§18a/18b AufenthG)';
            docs.push('Employment contract');
            docs.push('Proof of qualification recognition');
        } else if (purpose === 'job_search') {
            visaType = 'Opportunity Card (Chancenkarte / §20a AufenthG)';
            docs.push('Proof of qualification (degree or vocational training)');
            docs.push('Proof of German or English language skills (B1/B2)');
            docs.push('Proof of financial means for job search period');
        } else if (purpose === 'study') {
            visaType = 'Student Visa (§16b AufenthG)';
            docs.push('University admission letter (Zulassungsbescheid)');
            docs.push('Blocked account with €11,904/year (2026 requirement)');
            docs.push('Proof of academic qualifications');
        } else if (purpose === 'family') {
            visaType = 'Family Reunification Visa (§27-36 AufenthG)';
            docs.push('Marriage certificate / birth certificate (apostilled)');
            docs.push('Proof of German language skills (A1 for spouse visa)');
            docs.push('Proof that family member in Germany can support you');
            docs.push('Family member\'s residence permit and Meldebescheinigung copy');
        } else if (purpose === 'self_employed') {
            visaType = 'Self-Employment Visa (§21 AufenthG)';
            docs.push('Business plan');
            docs.push('Proof of investment capital');
            docs.push('Professional qualifications / experience');
            docs.push('Letters of intent from potential clients (if possible)');
        }

        steps.push({
            number: 'Before Arrival',
            title: `Apply for: ${visaType}`,
            timing: 'Apply at German embassy/consulate 3-6 months before planned move',
            description: 'You need a national visa (D-Visa) before entering Germany. Apply at the German embassy or consulate in your home country.',
            documents: docs,
            warning: 'Processing times vary: 4-12 weeks typically, but can be longer. Apply early!'
        });
    } else if (origin === 'refugee') {
        steps.push({
            number: 'Upon Arrival',
            title: 'Register and apply for asylum',
            timing: 'Immediately upon arrival',
            description: 'You must register with authorities and formally apply for asylum at the Federal Office for Migration and Refugees (BAMF).',
            documents: [
                'Passport or any identity document (if available)',
                'Any evidence supporting your asylum claim',
                'Medical records (if relevant to your claim)'
            ],
            tip: 'You will receive a temporary residence permit (Aufenthaltsgestattung) while your claim is processed. You\'ll be assigned to initial reception center (Erstaufnahmeeinrichtung).'
        });
    }

    // --- STEP 2: Anmeldung ---
    if (origin !== 'refugee') {
        let anmeldungDocs = [
            'Valid passport or ID',
            'Completed registration form (Anmeldeformular / Meldeschein)',
            'Landlord confirmation (Wohnungsgeberbestätigung) — your landlord must sign this'
        ];

        let anmeldungTip = 'The Anmeldeformular is available in German. Many Bürgeramt offices don\'t speak English — consider bringing a German-speaking friend.';

        if (housing === 'no' || housing === 'temporary') {
            anmeldungTip = '⚠️ You need a permanent address to register. Some cities accept registration at a friend\'s address with their landlord\'s permission. Hotels generally cannot be used for Anmeldung.';
        }

        steps.push({
            number: 'Week 1-2',
            title: 'Address Registration (Anmeldung)',
            timing: 'Within 14 days of moving into your apartment',
            description: 'This is the most important first step. Without the registration certificate (Meldebescheinigung), you cannot open a bank account, get a tax ID, or do almost anything official.',
            documents: anmeldungDocs,
            tip: anmeldungTip,
            warning: housing === 'no' ? 'You must find housing first before you can complete this step. This is your top priority!' : undefined
        });
    }

    // --- STEP 3: Bank Account ---
    steps.push({
        number: 'Week 2-3',
        title: 'Open a German Bank Account',
        timing: 'After Anmeldung (some banks allow before)',
        description: 'You need a German bank account (IBAN) to receive salary, pay rent, and set up contracts.',
        documents: [
            'Passport or ID',
            'Meldebescheinigung (registration certificate)',
            'Visa or residence permit (for non-EU citizens)'
        ],
        tip: 'Online banks like N26 or Vivid can be opened without Anmeldung. Traditional banks (Sparkasse, Deutsche Bank, Commerzbank) usually require it.'
    });

    // --- STEP 4: Health Insurance ---
    if (insurance === 'none' || insurance === 'travel') {
        steps.push({
            number: 'Week 1-3',
            title: 'Get Health Insurance (Krankenversicherung)',
            timing: 'Required from day 1 — arrange before or immediately after arrival',
            description: 'Health insurance is mandatory in Germany. If you\'re employed, your employer handles enrollment in public insurance. If self-employed or a student, you must arrange it yourself.',
            documents: [
                'Passport',
                'Meldebescheinigung (once available)',
                'Employment contract (for public insurance via employer)',
                'University enrollment certificate (for student tariff)'
            ],
            warning: origin !== 'eu' ? 'Your residence permit application requires proof of health insurance. Don\'t delay this step!' : undefined,
            tip: 'Public insurance (GKV) costs ~14.6% + supplement of your gross salary, split with employer. Major providers: TK, AOK, Barmer, DAK.'
        });
    }

    // --- STEP 5: Tax ID ---
    steps.push({
        number: 'Week 2-6',
        title: 'Receive your Tax ID (Steuer-ID)',
        timing: 'Arrives automatically by mail 2-4 weeks after Anmeldung',
        description: 'Your 11-digit tax identification number (Steuerliche Identifikationsnummer) is sent automatically after registration. Your employer needs this to pay you correctly.',
        documents: [
            'No action needed — arrives by post after Anmeldung',
            'If urgent: contact Finanzamt with your Meldebescheinigung'
        ],
        tip: 'If you need to start work before receiving it, your employer can pay you temporarily at a higher tax rate (Steuerklasse 6). The difference is refunded.'
    });

    // --- STEP 6: Residence Permit (non-EU only) ---
    if (origin === 'non_eu_visa_free' || origin === 'non_eu_visa') {
        let permitDocs = [
            'Valid passport with visa',
            'Biometric passport photo',
            'Meldebescheinigung',
            'Proof of health insurance',
            'Proof of financial means or employment contract',
            'Residence permit application form'
        ];

        if (purpose === 'work' && qualification === 'university') {
            permitDocs.push('Employment contract (meeting salary threshold)');
            permitDocs.push('University degree (with recognition if needed)');
        } else if (purpose === 'study') {
            permitDocs.push('University enrollment certificate');
            permitDocs.push('Proof of sufficient funds (blocked account)');
        } else if (purpose === 'family') {
            permitDocs.push('Marriage/birth certificate (certified German translation)');
            permitDocs.push('Language certificate (A1 for spouse reunion)');
        }

        steps.push({
            number: 'Month 1-3',
            title: 'Apply for Residence Permit (Aufenthaltstitel)',
            timing: 'Before your visa expires (within 90 days for visa-free arrivals)',
            description: 'Visit your local Ausländerbehörde (foreigners\' registration office) to convert your visa into a residence permit. Book the appointment as early as possible.',
            documents: permitDocs,
            warning: 'Ausländerbehörde appointments can have very long wait times (weeks to months). Book online immediately after arrival. If your visa expires while waiting, you\'re usually covered by a "Fiktionsbescheinigung" (fictional certificate).'
        });
    }

    // --- STEP 7: Social Security ---
    if (purpose === 'work' || purpose === 'self_employed') {
        steps.push({
            number: 'With Employment',
            title: 'Social Security Registration',
            timing: 'Automatic when employment starts (employer handles it)',
            description: 'Germany has 5 pillars of social insurance: health, pension, unemployment, long-term care, and accident insurance. Your employer registers you automatically.',
            documents: [
                'Social security number (Sozialversicherungsnummer) — you receive this from Deutsche Rentenversicherung',
                'Health insurance membership confirmation',
                'Tax ID'
            ],
            tip: 'If this is your first job in Germany, you\'ll receive your social security number within a few weeks. Your employer handles most of the paperwork.'
        });
    }

    // --- STEP 8: Additional registrations ---
    steps.push({
        number: 'Ongoing',
        title: 'Additional Registrations & Setup',
        timing: 'First 1-3 months',
        description: 'Other important tasks to complete as you settle in:',
        documents: [
            'Register for Rundfunkbeitrag (TV/radio fee — €18.36/month per household)',
            'Get a German phone number (needed for many services)',
            'Register at Finanzamt for tax class assignment (Steuerklasse)',
            'Apply for child benefits (Kindergeld) if you have children',
            'Convert your driving license (within 6 months for non-EU, check bilateral agreements)'
        ],
        tip: 'The GEZ/Rundfunkbeitrag will find you automatically after Anmeldung — they send a letter. You must pay even if you don\'t own a TV.'
    });

    return steps;
}

// ============ APP STATE ============

let currentStep = 0;
let answers = {};
let history = [];

// ============ RENDERING ============

function renderProgressSteps() {
    const wrapper = document.getElementById('progress-steps');
    wrapper.innerHTML = '';
    questions.forEach((q, i) => {
        const step = document.createElement('div');
        step.className = 'progress-step';
        if (i < currentStep) step.classList.add('completed');
        if (i === currentStep) step.classList.add('active');
        wrapper.appendChild(step);
    });
}

function renderQuestion() {
    const question = questions[currentStep];
    if (!question) return;

    const wizard = document.getElementById('wizard');
    wizard.classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');

    let html = `<h2>${question.title}</h2>`;
    html += `<p class="question-desc">${question.desc}</p>`;
    html += `<div class="options">`;

    question.options.forEach(opt => {
        html += `
            <button class="option-btn" data-answer="${opt.id}" onclick="selectAnswer('${question.id}', '${opt.id}')">
                <span class="option-icon">${opt.icon}</span>
                <span class="option-text">
                    <strong>${opt.label}</strong>
                    <small>${opt.sub}</small>
                </span>
            </button>`;
    });

    html += `</div>`;

    if (currentStep > 0) {
        html += `<div class="nav-buttons"><button class="btn btn-back" onclick="goBack()">← Back</button><div></div></div>`;
    }

    wizard.innerHTML = html;
    renderProgressSteps();
}

function renderResults() {
    document.getElementById('wizard').classList.add('hidden');
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');

    const steps = generateResults(answers);

    let html = `
        <div class="results-header">
            <h2>📋 Your Personalized Document Checklist</h2>
            <p>Based on your situation, here are the steps you need to follow:</p>
        </div>
        <div class="timeline">`;

    steps.forEach(step => {
        html += `
            <div class="step-card">
                <span class="step-number">${step.number}</span>
                <h3>${step.title}</h3>
                <div class="step-timing">⏰ ${step.timing}</div>
                <p>${step.description}</p>
                <ul>
                    ${step.documents.map(d => `<li>${d}</li>`).join('')}
                </ul>
                ${step.tip ? `<div class="tip">💡 ${step.tip}</div>` : ''}
                ${step.warning ? `<div class="warning">⚠️ ${step.warning}</div>` : ''}
            </div>`;
    });

    html += `</div>`;
    html += `<div style="text-align: center; margin-top: 32px;">
        <button class="btn btn-restart" onclick="restart()">↺ Start Over</button>
    </div>`;

    resultsDiv.innerHTML = html;
    document.getElementById('progress-wrapper').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ ACTIONS ============

function selectAnswer(questionId, answerId) {
    answers[questionId] = answerId;
    history.push(currentStep);
    currentStep++;

    // Skip qualification question for EU citizens (not needed) or refugees
    if (questions[currentStep]?.id === 'qualification' && (answers.origin === 'eu' || answers.origin === 'refugee')) {
        answers.qualification = 'none';
        history.push(currentStep);
        currentStep++;
    }

    // Skip purpose for refugees
    if (questions[currentStep]?.id === 'purpose' && answers.origin === 'refugee') {
        answers.purpose = 'asylum';
        history.push(currentStep);
        currentStep++;
    }

    if (currentStep >= questions.length) {
        renderResults();
    } else {
        renderQuestion();
    }
}

function goBack() {
    if (history.length > 0) {
        currentStep = history.pop();
        // Remove answers from skipped steps
        for (let i = currentStep; i < questions.length; i++) {
            delete answers[questions[i].id];
        }
        renderQuestion();
    }
}

function restart() {
    currentStep = 0;
    answers = {};
    history = [];
    document.getElementById('progress-wrapper').style.display = '';
    renderQuestion();
}

// ============ INIT ============
renderQuestion();
