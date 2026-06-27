// ============ SEARCH TOPICS ============
// Each topic has keywords (for matching), and result steps to display

const TOPICS = [
    {
        id: 'anmeldung',
        icon: '🏠',
        keywords: {
            en: ['register', 'address', 'anmeldung', 'registration', 'move in', 'bürgeramt', 'meldung', 'wohnung', 'apartment', 'landlord'],
            de: ['anmelden', 'adresse', 'anmeldung', 'registrierung', 'einzug', 'bürgeramt', 'meldung', 'wohnung', 'vermieter'],
            uk: ['реєстрація', 'адреса', 'анмельдунг', 'прописка', 'заселення', 'квартира', 'орендодавець'],
            ar: ['تسجيل', 'عنوان', 'سكن', 'شقة', 'مؤجر', 'انتقال']
        }
    },
    {
        id: 'visa_work',
        icon: '💼',
        keywords: {
            en: ['work visa', 'work permit', 'blue card', 'employment', 'job', 'arbeitsvisum', 'contract'],
            de: ['arbeitsvisum', 'blue card', 'beschäftigung', 'arbeit', 'arbeitsvertrag', 'arbeitserlaubnis'],
            uk: ['робоча віза', 'дозвіл на роботу', 'blue card', 'працевлаштування', 'робота', 'контракт'],
            ar: ['تأشيرة عمل', 'تصريح عمل', 'بلو كارد', 'عمل', 'وظيفة', 'عقد']
        }
    },
    {
        id: 'visa_study',
        icon: '🎓',
        keywords: {
            en: ['study', 'student visa', 'university', 'research', 'studium', 'enrollment', 'semester'],
            de: ['studium', 'studentenvisum', 'universität', 'forschung', 'immatrikulation', 'hochschule'],
            uk: ['навчання', 'студентська віза', 'університет', 'дослідження', 'вступ'],
            ar: ['دراسة', 'تأشيرة طالب', 'جامعة', 'بحث', 'تسجيل']
        }
    },
    {
        id: 'visa_family',
        icon: '👨‍👩‍👧',
        keywords: {
            en: ['family', 'spouse', 'reunification', 'marriage', 'wife', 'husband', 'child', 'children', 'partner'],
            de: ['familie', 'ehepartner', 'nachzug', 'heirat', 'ehefrau', 'ehemann', 'kind', 'kinder', 'partner'],
            uk: ["сім'я", 'подружжя', "возз'єднання", 'шлюб', 'дружина', 'чоловік', 'дитина', 'діти'],
            ar: ['عائلة', 'زوج', 'زوجة', 'لم شمل', 'زواج', 'أطفال', 'طفل']
        }
    },
    {
        id: 'visa_jobseeker',
        icon: '🔍',
        keywords: {
            en: ['job search', 'job seeker', 'chancenkarte', 'opportunity card', 'looking for work', 'find job'],
            de: ['jobsuche', 'chancenkarte', 'arbeit suchen', 'jobsucher', 'stellensuche'],
            uk: ['пошук роботи', 'шукач роботи', 'chancenkarte', 'шукаю роботу'],
            ar: ['بحث عن عمل', 'باحث عن عمل', 'chancenkarte', 'فرصة عمل']
        }
    },
    {
        id: 'visa_freelance',
        icon: '🏢',
        keywords: {
            en: ['freelance', 'self-employed', 'business', 'startup', 'entrepreneur', 'selbstständig'],
            de: ['freiberufler', 'selbstständig', 'geschäft', 'startup', 'unternehmer', 'gewerbe'],
            uk: ['фріланс', 'самозайнятість', 'бізнес', 'підприємець', 'стартап'],
            ar: ['عمل حر', 'مستقل', 'أعمال', 'رائد أعمال', 'شركة']
        }
    },
    {
        id: 'health_insurance',
        icon: '🏥',
        keywords: {
            en: ['health insurance', 'krankenversicherung', 'insurance', 'medical', 'doctor', 'TK', 'AOK', 'public insurance', 'private insurance'],
            de: ['krankenversicherung', 'versicherung', 'arzt', 'gesetzlich', 'privat', 'krankenkasse'],
            uk: ['медичне страхування', 'страховка', 'лікар', 'медицина', 'поліклініка'],
            ar: ['تأمين صحي', 'تأمين', 'طبيب', 'مستشفى', 'علاج']
        }
    },
    {
        id: 'bank_account',
        icon: '🏦',
        keywords: {
            en: ['bank', 'bank account', 'IBAN', 'konto', 'sparkasse', 'N26', 'money', 'salary'],
            de: ['bank', 'bankkonto', 'konto', 'sparkasse', 'girokonto', 'geld', 'gehalt'],
            uk: ['банк', 'банківський рахунок', 'рахунок', 'гроші', 'зарплата'],
            ar: ['بنك', 'حساب بنكي', 'حساب', 'راتب', 'أموال']
        }
    },
    {
        id: 'tax_id',
        icon: '🧾',
        keywords: {
            en: ['tax', 'tax ID', 'steuer', 'steuer-id', 'finanzamt', 'tax number', 'income tax', 'steuerklasse'],
            de: ['steuer', 'steuer-id', 'steuernummer', 'finanzamt', 'einkommensteuer', 'steuerklasse', 'lohnsteuer'],
            uk: ['податок', 'податковий номер', 'steuer-id', 'фінансамт', 'податкова'],
            ar: ['ضريبة', 'رقم ضريبي', 'دخل', 'مالية']
        }
    },
    {
        id: 'residence_permit',
        icon: '🛂',
        keywords: {
            en: ['residence permit', 'aufenthaltstitel', 'visa extension', 'ausländerbehörde', 'foreigners office', 'permit', 'stay'],
            de: ['aufenthaltstitel', 'aufenthaltserlaubnis', 'ausländerbehörde', 'verlängerung', 'aufenthalt'],
            uk: ['дозвіл на проживання', 'aufenthaltstitel', 'ausländerbehörde', 'продовження', 'перебування'],
            ar: ['تصريح إقامة', 'إقامة', 'مكتب الأجانب', 'تمديد', 'بقاء']
        }
    },
    {
        id: 'social_security',
        icon: '🛡️',
        keywords: {
            en: ['social security', 'pension', 'retirement', 'sozialversicherung', 'rentenversicherung', 'unemployment'],
            de: ['sozialversicherung', 'rente', 'rentenversicherung', 'arbeitslosigkeit', 'sozial'],
            uk: ['соціальне страхування', 'пенсія', 'безробіття', 'соціальне забезпечення'],
            ar: ['ضمان اجتماعي', 'تقاعد', 'معاش', 'بطالة', 'تأمين اجتماعي']
        }
    },
    {
        id: 'asylum',
        icon: '🕊️',
        keywords: {
            en: ['asylum', 'refugee', 'protection', 'BAMF', 'flee', 'war', 'persecution'],
            de: ['asyl', 'flüchtling', 'schutz', 'BAMF', 'flucht', 'krieg', 'verfolgung'],
            uk: ['притулок', 'біженець', 'захист', 'BAMF', 'втеча', 'війна', 'переслідування'],
            ar: ['لجوء', 'لاجئ', 'حماية', 'BAMF', 'هروب', 'حرب', 'اضطهاد']
        }
    },
    {
        id: 'driving_license',
        icon: '🚗',
        keywords: {
            en: ['driving', 'license', 'führerschein', 'car', 'drive', 'convert license'],
            de: ['führerschein', 'auto', 'fahren', 'fahrerlaubnis', 'umschreiben'],
            uk: ['водійське посвідчення', 'права', 'автомобіль', 'водіння', 'переоформлення'],
            ar: ['رخصة قيادة', 'سيارة', 'قيادة', 'تحويل رخصة']
        }
    },
    {
        id: 'eu_citizen',
        icon: '🇪🇺',
        keywords: {
            en: ['EU citizen', 'european', 'free movement', 'EEA', 'switzerland', 'no visa'],
            de: ['EU-bürger', 'europäisch', 'freizügigkeit', 'EWR', 'schweiz', 'kein visum'],
            uk: ['громадянин ЄС', 'європейський', 'вільне пересування', 'без візи'],
            ar: ['مواطن أوروبي', 'الاتحاد الأوروبي', 'حرية تنقل', 'بدون تأشيرة']
        }
    },
    {
        id: 'rundfunkbeitrag',
        icon: '📺',
        keywords: {
            en: ['TV', 'radio', 'rundfunkbeitrag', 'GEZ', 'broadcast fee', 'television'],
            de: ['rundfunkbeitrag', 'GEZ', 'fernsehen', 'radio', 'beitrag'],
            uk: ['телебачення', 'радіо', 'rundfunkbeitrag', 'GEZ', 'внесок'],
            ar: ['تلفزيون', 'راديو', 'رسوم البث', 'GEZ']
        }
    },
    {
        id: 'kindergeld',
        icon: '👶',
        keywords: {
            en: ['kindergeld', 'child benefit', 'children', 'family benefit', 'child allowance'],
            de: ['kindergeld', 'kinderfreibetrag', 'kinder', 'familienleistung'],
            uk: ['kindergeld', 'допомога на дітей', 'діти', 'виплати на дітей'],
            ar: ['إعانة أطفال', 'kindergeld', 'أطفال', 'مساعدة عائلية']
        }
    }
];


// ============ UI TRANSLATIONS ============

const UI = {
    en: {
        title: '🇩🇪 What do you need help with?',
        subtitle: 'Type your situation and we\'ll show you exactly which documents you need',
        placeholder: 'e.g. "register address", "work visa", "health insurance"...',
        back: 'Back to search',
        disclaimer: '⚠️ General information only — not legal advice. Verify with <a href="https://www.bamf.de" target="_blank">BAMF</a> or your local Ausländerbehörde.',
        quickTags: ['Register address', 'Work visa', 'Health insurance', 'Bank account', 'Tax ID', 'EU citizen', 'Family reunion', 'Student visa'],
        noResults: 'No results found. Try different keywords.',
    },
    de: {
        title: '🇩🇪 Wobei brauchen Sie Hilfe?',
        subtitle: 'Beschreiben Sie Ihre Situation — wir zeigen Ihnen die nötigen Dokumente',
        placeholder: 'z.B. "Anmeldung", "Arbeitsvisum", "Krankenversicherung"...',
        back: 'Zurück zur Suche',
        disclaimer: '⚠️ Nur allgemeine Informationen — keine Rechtsberatung. Überprüfen Sie bei <a href="https://www.bamf.de" target="_blank">BAMF</a> oder Ihrer Ausländerbehörde.',
        quickTags: ['Anmeldung', 'Arbeitsvisum', 'Krankenversicherung', 'Bankkonto', 'Steuer-ID', 'EU-Bürger', 'Familiennachzug', 'Studienvisum'],
        noResults: 'Keine Ergebnisse. Versuchen Sie andere Suchbegriffe.',
    },
    uk: {
        title: '🇩🇪 З чим вам потрібна допомога?',
        subtitle: 'Опишіть вашу ситуацію — ми покажемо, які документи вам потрібні',
        placeholder: 'напр. "реєстрація адреси", "робоча віза", "страхування"...',
        back: 'Повернутися до пошуку',
        disclaimer: '⚠️ Лише загальна інформація — не юридична консультація. Перевіряйте на <a href="https://www.bamf.de" target="_blank">BAMF</a> або у місцевому Ausländerbehörde.',
        quickTags: ['Реєстрація адреси', 'Робоча віза', 'Медичне страхування', 'Банківський рахунок', 'Податковий номер', 'Громадянин ЄС', "Возз'єднання сім'ї", 'Студентська віза'],
        noResults: 'Нічого не знайдено. Спробуйте інші ключові слова.',
    },
    ar: {
        title: '🇩🇪 بماذا تحتاج مساعدة؟',
        subtitle: 'اكتب وضعك وسنعرض لك المستندات المطلوبة بالضبط',
        placeholder: 'مثال: "تسجيل عنوان"، "تأشيرة عمل"، "تأمين صحي"...',
        back: 'العودة للبحث',
        disclaimer: '⚠️ معلومات عامة فقط — ليست استشارة قانونية. تحقق من <a href="https://www.bamf.de" target="_blank">BAMF</a> أو مكتب الأجانب المحلي.',
        quickTags: ['تسجيل العنوان', 'تأشيرة عمل', 'تأمين صحي', 'حساب بنكي', 'رقم ضريبي', 'مواطن أوروبي', 'لم شمل الأسرة', 'تأشيرة طالب'],
        noResults: 'لم يتم العثور على نتائج. جرب كلمات مختلفة.',
    }
};


// ============ TOPIC DISPLAY NAMES ============

const TOPIC_NAMES = {
    en: {
        anmeldung: { title: 'Address Registration (Anmeldung)', desc: 'Register your residence at the Bürgeramt' },
        visa_work: { title: 'Work Visa / EU Blue Card', desc: 'Employment-based residence permit' },
        visa_study: { title: 'Student Visa', desc: 'Study or research in Germany' },
        visa_family: { title: 'Family Reunification', desc: 'Join your spouse, child, or parent' },
        visa_jobseeker: { title: 'Opportunity Card (Chancenkarte)', desc: 'Job seeker visa for qualified workers' },
        visa_freelance: { title: 'Self-Employment / Freelance Visa', desc: 'Start your own business in Germany' },
        health_insurance: { title: 'Health Insurance', desc: 'Mandatory Krankenversicherung' },
        bank_account: { title: 'Bank Account', desc: 'Open a German bank account (Girokonto)' },
        tax_id: { title: 'Tax ID (Steuer-ID)', desc: 'Your tax identification number' },
        residence_permit: { title: 'Residence Permit', desc: 'Aufenthaltstitel at the Ausländerbehörde' },
        social_security: { title: 'Social Security', desc: 'Pension, unemployment, care insurance' },
        asylum: { title: 'Asylum / Refugee Protection', desc: 'Apply for international protection' },
        driving_license: { title: 'Driving License', desc: 'Convert or get a Führerschein' },
        eu_citizen: { title: 'EU/EEA Citizen Rights', desc: 'Free movement — what you still need to do' },
        rundfunkbeitrag: { title: 'TV/Radio Fee (Rundfunkbeitrag)', desc: 'Mandatory broadcast contribution' },
        kindergeld: { title: 'Child Benefit (Kindergeld)', desc: 'Financial support for families with children' }
    },
    de: {
        anmeldung: { title: 'Wohnsitzanmeldung (Anmeldung)', desc: 'Adresse beim Bürgeramt anmelden' },
        visa_work: { title: 'Arbeitsvisum / EU Blue Card', desc: 'Aufenthaltserlaubnis zur Beschäftigung' },
        visa_study: { title: 'Studienvisum', desc: 'Studium oder Forschung in Deutschland' },
        visa_family: { title: 'Familiennachzug', desc: 'Ehepartner, Kind oder Eltern nachziehen' },
        visa_jobseeker: { title: 'Chancenkarte', desc: 'Jobsuche-Visum für Fachkräfte' },
        visa_freelance: { title: 'Selbstständigkeit / Freiberufler', desc: 'Eigenes Geschäft in Deutschland' },
        health_insurance: { title: 'Krankenversicherung', desc: 'Pflichtversicherung für alle' },
        bank_account: { title: 'Bankkonto', desc: 'Girokonto in Deutschland eröffnen' },
        tax_id: { title: 'Steuer-ID', desc: 'Steuerliche Identifikationsnummer' },
        residence_permit: { title: 'Aufenthaltstitel', desc: 'Bei der Ausländerbehörde beantragen' },
        social_security: { title: 'Sozialversicherung', desc: 'Rente, Arbeitslosigkeit, Pflege' },
        asylum: { title: 'Asyl / Flüchtlingsschutz', desc: 'Internationalen Schutz beantragen' },
        driving_license: { title: 'Führerschein', desc: 'Umschreiben oder neu beantragen' },
        eu_citizen: { title: 'EU-Bürger Rechte', desc: 'Freizügigkeit — was Sie noch tun müssen' },
        rundfunkbeitrag: { title: 'Rundfunkbeitrag', desc: 'Pflichtbeitrag für Rundfunk' },
        kindergeld: { title: 'Kindergeld', desc: 'Finanzielle Unterstützung für Familien' }
    },
    uk: {
        anmeldung: { title: 'Реєстрація адреси (Anmeldung)', desc: 'Зареєструвати проживання в Бюргерамті' },
        visa_work: { title: 'Робоча віза / EU Blue Card', desc: 'Дозвіл на проживання для працевлаштування' },
        visa_study: { title: 'Студентська віза', desc: 'Навчання або дослідження в Німеччині' },
        visa_family: { title: "Возз'єднання сім'ї", desc: 'Приєднатися до подружжя, дитини або батьків' },
        visa_jobseeker: { title: 'Chancenkarte (Карта можливостей)', desc: 'Віза для пошуку роботи' },
        visa_freelance: { title: 'Самозайнятість / Фріланс', desc: 'Відкрити бізнес у Німеччині' },
        health_insurance: { title: 'Медичне страхування', desc: "Обов'язкове Krankenversicherung" },
        bank_account: { title: 'Банківський рахунок', desc: 'Відкрити рахунок у німецькому банку' },
        tax_id: { title: 'Податковий номер (Steuer-ID)', desc: 'Податковий ідентифікаційний номер' },
        residence_permit: { title: 'Дозвіл на проживання', desc: 'Aufenthaltstitel в Ausländerbehörde' },
        social_security: { title: 'Соціальне страхування', desc: 'Пенсія, безробіття, медичний догляд' },
        asylum: { title: 'Притулок / Захист біженців', desc: 'Подати заяву на міжнародний захист' },
        driving_license: { title: 'Водійське посвідчення', desc: 'Переоформити або отримати Führerschein' },
        eu_citizen: { title: 'Права громадян ЄС', desc: 'Вільне пересування — що ще потрібно зробити' },
        rundfunkbeitrag: { title: 'Внесок за ТВ/радіо (Rundfunkbeitrag)', desc: "Обов'язковий внесок за мовлення" },
        kindergeld: { title: 'Допомога на дітей (Kindergeld)', desc: "Фінансова підтримка сімей з дітьми" }
    },
    ar: {
        anmeldung: { title: 'تسجيل العنوان (Anmeldung)', desc: 'تسجيل إقامتك في مكتب المواطنين' },
        visa_work: { title: 'تأشيرة العمل / EU Blue Card', desc: 'تصريح إقامة للعمل' },
        visa_study: { title: 'تأشيرة الدراسة', desc: 'الدراسة أو البحث في ألمانيا' },
        visa_family: { title: 'لم شمل الأسرة', desc: 'الالتحاق بالزوج أو الطفل أو الوالد' },
        visa_jobseeker: { title: 'بطاقة الفرصة (Chancenkarte)', desc: 'تأشيرة البحث عن عمل' },
        visa_freelance: { title: 'العمل الحر / المستقل', desc: 'بدء عملك الخاص في ألمانيا' },
        health_insurance: { title: 'التأمين الصحي', desc: 'Krankenversicherung إلزامي' },
        bank_account: { title: 'الحساب البنكي', desc: 'فتح حساب بنكي ألماني' },
        tax_id: { title: 'الرقم الضريبي (Steuer-ID)', desc: 'رقم التعريف الضريبي' },
        residence_permit: { title: 'تصريح الإقامة', desc: 'Aufenthaltstitel في مكتب الأجانب' },
        social_security: { title: 'الضمان الاجتماعي', desc: 'التقاعد والبطالة والرعاية' },
        asylum: { title: 'اللجوء / حماية اللاجئين', desc: 'التقدم للحماية الدولية' },
        driving_license: { title: 'رخصة القيادة', desc: 'تحويل أو الحصول على Führerschein' },
        eu_citizen: { title: 'حقوق مواطني الاتحاد الأوروبي', desc: 'حرية التنقل — ما عليك فعله' },
        rundfunkbeitrag: { title: 'رسوم البث (Rundfunkbeitrag)', desc: 'مساهمة البث الإلزامية' },
        kindergeld: { title: 'إعانة الأطفال (Kindergeld)', desc: 'دعم مالي للعائلات' }
    }
};


// ============ TOPIC RESULT STEPS ============
// Each topic returns an array of steps. We use English as primary; other languages reference RESULT_STRINGS.

function getTopicSteps(topicId, lang) {
    const R = TOPIC_RESULTS[lang] || TOPIC_RESULTS.en;
    return R[topicId] || [];
}

const TOPIC_RESULTS = { en: {}, de: {}, uk: {}, ar: {} };

// --- English results ---
TOPIC_RESULTS.en = {
    anmeldung: [
        { badge: 'Step 1', title: 'Book an appointment at the Bürgeramt', timing: 'As soon as you have housing',
          desc: 'You must register within 14 days of moving in. Book online — walk-ins are rarely possible.',
          docs: ['Valid passport or national ID', 'Completed Anmeldeformular (registration form)', 'Wohnungsgeberbestätigung (landlord confirmation — they must sign this)'],
          tip: 'Bring a German speaker. Most Bürgeramt staff only speak German.' },
        { badge: 'Step 2', title: 'Receive your Meldebescheinigung', timing: 'Same day — given at the appointment',
          desc: 'This certificate proves your registered address. You need it for almost everything else: bank, tax, contracts.',
          docs: ['Keep this document safe — you\'ll need copies multiple times'], tip: 'Request 2-3 extra copies at the appointment.' },
        { badge: 'Note', title: 'What if I don\'t have a permanent address?', timing: 'Before Anmeldung',
          desc: 'You cannot register without a confirmed address. Some options:',
          docs: ['Ask a friend if you can register at their address (with their landlord\'s permission)', 'Some cities accept furnished apartment (möblierte Wohnung) contracts', 'Hotels and Airbnbs generally cannot be used'],
          warning: 'Without Anmeldung, you cannot open a bank account, get a tax ID, or sign most contracts.' }
    ],
    visa_work: [
        { badge: 'Before arrival', title: 'Apply for Work Visa / EU Blue Card', timing: '3-6 months before moving',
          desc: 'Apply at the German embassy/consulate in your home country.',
          docs: ['Valid passport (6+ months, 2 blank pages)', 'Visa application form (Videx)', '2 biometric photos', 'Employment contract meeting salary threshold', 'Recognized university degree (for Blue Card: check anabin)', 'Health insurance proof', 'Proof of financial means'],
          tip: 'EU Blue Card requires min. €50,700/year (or €45,934 for shortage occupations).' },
        { badge: 'After arrival', title: 'Complete Anmeldung + apply for residence permit', timing: 'Within 14 days (Anmeldung) / 90 days (permit)',
          desc: 'Register your address, then book an appointment at the Ausländerbehörde.',
          docs: ['Meldebescheinigung', 'Passport with visa', 'Employment contract', 'Degree certificate', 'Health insurance proof', 'Biometric photo'],
          warning: 'Book Ausländerbehörde appointment immediately — waits can be months.' }
    ],
    visa_study: [
        { badge: 'Before arrival', title: 'Apply for Student Visa (§16b)', timing: '3-6 months before semester starts',
          desc: 'Apply at the German embassy. You need university admission first.',
          docs: ['Valid passport', 'University admission letter (Zulassungsbescheid)', 'Blocked account (Sperrkonto) with ~€11,904/year', 'Health insurance proof', 'Academic transcripts', 'Language certificate (if required by university)', 'Visa application form + biometric photos'],
          tip: 'Open a blocked account at Expatrio, Fintiba, or Deutsche Bank before applying.' },
        { badge: 'After arrival', title: 'Anmeldung + university enrollment + residence permit', timing: 'First 2 weeks',
          desc: 'Register your address, complete university enrollment (Immatrikulation), then visit Ausländerbehörde.',
          docs: ['Meldebescheinigung', 'Immatrikulationsbescheinigung (enrollment cert)', 'Semester ticket info', 'Student health insurance (under 30: public at ~€120/month)'],
          tip: 'Student insurance is cheaper. Switch to public student tariff (TK, AOK) upon enrollment.' }
    ],
    visa_family: [
        { badge: 'Before arrival', title: 'Apply for Family Reunification Visa', timing: '3-6 months before',
          desc: 'Apply at German embassy. Your family member in Germany must meet certain requirements.',
          docs: ['Valid passport', 'Marriage/birth certificate (apostilled + German translation)', 'German language certificate (A1 for spouse joining)', 'Sponsor\'s residence permit + Meldebescheinigung (copy)', 'Proof sponsor has sufficient income/space', 'Health insurance proof', 'Visa form + biometric photos'],
          tip: 'A1 German certificate is required BEFORE the visa appointment for spouse reunion.' },
        { badge: 'After arrival', title: 'Anmeldung + Residence permit', timing: 'Within 14 days / 90 days',
          desc: 'Register at the same address as your family member, then apply for your own residence permit.',
          docs: ['Joint Meldebescheinigung', 'Marriage certificate (original)', 'Sponsor\'s income proof', 'Health insurance for yourself'],
          warning: 'Family reunification rules changed in 2025 — verify current requirements with your embassy.' }
    ],
    visa_jobseeker: [
        { badge: 'Apply', title: 'Opportunity Card (Chancenkarte §20a)', timing: 'Apply 2-3 months before',
          desc: 'For qualified workers to come to Germany and search for employment for up to 1 year.',
          docs: ['Valid passport', 'Recognized degree or vocational qualification', 'German B1 OR English B2 certificate', 'Proof of financial means (€1,027/month)', 'Health insurance', 'Visa form + photos'],
          tip: 'Points system: you need 6+ points from education, language, experience, age, and Germany connection.' },
        { badge: 'In Germany', title: 'Find a job and switch to work permit', timing: 'Within 1 year',
          desc: 'Once employed, convert your Chancenkarte to a work-based residence permit.',
          docs: ['Employment contract', 'Employer registration form', 'Visit Ausländerbehörde to change permit type'],
          warning: 'You may work up to 20h/week on side jobs while searching. Full employment requires permit conversion.' }
    ],
    visa_freelance: [
        { badge: 'Apply', title: 'Self-Employment Visa (§21 AufenthG)', timing: '3-6 months before',
          desc: 'For entrepreneurs and freelancers. Requires proof your business benefits Germany.',
          docs: ['Valid passport', 'Detailed business plan', 'Proof of investment capital', 'Professional qualifications/portfolio', 'Client letters of intent (if possible)', 'Health insurance', 'Financial plan showing sustainability'],
          tip: 'Freelancers (Freiberufler): artists, consultants, developers often have easier approval than trade businesses (Gewerbe).' },
        { badge: 'After arrival', title: 'Register your business', timing: 'First month',
          desc: 'Depending on your activity: register at Finanzamt (freelance) or Gewerbeamt (trade).',
          docs: ['Fragebogen zur steuerlichen Erfassung (tax registration form)', 'Gewerbeanmeldung (if trade business)', 'Business bank account'],
          tip: 'Freelancers (Freiberufler) don\'t need Gewerbeanmeldung — just Finanzamt registration.' }
    ],
    health_insurance: [
        { badge: 'Required', title: 'Choose: Public or Private Insurance', timing: 'Before or immediately after arrival',
          desc: 'Mandatory for all German residents. Employed? Your employer enrolls you. Self-employed or student? Arrange yourself.',
          docs: ['For public (GKV): employment contract or student enrollment', 'For private (PKV): income proof (>€69,300/year or self-employed)', 'Passport', 'Meldebescheinigung (when available)'],
          tip: 'Public insurance: ~14.6% of salary split with employer. Major providers: TK, AOK, Barmer, DAK.' },
        { badge: 'Important', title: 'What public insurance covers', timing: 'Ongoing',
          desc: 'Doctor visits, hospital, prescriptions, mental health, dental (basic), maternity. Family members covered free (Familienversicherung).',
          docs: ['Electronic health card (eGK) — sent by your insurer after enrollment', 'European Health Insurance Card (EHIC) — for travel in EU'],
          tip: 'Private is hard to switch back from after 55. Choose carefully.' }
    ],
    bank_account: [
        { badge: 'Step 1', title: 'Choose a bank and open account', timing: 'After Anmeldung (or before with online banks)',
          desc: 'You need a German IBAN for salary, rent, and contracts.',
          docs: ['Passport or ID', 'Meldebescheinigung (traditional banks require this)', 'Visa or residence permit (non-EU)', 'Sometimes: employment contract or student enrollment proof'],
          tip: 'Online banks (N26, Vivid, Tomorrow) don\'t require Anmeldung. Traditional banks (Sparkasse, Deutsche Bank, Commerzbank) do.' },
        { badge: 'Step 2', title: 'Set up direct debits (Lastschrift)', timing: 'Once account is active',
          desc: 'Most bills in Germany are paid via automatic direct debit (SEPA Lastschrift).',
          docs: ['Rent transfer setup', 'Health insurance direct debit', 'Internet/phone contract', 'Rundfunkbeitrag (TV fee)'],
          tip: 'Keep at least 1-2 months rent as buffer. German landlords take Lastschrift seriously.' }
    ],
    tax_id: [
        { badge: 'Automatic', title: 'Tax ID (Steuer-ID) arrives by post', timing: '2-4 weeks after Anmeldung',
          desc: 'Your 11-digit lifetime tax identification number is sent automatically. No application needed.',
          docs: ['No action required — letter arrives at your registered address', 'If urgent: call/visit your local Finanzamt with Meldebescheinigung + passport'],
          tip: 'Your employer needs this for correct tax withholding. Without it, you\'re taxed at highest rate (Steuerklasse 6) — refunded later.' },
        { badge: 'Also important', title: 'Tax class (Steuerklasse) assignment', timing: 'With first employment',
          desc: 'Your tax class determines monthly withholding. Single = Class 1, Married = Class 3/5 or 4/4.',
          docs: ['Marriage certificate (for combined classes)', 'Application at Finanzamt for class change'],
          tip: 'Married couples: 3/5 split benefits if one earns significantly more. 4/4 is equal.' }
    ],
    residence_permit: [
        { badge: 'Apply', title: 'Visit the Ausländerbehörde', timing: 'Before your visa expires (within 90 days for visa-free)',
          desc: 'The Ausländerbehörde converts your visa into a residence permit (Aufenthaltstitel).',
          docs: ['Passport with visa', 'Biometric passport photo', 'Meldebescheinigung', 'Health insurance proof', 'Employment contract / university enrollment / other purpose documentation', 'Completed application form', 'Fee: €100-140'],
          warning: 'Book immediately after arrival — wait times are often 2-4 months. A Fiktionsbescheinigung covers you while waiting.' },
        { badge: 'Note', title: 'Fiktionsbescheinigung (fiction certificate)', timing: 'If visa expires before appointment',
          desc: 'If you applied before your visa expired, you receive this document allowing you to stay and work legally until your permit is issued.',
          docs: ['Proof you submitted application before visa expiry', 'Current passport'],
          tip: 'This is a normal situation — many people wait months. The Fiktionsbescheinigung gives you full rights.' }
    ],
    social_security: [
        { badge: 'Automatic', title: 'Social Security Registration', timing: 'When employment starts',
          desc: 'Germany has 5 mandatory social insurances: health, pension, unemployment, long-term care, accident. Your employer handles everything.',
          docs: ['Health insurance membership confirmation', 'Tax ID', 'Social security number (Sozialversicherungsnummer) — arrives from Deutsche Rentenversicherung'],
          tip: 'Total social contributions: ~40% of gross salary, split equally between you and employer.' },
        { badge: 'Your number', title: 'Sozialversicherungsnummer', timing: 'Arrives within weeks of first employment',
          desc: 'Your unique 12-digit social security number. Stays with you for life in Germany.',
          docs: ['Sozialversicherungsausweis (social insurance card) arrives by post', 'Keep this safe — needed for every new employer'],
          tip: 'If you worked in another EU country, your pension contributions may be transferable.' }
    ],
    asylum: [
        { badge: 'Step 1', title: 'Register and apply for asylum', timing: 'Immediately upon arrival',
          desc: 'Report to authorities (police, reception center, or BAMF directly) and formally apply for asylum.',
          docs: ['Passport or any identity document (if available)', 'Any evidence supporting your claim (documents, photos, medical records)', 'Nothing is required — you can apply without any documents'],
          tip: 'You\'ll receive an Aufenthaltsgestattung (temporary residence permit) and be assigned to a reception center (Erstaufnahmeeinrichtung).' },
        { badge: 'Step 2', title: 'BAMF interview', timing: 'Weeks to months after application',
          desc: 'You will be interviewed by BAMF about your reasons for seeking protection. You have the right to an interpreter.',
          docs: ['Any new evidence or documents', 'Right to free legal counsel (Asylverfahrensberatung)'],
          warning: 'Get legal advice before the interview. Organizations like Pro Asyl, Caritas, or Diakonie offer free help.' },
        { badge: 'If approved', title: 'After positive decision', timing: 'After BAMF decision',
          desc: 'You receive a residence permit (1-3 years) and can access integration courses, work, and social benefits.',
          docs: ['Residence permit application at Ausländerbehörde', 'Integration course enrollment', 'Jobcenter registration for benefits/support'],
          tip: 'Recognized refugees have similar rights to German citizens for social benefits and family reunification.' }
    ],
    driving_license: [
        { badge: 'EU citizens', title: 'EU driving license is valid indefinitely', timing: 'No conversion needed',
          desc: 'If you have an EU/EEA driving license, it\'s valid in Germany without any conversion.',
          docs: ['Valid EU driving license'], tip: 'You may need to update your address with your home country\'s authority.' },
        { badge: 'Non-EU', title: 'Convert your license within 6 months', timing: 'First 6 months (some countries 12 months)',
          desc: 'Non-EU licenses are valid for 6 months after registration. After that, you must convert.',
          docs: ['Current foreign driving license + certified German translation', 'Passport + Meldebescheinigung', 'Biometric passport photo', 'Eye test (Sehtest ~€7)', 'First aid certificate (Erste-Hilfe-Kurs ~€40)', 'Fee: ~€35-50'],
          tip: 'Some countries have bilateral agreements (no test needed): USA (some states), Japan, Australia, Canada, South Korea. Others require theory + practical test.' }
    ],
    eu_citizen: [
        { badge: 'Rights', title: 'Freedom of movement — no visa needed', timing: 'Unlimited',
          desc: 'As EU/EEA/Swiss citizen, you can live, work, and study in Germany without any permit.',
          docs: ['Valid passport or national ID card — that\'s all you need to enter and stay'],
          tip: 'You do NOT need a residence permit. But you must still register your address (Anmeldung).' },
        { badge: 'Required', title: 'You still need Anmeldung + insurance', timing: 'First 2 weeks',
          desc: 'Even EU citizens must register their address and have health insurance.',
          docs: ['Anmeldung at Bürgeramt (same process as everyone)', 'Health insurance (EHIC covers short stays, need full German insurance if staying)', 'Tax ID arrives automatically after Anmeldung'],
          tip: 'If employed in Germany, your employer registers you for German public health insurance automatically.' }
    ],
    rundfunkbeitrag: [
        { badge: 'Mandatory', title: 'Register for broadcast fee', timing: 'After Anmeldung (they find you automatically)',
          desc: '€18.36/month per household. Mandatory for all residents regardless of whether you own a TV or radio.',
          docs: ['No documents needed — a letter arrives after Anmeldung', 'Register online at rundfunkbeitrag.de or via the letter they send'],
          tip: 'Exemptions available for very low income (social benefits recipients). Students in shared flats: only one person per flat pays.',
          warning: 'Ignoring it leads to debt + collection agencies. Pay or apply for exemption.' }
    ],
    kindergeld: [
        { badge: 'Apply', title: 'Child benefit (Kindergeld)', timing: 'After Anmeldung + residence permit (non-EU)',
          desc: '€250/month per child. Available to all residents with children, regardless of nationality (with valid permit).',
          docs: ['Kindergeld application form (KG1)', 'Birth certificates of children', 'Meldebescheinigung', 'Tax IDs of parents and children', 'Residence permit (non-EU)', 'Marriage certificate (if applicable)'],
          tip: 'Apply at the Familienkasse (family benefits office). Can be claimed retroactively for up to 6 months.' }
    ]
};

// For DE/UK/AR: reuse English step structures but the search/display names are localized.
// The detailed result steps use German bureaucratic terms universally — they're what you'll encounter on forms.
TOPIC_RESULTS.de = TOPIC_RESULTS.en;
TOPIC_RESULTS.uk = TOPIC_RESULTS.en;
TOPIC_RESULTS.ar = TOPIC_RESULTS.en;
