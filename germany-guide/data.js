// ============ TRANSLATIONS ============

const TRANSLATIONS = {
    en: {
        headerTitle: 'Germany Immigration Assistant',
        headerSubtitle: "I'll help you find the right documents",
        showMore: 'Show more options',
        more: 'more',
        restart: '↺ Start a new conversation',
        disclaimer: '⚠️ General information only — not legal advice. Verify with <a href="https://www.bamf.de" target="_blank">BAMF</a> or your local Ausländerbehörde.',
        resultsIntro: "Thanks! Here's your personalized document checklist based on your situation 👇",
        resultsOutro: "That's everything! Remember to check official sources for the most current requirements. Good luck with your move! 🍀",
        flow: {
            start: {
                message: "Hi! 👋 I'm here to help you figure out which documents you need for moving to Germany. Let me ask a few questions about your situation.",
                followUp: "Where are you coming from?",
            },
            purpose: { message: "Got it! Now tell me — what's bringing you to Germany?" },
            qualification: { message: "And what's your highest qualification?", followUp: "This affects which permit type you're eligible for." },
            housing: { message: "Do you already have a place to live in Germany?", followUp: "This is important because registration (Anmeldung) requires a confirmed address." },
            insurance: { message: "Last question! Do you have health insurance for Germany?", followUp: "Health insurance is mandatory for all residents." }
        },
        options: {
            eu: { label: 'EU / EEA / Switzerland', sub: 'Free movement rights' },
            non_eu_visa_free: { label: 'Non-EU (visa-free country)', sub: 'USA, Canada, UK, Australia, Japan...' },
            non_eu_visa: { label: 'Non-EU (visa required)', sub: 'Most other countries' },
            refugee: { label: 'Refugee / Asylum seeker', sub: 'Seeking international protection' },
            work: { label: 'Employment', sub: 'I have a job offer or contract' },
            study: { label: 'Study / Research', sub: 'University, language course, or research' },
            family: { label: 'Family reunification', sub: 'Joining spouse, parent, or child' },
            job_search: { label: 'Job seeking', sub: 'Chancenkarte / Job Seeker Visa' },
            self_employed: { label: 'Self-employment / Freelance', sub: 'Running my own business' },
            university: { label: 'University degree', sub: "Recognized Bachelor's, Master's, or PhD" },
            vocational: { label: 'Vocational training', sub: 'Professional qualification' },
            experience: { label: 'Work experience only', sub: '3+ years, no formal degree' },
            none_qual: { label: 'No recognized qualification', sub: 'May need recognition process' },
            housing_yes: { label: 'Yes, I have a rental contract', sub: 'With landlord confirmation available' },
            housing_temporary: { label: 'Temporary only', sub: 'Hotel, Airbnb, staying with friends' },
            housing_no: { label: 'Not yet', sub: 'Still searching' },
            insurance_public: { label: 'Yes — public insurance', sub: 'TK, AOK, Barmer, DAK...' },
            insurance_private: { label: 'Yes — private insurance', sub: 'Private health insurance (PKV)' },
            insurance_none: { label: 'No / only travel insurance', sub: 'Need to arrange this' }
        }
    },
    de: {
        headerTitle: 'Einwanderungsassistent Deutschland',
        headerSubtitle: 'Ich helfe Ihnen, die richtigen Dokumente zu finden',
        showMore: 'Mehr Optionen anzeigen',
        more: 'mehr',
        restart: '↺ Neues Gespräch starten',
        disclaimer: '⚠️ Nur allgemeine Informationen — keine Rechtsberatung. Überprüfen Sie bei <a href="https://www.bamf.de" target="_blank">BAMF</a> oder Ihrer Ausländerbehörde.',
        resultsIntro: "Danke! Hier ist Ihre persönliche Checkliste basierend auf Ihrer Situation 👇",
        resultsOutro: "Das war's! Denken Sie daran, offizielle Quellen für aktuelle Anforderungen zu prüfen. Viel Erfolg! 🍀",
        flow: {
            start: {
                message: "Hallo! 👋 Ich helfe Ihnen herauszufinden, welche Dokumente Sie für den Umzug nach Deutschland benötigen.",
                followUp: "Woher kommen Sie?",
            },
            purpose: { message: "Verstanden! Was führt Sie nach Deutschland?" },
            qualification: { message: "Und was ist Ihre höchste Qualifikation?", followUp: "Dies beeinflusst, welchen Aufenthaltstitel Sie beantragen können." },
            housing: { message: "Haben Sie bereits eine Wohnung in Deutschland?", followUp: "Wichtig, weil die Anmeldung eine bestätigte Adresse erfordert." },
            insurance: { message: "Letzte Frage! Haben Sie eine Krankenversicherung für Deutschland?", followUp: "Krankenversicherung ist für alle Einwohner Pflicht." }
        },
        options: {
            eu: { label: 'EU / EWR / Schweiz', sub: 'Freizügigkeit' },
            non_eu_visa_free: { label: 'Nicht-EU (visumfrei)', sub: 'USA, Kanada, UK, Australien, Japan...' },
            non_eu_visa: { label: 'Nicht-EU (Visum erforderlich)', sub: 'Die meisten anderen Länder' },
            refugee: { label: 'Flüchtling / Asylsuchende', sub: 'Internationalen Schutz suchend' },
            work: { label: 'Beschäftigung', sub: 'Ich habe ein Jobangebot oder einen Vertrag' },
            study: { label: 'Studium / Forschung', sub: 'Universität, Sprachkurs oder Forschung' },
            family: { label: 'Familiennachzug', sub: 'Ehepartner, Eltern oder Kind' },
            job_search: { label: 'Jobsuche', sub: 'Chancenkarte / Jobsuche-Visum' },
            self_employed: { label: 'Selbstständigkeit / Freelance', sub: 'Eigenes Unternehmen' },
            university: { label: 'Hochschulabschluss', sub: 'Anerkannter Bachelor, Master oder PhD' },
            vocational: { label: 'Berufsausbildung', sub: 'Berufliche Qualifikation' },
            experience: { label: 'Nur Berufserfahrung', sub: '3+ Jahre, kein formaler Abschluss' },
            none_qual: { label: 'Keine anerkannte Qualifikation', sub: 'Anerkennungsverfahren nötig' },
            housing_yes: { label: 'Ja, ich habe einen Mietvertrag', sub: 'Mit Wohnungsgeberbestätigung' },
            housing_temporary: { label: 'Nur vorübergehend', sub: 'Hotel, Airbnb, bei Freunden' },
            housing_no: { label: 'Noch nicht', sub: 'Suche noch' },
            insurance_public: { label: 'Ja — gesetzlich', sub: 'TK, AOK, Barmer, DAK...' },
            insurance_private: { label: 'Ja — privat', sub: 'Private Krankenversicherung (PKV)' },
            insurance_none: { label: 'Nein / nur Reiseversicherung', sub: 'Muss noch organisiert werden' }
        }
    },
    uk: {
        headerTitle: 'Імміграційний помічник Німеччини',
        headerSubtitle: 'Я допоможу знайти потрібні документи',
        showMore: 'Показати більше варіантів',
        more: 'ще',
        restart: '↺ Почати нову розмову',
        disclaimer: '⚠️ Лише загальна інформація — не юридична консультація. Перевіряйте на <a href="https://www.bamf.de" target="_blank">BAMF</a> або у місцевому Ausländerbehörde.',
        resultsIntro: "Дякую! Ось ваш персональний список документів на основі вашої ситуації 👇",
        resultsOutro: "Це все! Не забудьте перевірити офіційні джерела. Бажаю успіхів з переїздом! 🍀",
        flow: {
            start: {
                message: "Привіт! 👋 Я допоможу вам з'ясувати, які документи потрібні для переїзду до Німеччини.",
                followUp: "Звідки ви приїжджаєте?",
            },
            purpose: { message: "Зрозуміло! Яка мета вашого переїзду до Німеччини?" },
            qualification: { message: "Яка ваша найвища кваліфікація?", followUp: "Це впливає на тип дозволу на проживання." },
            housing: { message: "Чи є у вас вже житло в Німеччині?", followUp: "Це важливо, бо реєстрація (Anmeldung) потребує підтвердженої адреси." },
            insurance: { message: "Останнє питання! Чи є у вас медичне страхування для Німеччини?", followUp: "Медичне страхування є обов'язковим для всіх мешканців." }
        },
        options: {
            eu: { label: 'ЄС / ЄЕЗ / Швейцарія', sub: 'Вільне пересування' },
            non_eu_visa_free: { label: 'Не-ЄС (без візи)', sub: 'США, Канада, Великобританія, Австралія, Японія...' },
            non_eu_visa: { label: 'Не-ЄС (потрібна віза)', sub: 'Більшість інших країн' },
            refugee: { label: 'Біженець / шукач притулку', sub: 'Пошук міжнародного захисту' },
            work: { label: 'Працевлаштування', sub: 'Маю пропозицію роботи або контракт' },
            study: { label: 'Навчання / Дослідження', sub: 'Університет, мовні курси або дослідження' },
            family: { label: "Возз'єднання сім'ї", sub: 'Приєднання до чоловіка/дружини, батьків або дитини' },
            job_search: { label: 'Пошук роботи', sub: 'Chancenkarte / Віза для пошуку роботи' },
            self_employed: { label: 'Самозайнятість / Фріланс', sub: 'Власний бізнес' },
            university: { label: 'Університетський ступінь', sub: 'Визнаний бакалавр, магістр або PhD' },
            vocational: { label: 'Професійна освіта', sub: 'Професійна кваліфікація' },
            experience: { label: 'Тільки досвід роботи', sub: '3+ роки, без формального ступеня' },
            none_qual: { label: 'Немає визнаної кваліфікації', sub: 'Може потребуватися процес визнання' },
            housing_yes: { label: 'Так, маю договір оренди', sub: 'З підтвердженням від орендодавця' },
            housing_temporary: { label: 'Тільки тимчасове', sub: 'Готель, Airbnb, у друзів' },
            housing_no: { label: 'Ще ні', sub: 'Ще шукаю' },
            insurance_public: { label: 'Так — державне', sub: 'TK, AOK, Barmer, DAK...' },
            insurance_private: { label: 'Так — приватне', sub: 'Приватне медичне страхування (PKV)' },
            insurance_none: { label: 'Ні / тільки туристична', sub: 'Потрібно організувати' }
        }
    },
    ar: {
        headerTitle: 'مساعد الهجرة إلى ألمانيا',
        headerSubtitle: 'سأساعدك في العثور على المستندات المطلوبة',
        showMore: 'عرض المزيد من الخيارات',
        more: 'المزيد',
        restart: '↺ بدء محادثة جديدة',
        disclaimer: '⚠️ معلومات عامة فقط — ليست استشارة قانونية. تحقق من <a href="https://www.bamf.de" target="_blank">BAMF</a> أو مكتب الأجانب المحلي.',
        resultsIntro: "شكراً! إليك قائمة المستندات المخصصة بناءً على وضعك 👇",
        resultsOutro: "هذا كل شيء! تذكر التحقق من المصادر الرسمية. حظاً موفقاً في انتقالك! 🍀",
        flow: {
            start: {
                message: "مرحباً! 👋 أنا هنا لمساعدتك في معرفة المستندات المطلوبة للانتقال إلى ألمانيا.",
                followUp: "من أين أنت قادم؟",
            },
            purpose: { message: "فهمت! ما هو سبب انتقالك إلى ألمانيا؟" },
            qualification: { message: "ما هي أعلى مؤهلاتك؟", followUp: "هذا يؤثر على نوع تصريح الإقامة المناسب لك." },
            housing: { message: "هل لديك سكن في ألمانيا بالفعل؟", followUp: "هذا مهم لأن التسجيل (Anmeldung) يتطلب عنواناً مؤكداً." },
            insurance: { message: "السؤال الأخير! هل لديك تأمين صحي لألمانيا؟", followUp: "التأمين الصحي إلزامي لجميع المقيمين." }
        },
        options: {
            eu: { label: 'الاتحاد الأوروبي / المنطقة الاقتصادية / سويسرا', sub: 'حرية التنقل' },
            non_eu_visa_free: { label: 'خارج الاتحاد الأوروبي (بدون تأشيرة)', sub: 'أمريكا، كندا، بريطانيا، أستراليا، اليابان...' },
            non_eu_visa: { label: 'خارج الاتحاد الأوروبي (تأشيرة مطلوبة)', sub: 'معظم الدول الأخرى' },
            refugee: { label: 'لاجئ / طالب لجوء', sub: 'البحث عن حماية دولية' },
            work: { label: 'العمل', sub: 'لدي عرض عمل أو عقد' },
            study: { label: 'الدراسة / البحث', sub: 'جامعة أو دورة لغة أو بحث' },
            family: { label: 'لم شمل الأسرة', sub: 'الالتحاق بالزوج أو الوالد أو الطفل' },
            job_search: { label: 'البحث عن عمل', sub: 'Chancenkarte / تأشيرة البحث عن عمل' },
            self_employed: { label: 'عمل حر / مستقل', sub: 'إدارة عملي الخاص' },
            university: { label: 'شهادة جامعية', sub: 'بكالوريوس أو ماجستير أو دكتوراه معترف بها' },
            vocational: { label: 'تدريب مهني', sub: 'مؤهل مهني' },
            experience: { label: 'خبرة عملية فقط', sub: '+3 سنوات، بدون شهادة رسمية' },
            none_qual: { label: 'لا يوجد مؤهل معترف به', sub: 'قد تحتاج إلى عملية اعتراف' },
            housing_yes: { label: 'نعم، لدي عقد إيجار', sub: 'مع تأكيد من المؤجر' },
            housing_temporary: { label: 'مؤقت فقط', sub: 'فندق أو Airbnb أو عند أصدقاء' },
            housing_no: { label: 'ليس بعد', sub: 'ما زلت أبحث' },
            insurance_public: { label: 'نعم — تأمين عام', sub: 'TK, AOK, Barmer, DAK...' },
            insurance_private: { label: 'نعم — تأمين خاص', sub: 'تأمين صحي خاص (PKV)' },
            insurance_none: { label: 'لا / تأمين سفر فقط', sub: 'يجب ترتيب هذا' }
        }
    }
};


// ============ FLOW STRUCTURE (language-independent) ============

const FLOW_STRUCTURE = {
    start: {
        options: [
            { id: 'eu', icon: '🇪🇺', optKey: 'eu' },
            { id: 'non_eu_visa_free', icon: '🌍', optKey: 'non_eu_visa_free' },
            { id: 'non_eu_visa', icon: '🛂', optKey: 'non_eu_visa' }
        ],
        moreOptions: [
            { id: 'refugee', icon: '🕊️', optKey: 'refugee' }
        ],
        next: 'purpose'
    },
    purpose: {
        options: [
            { id: 'work', icon: '💼', optKey: 'work' },
            { id: 'study', icon: '🎓', optKey: 'study' },
            { id: 'family', icon: '👨‍👩‍👧', optKey: 'family' }
        ],
        moreOptions: [
            { id: 'job_search', icon: '🔍', optKey: 'job_search' },
            { id: 'self_employed', icon: '🏢', optKey: 'self_employed' }
        ],
        next: 'qualification',
        skipIf: { origin: ['refugee'] }
    },
    qualification: {
        options: [
            { id: 'university', icon: '🎓', optKey: 'university' },
            { id: 'vocational', icon: '🔧', optKey: 'vocational' },
            { id: 'experience', icon: '⭐', optKey: 'experience' }
        ],
        moreOptions: [
            { id: 'none', icon: '📋', optKey: 'none_qual' }
        ],
        next: 'housing',
        skipIf: { origin: ['eu', 'refugee'] }
    },
    housing: {
        options: [
            { id: 'yes', icon: '🏠', optKey: 'housing_yes' },
            { id: 'temporary', icon: '🏨', optKey: 'housing_temporary' },
            { id: 'no', icon: '❌', optKey: 'housing_no' }
        ],
        moreOptions: [],
        next: 'insurance'
    },
    insurance: {
        options: [
            { id: 'public', icon: '🏥', optKey: 'insurance_public' },
            { id: 'private', icon: '🩺', optKey: 'insurance_private' },
            { id: 'none', icon: '❌', optKey: 'insurance_none' }
        ],
        moreOptions: [],
        next: 'results'
    }
};


// ============ RESULT GENERATION (returns English — results keep German terms) ============

function generateResults(answers, lang) {
    const steps = [];
    const { origin, purpose, qualification, housing, insurance } = answers;

    // Results are always shown with German bureaucratic terms (they're universal)
    // But descriptions/tips are translated
    const R = RESULT_STRINGS[lang] || RESULT_STRINGS.en;

    if (origin === 'eu') {
        steps.push({
            number: R.beforeArrival,
            title: R.euTitle,
            timing: R.noDeadline,
            description: R.euDesc,
            documents: [R.euDoc1],
            tip: R.euTip
        });
    } else if (origin === 'non_eu_visa_free') {
        steps.push({
            number: R.beforeArrival,
            title: R.visaFreeTitle,
            timing: R.visaFreeTiming,
            description: R.visaFreeDesc,
            documents: [R.passport6, R.proofPurpose, R.proofFinancial, R.healthInsProof],
            tip: R.visaFreeTip
        });
    } else if (origin === 'non_eu_visa') {
        let visaType = 'National Visa (D-Visa)';
        let docs = [R.passport6blank, R.visaForm, R.biometricPhotos, R.healthInsProof, R.proofFinancialBlocked];

        if (purpose === 'work' && qualification === 'university') {
            visaType = 'EU Blue Card (§18g AufenthG)';
            docs.push(R.blueCardContract);
            docs.push(R.recognizedDegree);
        } else if (purpose === 'work') {
            visaType = R.workVisaLabel;
            docs.push(R.employmentContract);
            docs.push(R.qualRecognition);
        } else if (purpose === 'job_search') {
            visaType = 'Opportunity Card (Chancenkarte §20a)';
            docs.push(R.chancenDegree);
            docs.push(R.chancenLang);
            docs.push(R.chancenFinancial);
        } else if (purpose === 'study') {
            visaType = R.studentVisaLabel;
            docs.push(R.admissionLetter);
            docs.push(R.blockedAccount);
            docs.push(R.academicDocs);
        } else if (purpose === 'family') {
            visaType = R.familyVisaLabel;
            docs.push(R.familyCert);
            docs.push(R.familyLang);
            docs.push(R.familySponsor);
            docs.push(R.familySupport);
        } else if (purpose === 'self_employed') {
            visaType = R.selfEmpVisaLabel;
            docs.push(R.businessPlan);
            docs.push(R.investmentProof);
            docs.push(R.profQualifications);
        }

        steps.push({
            number: R.beforeArrival,
            title: `${R.applyFor}: ${visaType}`,
            timing: R.visaTiming,
            description: R.visaDesc,
            documents: docs,
            warning: R.visaWarning
        });
    } else if (origin === 'refugee') {
        steps.push({
            number: R.uponArrival,
            title: R.asylumTitle,
            timing: R.immediately,
            description: R.asylumDesc,
            documents: [R.asylumDoc1, R.asylumDoc2, R.asylumDoc3],
            tip: R.asylumTip
        });
    }

    // Anmeldung
    if (origin !== 'refugee') {
        steps.push({
            number: R.week12,
            title: R.anmeldungTitle,
            timing: R.anmeldungTiming,
            description: R.anmeldungDesc,
            documents: [R.anmeldungDoc1, R.anmeldungDoc2, R.anmeldungDoc3],
            tip: R.anmeldungTip,
            warning: housing === 'no' ? R.anmeldungWarning : undefined
        });
    }

    // Bank
    steps.push({
        number: R.week23,
        title: R.bankTitle,
        timing: R.bankTiming,
        description: R.bankDesc,
        documents: [R.bankDoc1, R.bankDoc2, R.bankDoc3],
        tip: R.bankTip
    });

    // Health Insurance
    if (insurance === 'none') {
        steps.push({
            number: R.week13,
            title: R.insTitle,
            timing: R.insTiming,
            description: R.insDesc,
            documents: [R.insDoc1, R.insDoc2, R.insDoc3],
            warning: R.insWarning,
            tip: R.insTip
        });
    }

    // Tax ID
    steps.push({
        number: R.week26,
        title: R.taxTitle,
        timing: R.taxTiming,
        description: R.taxDesc,
        documents: [R.taxDoc1, R.taxDoc2],
        tip: R.taxTip
    });

    // Residence Permit
    if (origin === 'non_eu_visa_free' || origin === 'non_eu_visa') {
        steps.push({
            number: R.month13,
            title: R.permitTitle,
            timing: R.permitTiming,
            description: R.permitDesc,
            documents: [R.permitDoc1, R.permitDoc2, R.permitDoc3, R.permitDoc4, R.permitDoc5, R.permitDoc6],
            warning: R.permitWarning
        });
    }

    // Social Security
    if (purpose === 'work' || purpose === 'self_employed') {
        steps.push({
            number: R.withEmployment,
            title: R.socialTitle,
            timing: R.socialTiming,
            description: R.socialDesc,
            documents: [R.socialDoc1, R.socialDoc2, R.socialDoc3],
            tip: R.socialTip
        });
    }

    // Additional
    steps.push({
        number: R.ongoing,
        title: R.additionalTitle,
        timing: R.additionalTiming,
        description: R.additionalDesc,
        documents: [R.addDoc1, R.addDoc2, R.addDoc3, R.addDoc4, R.addDoc5],
        tip: R.additionalTip
    });

    return steps;
}


// ============ RESULT STRINGS PER LANGUAGE ============

const RESULT_STRINGS = {
    en: {
        beforeArrival: 'Before Arrival', uponArrival: 'Upon Arrival', week12: 'Week 1-2', week23: 'Week 2-3',
        week13: 'Week 1-3', week26: 'Week 2-6', month13: 'Month 1-3', withEmployment: 'With Employment',
        ongoing: 'Ongoing', immediately: 'Immediately', noDeadline: 'No deadline',
        applyFor: 'Apply for',
        euTitle: 'No visa needed — Free Movement', euDesc: 'As an EU/EEA/Swiss citizen, you can live and work in Germany freely.',
        euDoc1: 'Valid passport or national ID card', euTip: 'You still must register your address (Anmeldung) after arrival.',
        visaFreeTitle: 'Enter visa-free, then apply for residence permit', visaFreeTiming: 'Apply within 90 days of arrival',
        visaFreeDesc: 'You can enter Germany without a visa and apply for your residence permit at the local Ausländerbehörde.',
        visaFreeTip: 'Book your Ausländerbehörde appointment immediately after arrival — wait times can be weeks.',
        passport6: 'Valid passport (6+ months validity)', proofPurpose: 'Proof of purpose (job contract, admission letter, etc.)',
        proofFinancial: 'Proof of financial means', healthInsProof: 'Health insurance confirmation',
        passport6blank: 'Valid passport (6+ months validity, 2 blank pages)', visaForm: 'Visa application form (Videx)',
        biometricPhotos: '2 biometric passport photos', proofFinancialBlocked: 'Proof of financial means / blocked account (Sperrkonto)',
        blueCardContract: 'Employment contract (min. €50,700/year gross, or €45,934 for shortage jobs)',
        recognizedDegree: 'Recognized university degree (check anabin database)',
        workVisaLabel: 'Work Visa (§18a/18b AufenthG)', employmentContract: 'Employment contract',
        qualRecognition: 'Qualification recognition (if required)',
        chancenDegree: 'Qualified degree or vocational training', chancenLang: 'German B1 or English B2 language certificate',
        chancenFinancial: 'Proof of financial means for search period',
        studentVisaLabel: 'Student Visa (§16b AufenthG)', admissionLetter: 'University admission letter (Zulassungsbescheid)',
        blockedAccount: 'Blocked account ~€11,904/year', academicDocs: 'Academic transcripts and qualifications',
        familyVisaLabel: 'Family Reunification Visa (§27-36 AufenthG)',
        familyCert: 'Marriage / birth certificate (apostilled)', familyLang: 'German language certificate (A1 for spouse)',
        familySponsor: "Sponsor's residence permit + Meldebescheinigung copy", familySupport: 'Proof sponsor can financially support you',
        selfEmpVisaLabel: 'Self-Employment Visa (§21 AufenthG)', businessPlan: 'Business plan',
        investmentProof: 'Proof of investment capital', profQualifications: 'Professional qualifications',
        visaTiming: 'Apply at German embassy 3-6 months before move',
        visaDesc: 'You need a national visa before entering Germany. Apply at the German embassy/consulate in your country.',
        visaWarning: 'Processing: 4-12 weeks. Apply early!',
        asylumTitle: 'Register and apply for asylum at BAMF', asylumDesc: 'Register with authorities and apply for asylum at the Federal Office for Migration and Refugees.',
        asylumDoc1: 'Passport or any ID (if available)', asylumDoc2: 'Evidence supporting your claim', asylumDoc3: 'Medical records (if relevant)',
        asylumTip: "You'll receive a temporary permit (Aufenthaltsgestattung) and be assigned to a reception center.",
        anmeldungTitle: 'Address Registration (Anmeldung)', anmeldungTiming: 'Within 14 days of moving in',
        anmeldungDesc: 'Register your address at the Bürgeramt. This unlocks everything else — bank account, tax ID, contracts.',
        anmeldungDoc1: 'Passport or ID', anmeldungDoc2: 'Anmeldeformular (registration form)',
        anmeldungDoc3: 'Wohnungsgeberbestätigung (landlord confirmation — they must sign this)',
        anmeldungTip: 'Book online in advance. Bring a German speaker if possible — most offices operate only in German.',
        anmeldungWarning: 'You need a permanent address first! This is your top priority.',
        bankTitle: 'Open a German Bank Account', bankTiming: 'After Anmeldung',
        bankDesc: 'Needed for salary, rent payments, and all contracts.',
        bankDoc1: 'Passport or ID', bankDoc2: 'Meldebescheinigung (from Anmeldung)', bankDoc3: 'Visa/residence permit (non-EU)',
        bankTip: 'N26 or Vivid can be opened without Anmeldung. Traditional banks (Sparkasse, Deutsche Bank) require it.',
        insTitle: 'Get Health Insurance (Krankenversicherung)', insTiming: 'Required from day 1',
        insDesc: 'Mandatory for all residents. If employed, your employer enrolls you. Otherwise arrange it yourself.',
        insDoc1: 'Passport', insDoc2: 'Employment contract or university enrollment', insDoc3: 'Meldebescheinigung (when available)',
        insWarning: "Residence permit applications require insurance proof. Don't delay!", insTip: 'Public insurance costs ~14.6% of salary (split with employer). Providers: TK, AOK, Barmer, DAK.',
        taxTitle: 'Tax ID (Steuer-ID)', taxTiming: 'Arrives by mail 2-4 weeks after Anmeldung',
        taxDesc: 'Your 11-digit tax number is sent automatically. Your employer needs it for payroll.',
        taxDoc1: 'No action needed — arrives by post', taxDoc2: 'If urgent: contact your local Finanzamt',
        taxTip: 'Can start work without it — employer uses Steuerklasse 6 temporarily, difference gets refunded.',
        permitTitle: 'Residence Permit (Aufenthaltstitel)', permitTiming: 'Before visa expires',
        permitDesc: 'Visit the Ausländerbehörde to convert your visa into a residence permit.',
        permitDoc1: 'Passport with visa', permitDoc2: 'Biometric photo', permitDoc3: 'Meldebescheinigung',
        permitDoc4: 'Health insurance proof', permitDoc5: 'Employment contract or purpose documentation', permitDoc6: 'Residence permit application form',
        permitWarning: 'Book immediately — appointments can be months out. A "Fiktionsbescheinigung" covers you while waiting.',
        socialTitle: 'Social Security Number', socialTiming: 'Automatic via employer',
        socialDesc: 'Covers health, pension, unemployment, care, and accident insurance. Employer handles registration.',
        socialDoc1: 'Health insurance membership', socialDoc2: 'Tax ID', socialDoc3: 'Social security number (arrives from Deutsche Rentenversicherung)',
        socialTip: 'Your employer does all the paperwork. The number arrives within a few weeks.',
        additionalTitle: 'Additional Setup', additionalTiming: 'First 1-3 months', additionalDesc: 'Other important tasks:',
        addDoc1: 'Rundfunkbeitrag registration (€18.36/month TV/radio fee)', addDoc2: 'German phone number (needed for many services)',
        addDoc3: 'Tax class assignment at Finanzamt', addDoc4: 'Kindergeld application (if you have children)',
        addDoc5: 'Driving license conversion (within 6 months for non-EU)',
        additionalTip: 'GEZ/Rundfunkbeitrag will find you after Anmeldung — you must pay even without a TV.'
    },
    de: {
        beforeArrival: 'Vor der Ankunft', uponArrival: 'Bei Ankunft', week12: 'Woche 1-2', week23: 'Woche 2-3',
        week13: 'Woche 1-3', week26: 'Woche 2-6', month13: 'Monat 1-3', withEmployment: 'Mit Beschäftigung',
        ongoing: 'Laufend', immediately: 'Sofort', noDeadline: 'Keine Frist',
        applyFor: 'Beantragen',
        euTitle: 'Kein Visum nötig — Freizügigkeit', euDesc: 'Als EU/EWR/Schweizer Bürger können Sie frei in Deutschland leben und arbeiten.',
        euDoc1: 'Gültiger Reisepass oder Personalausweis', euTip: 'Sie müssen trotzdem Ihre Adresse anmelden (Anmeldung).',
        visaFreeTitle: 'Visumfrei einreisen, dann Aufenthaltstitel beantragen', visaFreeTiming: 'Innerhalb von 90 Tagen beantragen',
        visaFreeDesc: 'Sie können ohne Visum einreisen und den Aufenthaltstitel bei der Ausländerbehörde beantragen.',
        visaFreeTip: 'Buchen Sie sofort einen Termin bei der Ausländerbehörde — Wartezeiten können Wochen betragen.',
        passport6: 'Gültiger Reisepass (6+ Monate)', proofPurpose: 'Zwecknachweis (Arbeitsvertrag, Zulassung, etc.)',
        proofFinancial: 'Finanzierungsnachweis', healthInsProof: 'Krankenversicherungsnachweis',
        passport6blank: 'Gültiger Reisepass (6+ Monate, 2 freie Seiten)', visaForm: 'Visumantragsformular (Videx)',
        biometricPhotos: '2 biometrische Passfotos', proofFinancialBlocked: 'Finanzierungsnachweis / Sperrkonto',
        blueCardContract: 'Arbeitsvertrag (mind. €50.700/Jahr brutto, oder €45.934 für Mangelberufe)',
        recognizedDegree: 'Anerkannter Hochschulabschluss (anabin prüfen)',
        workVisaLabel: 'Arbeitsvisum (§18a/18b AufenthG)', employmentContract: 'Arbeitsvertrag',
        qualRecognition: 'Anerkennung der Qualifikation (falls erforderlich)',
        chancenDegree: 'Qualifizierter Abschluss oder Berufsausbildung', chancenLang: 'Deutsch B1 oder Englisch B2 Sprachzertifikat',
        chancenFinancial: 'Finanzierungsnachweis für Suchzeitraum',
        studentVisaLabel: 'Studienvisum (§16b AufenthG)', admissionLetter: 'Zulassungsbescheid der Universität',
        blockedAccount: 'Sperrkonto ~€11.904/Jahr', academicDocs: 'Akademische Zeugnisse und Qualifikationen',
        familyVisaLabel: 'Visum zum Familiennachzug (§27-36 AufenthG)',
        familyCert: 'Heirats-/Geburtsurkunde (apostilliert)', familyLang: 'Deutsches Sprachzertifikat (A1 für Ehegatten)',
        familySponsor: 'Aufenthaltstitel + Meldebescheinigung des Sponsors', familySupport: 'Nachweis der finanziellen Unterstützung',
        selfEmpVisaLabel: 'Visum zur Selbstständigkeit (§21 AufenthG)', businessPlan: 'Geschäftsplan',
        investmentProof: 'Investitionskapitalnachweis', profQualifications: 'Berufliche Qualifikationen',
        visaTiming: 'Bei der Botschaft 3-6 Monate vor Umzug beantragen',
        visaDesc: 'Sie benötigen ein nationales Visum vor der Einreise. Beantragen Sie es bei der deutschen Botschaft.',
        visaWarning: 'Bearbeitungszeit: 4-12 Wochen. Frühzeitig beantragen!',
        asylumTitle: 'Registrierung und Asylantrag beim BAMF', asylumDesc: 'Registrieren Sie sich und stellen Sie einen Asylantrag beim Bundesamt für Migration und Flüchtlinge.',
        asylumDoc1: 'Reisepass oder Ausweis (falls vorhanden)', asylumDoc2: 'Belege für Ihren Antrag', asylumDoc3: 'Medizinische Unterlagen (falls relevant)',
        asylumTip: 'Sie erhalten eine Aufenthaltsgestattung und werden einer Erstaufnahmeeinrichtung zugewiesen.',
        anmeldungTitle: 'Wohnsitzanmeldung (Anmeldung)', anmeldungTiming: 'Innerhalb von 14 Tagen nach Einzug',
        anmeldungDesc: 'Melden Sie Ihre Adresse beim Bürgeramt an. Dies ist die Voraussetzung für Bankkonto, Steuer-ID und Verträge.',
        anmeldungDoc1: 'Reisepass oder Personalausweis', anmeldungDoc2: 'Anmeldeformular (Meldeschein)',
        anmeldungDoc3: 'Wohnungsgeberbestätigung (vom Vermieter unterschrieben)',
        anmeldungTip: 'Online vorher Termin buchen. Bringen Sie jemanden mit, der Deutsch spricht.',
        anmeldungWarning: 'Sie brauchen zuerst eine feste Adresse! Höchste Priorität.',
        bankTitle: 'Deutsches Bankkonto eröffnen', bankTiming: 'Nach der Anmeldung',
        bankDesc: 'Benötigt für Gehalt, Mietzahlung und alle Verträge.',
        bankDoc1: 'Reisepass oder Ausweis', bankDoc2: 'Meldebescheinigung', bankDoc3: 'Visum/Aufenthaltstitel (Nicht-EU)',
        bankTip: 'N26 oder Vivid funktionieren ohne Anmeldung. Traditionelle Banken (Sparkasse, Deutsche Bank) verlangen sie.',
        insTitle: 'Krankenversicherung abschließen', insTiming: 'Ab Tag 1 erforderlich',
        insDesc: 'Pflicht für alle Einwohner. Bei Anstellung meldet Ihr Arbeitgeber Sie an.',
        insDoc1: 'Reisepass', insDoc2: 'Arbeitsvertrag oder Immatrikulationsbescheinigung', insDoc3: 'Meldebescheinigung (wenn vorhanden)',
        insWarning: 'Für den Aufenthaltstitel wird Versicherungsnachweis benötigt!', insTip: 'Gesetzliche Versicherung: ~14,6% des Gehalts (mit Arbeitgeber geteilt). Anbieter: TK, AOK, Barmer, DAK.',
        taxTitle: 'Steuer-ID (Steuerliche Identifikationsnummer)', taxTiming: 'Kommt per Post 2-4 Wochen nach Anmeldung',
        taxDesc: 'Ihre 11-stellige Steuernummer wird automatisch zugesandt. Ihr Arbeitgeber braucht sie für die Gehaltsabrechnung.',
        taxDoc1: 'Keine Aktion nötig — kommt per Post', taxDoc2: 'Falls dringend: Finanzamt kontaktieren',
        taxTip: 'Arbeit ohne Steuer-ID möglich — Arbeitgeber nutzt Steuerklasse 6, Differenz wird erstattet.',
        permitTitle: 'Aufenthaltstitel', permitTiming: 'Vor Ablauf des Visums',
        permitDesc: 'Besuchen Sie die Ausländerbehörde um Ihr Visum in einen Aufenthaltstitel umzuwandeln.',
        permitDoc1: 'Reisepass mit Visum', permitDoc2: 'Biometrisches Foto', permitDoc3: 'Meldebescheinigung',
        permitDoc4: 'Krankenversicherungsnachweis', permitDoc5: 'Arbeitsvertrag oder Zwecknachweis', permitDoc6: 'Antragsformular',
        permitWarning: 'Sofort Termin buchen — Wartezeiten können Monate betragen. Eine Fiktionsbescheinigung überbrückt.',
        socialTitle: 'Sozialversicherungsnummer', socialTiming: 'Automatisch über den Arbeitgeber',
        socialDesc: 'Deckt Kranken-, Renten-, Arbeitslosen-, Pflege- und Unfallversicherung ab.',
        socialDoc1: 'Krankenversicherungsmitgliedschaft', socialDoc2: 'Steuer-ID', socialDoc3: 'Sozialversicherungsnummer (von der Deutschen Rentenversicherung)',
        socialTip: 'Ihr Arbeitgeber erledigt alles. Die Nummer kommt in wenigen Wochen.',
        additionalTitle: 'Weitere Einrichtung', additionalTiming: 'Erste 1-3 Monate', additionalDesc: 'Weitere wichtige Aufgaben:',
        addDoc1: 'Rundfunkbeitrag anmelden (€18,36/Monat)', addDoc2: 'Deutsche Telefonnummer besorgen',
        addDoc3: 'Steuerklasse beim Finanzamt zuordnen', addDoc4: 'Kindergeld beantragen (falls Kinder)',
        addDoc5: 'Führerschein umschreiben (innerhalb 6 Monaten für Nicht-EU)',
        additionalTip: 'Der Rundfunkbeitrag findet Sie nach der Anmeldung — Pflicht auch ohne Fernseher.'
    },
    uk: {
        beforeArrival: 'До прибуття', uponArrival: 'Після прибуття', week12: 'Тиждень 1-2', week23: 'Тиждень 2-3',
        week13: 'Тиждень 1-3', week26: 'Тиждень 2-6', month13: 'Місяць 1-3', withEmployment: 'З працевлаштуванням',
        ongoing: 'Поточні', immediately: 'Негайно', noDeadline: 'Без дедлайну',
        applyFor: 'Подати заявку на',
        euTitle: 'Віза не потрібна — Вільне пересування', euDesc: 'Як громадянин ЄС/ЄЕЗ/Швейцарії, ви можете вільно жити та працювати в Німеччині.',
        euDoc1: 'Дійсний паспорт або посвідчення особи', euTip: 'Ви все одно повинні зареєструвати адресу (Anmeldung) після прибуття.',
        visaFreeTitle: 'Безвізовий в\'їзд, потім подача на дозвіл на проживання', visaFreeTiming: 'Подати протягом 90 днів',
        visaFreeDesc: 'Ви можете в\'їхати без візи та подати на дозвіл на проживання у місцевому Ausländerbehörde.',
        visaFreeTip: 'Записуйтесь до Ausländerbehörde одразу після прибуття — черги можуть бути тижнями.',
        passport6: 'Дійсний паспорт (6+ місяців)', proofPurpose: 'Підтвердження мети (контракт, лист зарахування тощо)',
        proofFinancial: 'Підтвердження фінансів', healthInsProof: 'Підтвердження медичного страхування',
        passport6blank: 'Дійсний паспорт (6+ місяців, 2 чисті сторінки)', visaForm: 'Візова анкета (Videx)',
        biometricPhotos: '2 біометричні фото', proofFinancialBlocked: 'Підтвердження фінансів / блокований рахунок (Sperrkonto)',
        blueCardContract: 'Трудовий договір (мін. €50.700/рік, або €45.934 для дефіцитних професій)',
        recognizedDegree: 'Визнаний диплом (перевірте базу anabin)',
        workVisaLabel: 'Робоча віза (§18a/18b AufenthG)', employmentContract: 'Трудовий договір',
        qualRecognition: 'Визнання кваліфікації (якщо потрібно)',
        chancenDegree: 'Диплом або професійна освіта', chancenLang: 'Сертифікат німецької B1 або англійської B2',
        chancenFinancial: 'Підтвердження фінансів на період пошуку',
        studentVisaLabel: 'Студентська віза (§16b AufenthG)', admissionLetter: 'Лист зарахування (Zulassungsbescheid)',
        blockedAccount: 'Блокований рахунок ~€11.904/рік', academicDocs: 'Академічні документи та кваліфікації',
        familyVisaLabel: "Віза для возз'єднання сім'ї (§27-36 AufenthG)",
        familyCert: 'Свідоцтво про шлюб/народження (апостильоване)', familyLang: 'Сертифікат німецької (A1 для подружжя)',
        familySponsor: 'Дозвіл на проживання + Meldebescheinigung спонсора', familySupport: 'Підтвердження фінансової підтримки',
        selfEmpVisaLabel: 'Віза для самозайнятих (§21 AufenthG)', businessPlan: 'Бізнес-план',
        investmentProof: 'Підтвердження інвестиційного капіталу', profQualifications: 'Професійні кваліфікації',
        visaTiming: 'Подати в посольстві за 3-6 місяців до переїзду',
        visaDesc: 'Вам потрібна національна віза перед в\'їздом. Подавайте в німецькому посольстві/консульстві.',
        visaWarning: 'Обробка: 4-12 тижнів. Подавайте завчасно!',
        asylumTitle: 'Реєстрація та подача на притулок у BAMF', asylumDesc: 'Зареєструйтесь та подайте заяву на притулок у Федеральному відомстві з питань міграції та біженців.',
        asylumDoc1: 'Паспорт або будь-який документ (якщо є)', asylumDoc2: 'Докази на підтримку вашої заяви', asylumDoc3: 'Медичні документи (якщо доречно)',
        asylumTip: 'Ви отримаєте тимчасовий дозвіл (Aufenthaltsgestattung) та будете направлені до приймального центру.',
        anmeldungTitle: 'Реєстрація адреси (Anmeldung)', anmeldungTiming: 'Протягом 14 днів після заселення',
        anmeldungDesc: 'Зареєструйте адресу в Бюргерамті. Це відкриває все інше — банківський рахунок, податковий номер, контракти.',
        anmeldungDoc1: 'Паспорт або посвідчення', anmeldungDoc2: 'Реєстраційна форма (Anmeldeformular)',
        anmeldungDoc3: 'Підтвердження від орендодавця (Wohnungsgeberbestätigung)',
        anmeldungTip: 'Запишіться онлайн заздалегідь. Візьміть з собою німецькомовного друга — більшість офісів працюють тільки німецькою.',
        anmeldungWarning: 'Спочатку потрібна постійна адреса! Це найвищий пріоритет.',
        bankTitle: 'Відкрити німецький банківський рахунок', bankTiming: 'Після Anmeldung',
        bankDesc: 'Потрібен для зарплати, оплати оренди та всіх контрактів.',
        bankDoc1: 'Паспорт або посвідчення', bankDoc2: 'Meldebescheinigung (з Anmeldung)', bankDoc3: 'Віза/дозвіл на проживання (не-ЄС)',
        bankTip: 'N26 або Vivid можна відкрити без Anmeldung. Традиційні банки (Sparkasse, Deutsche Bank) вимагають його.',
        insTitle: 'Отримати медичне страхування (Krankenversicherung)', insTiming: 'Обов\'язково з 1-го дня',
        insDesc: 'Обов\'язково для всіх мешканців. При працевлаштуванні роботодавець реєструє вас.',
        insDoc1: 'Паспорт', insDoc2: 'Трудовий договір або довідка з університету', insDoc3: 'Meldebescheinigung (коли буде)',
        insWarning: 'Для дозволу на проживання потрібен доказ страхування. Не відкладайте!', insTip: 'Державне страхування: ~14,6% зарплати (ділиться з роботодавцем). Компанії: TK, AOK, Barmer, DAK.',
        taxTitle: 'Податковий номер (Steuer-ID)', taxTiming: 'Приходить поштою через 2-4 тижні після Anmeldung',
        taxDesc: 'Ваш 11-значний податковий номер надсилається автоматично. Роботодавець потребує його для зарплати.',
        taxDoc1: 'Дій не потрібно — приходить поштою', taxDoc2: 'Якщо терміново: зверніться до Finanzamt',
        taxTip: 'Можна почати працювати без нього — роботодавець використовує Steuerklasse 6, різницю повернуть.',
        permitTitle: 'Дозвіл на проживання (Aufenthaltstitel)', permitTiming: 'До закінчення візи',
        permitDesc: 'Відвідайте Ausländerbehörde щоб перетворити візу на дозвіл на проживання.',
        permitDoc1: 'Паспорт з візою', permitDoc2: 'Біометричне фото', permitDoc3: 'Meldebescheinigung',
        permitDoc4: 'Підтвердження страхування', permitDoc5: 'Трудовий договір або документи мети', permitDoc6: 'Заява на дозвіл',
        permitWarning: 'Записуйтесь одразу — черги можуть бути місяцями. Fiktionsbescheinigung покриває вас під час очікування.',
        socialTitle: 'Номер соціального страхування', socialTiming: 'Автоматично через роботодавця',
        socialDesc: 'Охоплює медичне, пенсійне, страхування від безробіття та нещасних випадків.',
        socialDoc1: 'Членство в медичній страховій', socialDoc2: 'Steuer-ID', socialDoc3: 'Номер соцстрахування (від Deutsche Rentenversicherung)',
        socialTip: 'Роботодавець оформлює все. Номер приходить протягом кількох тижнів.',
        additionalTitle: 'Додаткове оформлення', additionalTiming: 'Перші 1-3 місяці', additionalDesc: 'Інші важливі завдання:',
        addDoc1: 'Реєстрація Rundfunkbeitrag (€18,36/місяць за ТВ/радіо)', addDoc2: 'Німецький номер телефону',
        addDoc3: 'Призначення податкового класу у Finanzamt', addDoc4: 'Заява на Kindergeld (якщо є діти)',
        addDoc5: 'Переоформлення водійського посвідчення (протягом 6 місяців для не-ЄС)',
        additionalTip: 'Rundfunkbeitrag знайде вас після Anmeldung — платити обов\'язково навіть без телевізора.'
    },
    ar: {
        beforeArrival: 'قبل الوصول', uponArrival: 'عند الوصول', week12: 'الأسبوع 1-2', week23: 'الأسبوع 2-3',
        week13: 'الأسبوع 1-3', week26: 'الأسبوع 2-6', month13: 'الشهر 1-3', withEmployment: 'مع التوظيف',
        ongoing: 'مستمر', immediately: 'فوراً', noDeadline: 'بدون موعد نهائي',
        applyFor: 'تقدم بطلب',
        euTitle: 'لا حاجة لتأشيرة — حرية التنقل', euDesc: 'كمواطن في الاتحاد الأوروبي/المنطقة الاقتصادية/سويسرا، يمكنك العيش والعمل بحرية في ألمانيا.',
        euDoc1: 'جواز سفر ساري أو بطاقة هوية', euTip: 'لا يزال يتعين عليك تسجيل عنوانك (Anmeldung) بعد الوصول.',
        visaFreeTitle: 'دخول بدون تأشيرة، ثم التقدم للحصول على تصريح إقامة', visaFreeTiming: 'التقديم خلال 90 يوماً من الوصول',
        visaFreeDesc: 'يمكنك الدخول بدون تأشيرة والتقدم للحصول على تصريح إقامة في مكتب الأجانب المحلي.',
        visaFreeTip: 'احجز موعداً في مكتب الأجانب فوراً — فترات الانتظار قد تكون أسابيع.',
        passport6: 'جواز سفر ساري (6+ أشهر)', proofPurpose: 'إثبات الغرض (عقد عمل، خطاب قبول، إلخ)',
        proofFinancial: 'إثبات القدرة المالية', healthInsProof: 'تأكيد التأمين الصحي',
        passport6blank: 'جواز سفر ساري (6+ أشهر، صفحتان فارغتان)', visaForm: 'نموذج طلب التأشيرة (Videx)',
        biometricPhotos: '2 صورة بيومترية', proofFinancialBlocked: 'إثبات مالي / حساب مجمد (Sperrkonto)',
        blueCardContract: 'عقد عمل (حد أدنى €50,700/سنة، أو €45,934 للمهن المطلوبة)',
        recognizedDegree: 'شهادة جامعية معترف بها (تحقق من قاعدة بيانات anabin)',
        workVisaLabel: 'تأشيرة عمل (§18a/18b AufenthG)', employmentContract: 'عقد عمل',
        qualRecognition: 'اعتراف بالمؤهلات (إذا لزم الأمر)',
        chancenDegree: 'شهادة أو تدريب مهني', chancenLang: 'شهادة لغة ألمانية B1 أو إنجليزية B2',
        chancenFinancial: 'إثبات مالي لفترة البحث',
        studentVisaLabel: 'تأشيرة دراسة (§16b AufenthG)', admissionLetter: 'خطاب القبول الجامعي (Zulassungsbescheid)',
        blockedAccount: 'حساب مجمد ~€11,904/سنة', academicDocs: 'الشهادات والمؤهلات الأكاديمية',
        familyVisaLabel: 'تأشيرة لم شمل الأسرة (§27-36 AufenthG)',
        familyCert: 'شهادة زواج/ميلاد (مصدقة)', familyLang: 'شهادة لغة ألمانية (A1 للزوج/الزوجة)',
        familySponsor: 'تصريح إقامة الكفيل + Meldebescheinigung', familySupport: 'إثبات قدرة الكفيل على الإعالة المالية',
        selfEmpVisaLabel: 'تأشيرة العمل الحر (§21 AufenthG)', businessPlan: 'خطة عمل',
        investmentProof: 'إثبات رأس المال', profQualifications: 'المؤهلات المهنية',
        visaTiming: 'التقديم في السفارة قبل 3-6 أشهر من الانتقال',
        visaDesc: 'تحتاج تأشيرة وطنية قبل الدخول. قدم في السفارة/القنصلية الألمانية في بلدك.',
        visaWarning: 'المعالجة: 4-12 أسبوع. قدم مبكراً!',
        asylumTitle: 'التسجيل وتقديم طلب اللجوء في BAMF', asylumDesc: 'سجل لدى السلطات وقدم طلب اللجوء في المكتب الاتحادي للهجرة واللاجئين.',
        asylumDoc1: 'جواز سفر أو أي هوية (إن وجدت)', asylumDoc2: 'أدلة تدعم طلبك', asylumDoc3: 'سجلات طبية (إن كانت ذات صلة)',
        asylumTip: 'ستحصل على تصريح مؤقت (Aufenthaltsgestattung) وسيتم تعيينك لمركز استقبال.',
        anmeldungTitle: 'تسجيل العنوان (Anmeldung)', anmeldungTiming: 'خلال 14 يوماً من الانتقال',
        anmeldungDesc: 'سجل عنوانك في مكتب المواطنين (Bürgeramt). هذا يفتح كل شيء آخر — حساب بنكي، رقم ضريبي، عقود.',
        anmeldungDoc1: 'جواز سفر أو هوية', anmeldungDoc2: 'نموذج التسجيل (Anmeldeformular)',
        anmeldungDoc3: 'تأكيد من المؤجر (Wohnungsgeberbestätigung)',
        anmeldungTip: 'احجز موعداً مسبقاً عبر الإنترنت. أحضر شخصاً يتحدث الألمانية — معظم المكاتب تعمل بالألمانية فقط.',
        anmeldungWarning: 'تحتاج عنواناً دائماً أولاً! هذه أولويتك القصوى.',
        bankTitle: 'فتح حساب بنكي ألماني', bankTiming: 'بعد Anmeldung',
        bankDesc: 'مطلوب للراتب ودفع الإيجار وجميع العقود.',
        bankDoc1: 'جواز سفر أو هوية', bankDoc2: 'Meldebescheinigung (من Anmeldung)', bankDoc3: 'تأشيرة/تصريح إقامة (غير الاتحاد الأوروبي)',
        bankTip: 'N26 أو Vivid يمكن فتحها بدون Anmeldung. البنوك التقليدية (Sparkasse, Deutsche Bank) تتطلبها.',
        insTitle: 'الحصول على تأمين صحي (Krankenversicherung)', insTiming: 'مطلوب من اليوم الأول',
        insDesc: 'إلزامي لجميع المقيمين. عند التوظيف، صاحب العمل يسجلك.',
        insDoc1: 'جواز سفر', insDoc2: 'عقد عمل أو شهادة تسجيل جامعي', insDoc3: 'Meldebescheinigung (عند توفرها)',
        insWarning: 'طلبات تصريح الإقامة تتطلب إثبات تأمين. لا تؤجل!', insTip: 'التأمين العام: ~14.6% من الراتب (مقسم مع صاحب العمل). مقدمون: TK, AOK, Barmer, DAK.',
        taxTitle: 'الرقم الضريبي (Steuer-ID)', taxTiming: 'يصل بالبريد بعد 2-4 أسابيع من Anmeldung',
        taxDesc: 'رقمك الضريبي المكون من 11 رقماً يُرسل تلقائياً. صاحب العمل يحتاجه للرواتب.',
        taxDoc1: 'لا إجراء مطلوب — يصل بالبريد', taxDoc2: 'إذا كان عاجلاً: تواصل مع Finanzamt',
        taxTip: 'يمكن بدء العمل بدونه — صاحب العمل يستخدم Steuerklasse 6 مؤقتاً، الفرق يُسترد.',
        permitTitle: 'تصريح الإقامة (Aufenthaltstitel)', permitTiming: 'قبل انتهاء التأشيرة',
        permitDesc: 'زر مكتب الأجانب لتحويل تأشيرتك إلى تصريح إقامة.',
        permitDoc1: 'جواز سفر مع التأشيرة', permitDoc2: 'صورة بيومترية', permitDoc3: 'Meldebescheinigung',
        permitDoc4: 'إثبات تأمين صحي', permitDoc5: 'عقد عمل أو وثائق الغرض', permitDoc6: 'نموذج طلب تصريح الإقامة',
        permitWarning: 'احجز فوراً — المواعيد قد تستغرق أشهر. Fiktionsbescheinigung يغطيك أثناء الانتظار.',
        socialTitle: 'رقم الضمان الاجتماعي', socialTiming: 'تلقائي عبر صاحب العمل',
        socialDesc: 'يغطي التأمين الصحي والتقاعد والبطالة والرعاية والحوادث.',
        socialDoc1: 'عضوية التأمين الصحي', socialDoc2: 'Steuer-ID', socialDoc3: 'رقم الضمان الاجتماعي (من Deutsche Rentenversicherung)',
        socialTip: 'صاحب العمل يتولى كل الأوراق. الرقم يصل خلال أسابيع قليلة.',
        additionalTitle: 'إعداد إضافي', additionalTiming: 'أول 1-3 أشهر', additionalDesc: 'مهام مهمة أخرى:',
        addDoc1: 'تسجيل Rundfunkbeitrag (€18.36/شهر رسوم التلفزيون/الراديو)', addDoc2: 'رقم هاتف ألماني',
        addDoc3: 'تعيين فئة ضريبية في Finanzamt', addDoc4: 'طلب Kindergeld (إذا لديك أطفال)',
        addDoc5: 'تحويل رخصة القيادة (خلال 6 أشهر لغير الاتحاد الأوروبي)',
        additionalTip: 'Rundfunkbeitrag سيجدك بعد Anmeldung — يجب الدفع حتى بدون تلفزيون.'
    }
};
