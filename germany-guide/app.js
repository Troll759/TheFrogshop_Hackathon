// ============ STATE ============
let answers = {};
let currentStepId = 'start';
let currentLang = 'en';

const chatMessages = document.getElementById('chat-messages');
const inputArea = document.getElementById('input-area');

// ============ LANGUAGE SWITCHING ============

function t() { return TRANSLATIONS[currentLang]; }

function initLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLang) return;
            currentLang = lang;

            // Update active button
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update header
            document.getElementById('header-title').textContent = t().headerTitle;
            document.getElementById('header-subtitle').textContent = t().headerSubtitle;

            // Set RTL for Arabic
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

            // Restart conversation in new language
            restart();
        });
    });
}

// ============ MESSAGE HELPERS ============

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
}

function addBotMessage(text) {
    return new Promise(resolve => {
        const typingEl = document.createElement('div');
        typingEl.className = 'typing-indicator';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingEl);
        scrollToBottom();

        const delay = Math.min(400 + text.length * 5, 1000);
        setTimeout(() => {
            chatMessages.removeChild(typingEl);
            const msg = document.createElement('div');
            msg.className = 'message bot';
            msg.innerHTML = `
                <div class="msg-avatar">🇩🇪</div>
                <div class="bubble">${text}</div>
            `;
            chatMessages.appendChild(msg);
            scrollToBottom();
            resolve();
        }, delay);
    });
}

function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'message user';
    msg.innerHTML = `
        <div class="msg-avatar">👤</div>
        <div class="bubble">${text}</div>
    `;
    chatMessages.appendChild(msg);
    scrollToBottom();
}

function showOptions(options, moreOptions) {
    const group = document.createElement('div');
    group.className = 'options-group';
    const trans = t();

    options.forEach(opt => {
        const label = trans.options[opt.optKey] || { label: opt.optKey, sub: '' };
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
            <span class="opt-icon">${opt.icon}</span>
            <span class="opt-label">${label.label}${label.sub ? `<span class="opt-sub">${label.sub}</span>` : ''}</span>
        `;
        btn.addEventListener('click', () => selectOption(opt, label.label, group));
        group.appendChild(btn);
    });

    if (moreOptions && moreOptions.length > 0) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'show-more-btn';
        moreBtn.innerHTML = `<span>👁️</span> ${trans.showMore} (${moreOptions.length} ${trans.more})`;
        moreBtn.addEventListener('click', () => {
            moreBtn.remove();
            moreOptions.forEach(opt => {
                const label = trans.options[opt.optKey] || { label: opt.optKey, sub: '' };
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML = `
                    <span class="opt-icon">${opt.icon}</span>
                    <span class="opt-label">${label.label}${label.sub ? `<span class="opt-sub">${label.sub}</span>` : ''}</span>
                `;
                btn.addEventListener('click', () => selectOption(opt, label.label, group));
                group.appendChild(btn);
            });
            scrollToBottom();
        });
        group.appendChild(moreBtn);
    }

    chatMessages.appendChild(group);
    scrollToBottom();
}

// ============ FLOW CONTROL ============

async function selectOption(option, displayLabel, optionsGroup) {
    if (optionsGroup) optionsGroup.remove();
    addUserMessage(`${option.icon} ${displayLabel}`);

    // Store answer
    answers[currentStepId === 'start' ? 'origin' : currentStepId] = option.id;
    await advanceFlow();
}

async function advanceFlow() {
    const step = FLOW_STRUCTURE[currentStepId];
    let nextId = step.next;

    // Check skip rules
    if (nextId && nextId !== 'results' && FLOW_STRUCTURE[nextId].skipIf) {
        const skipRules = FLOW_STRUCTURE[nextId].skipIf;
        for (const [key, values] of Object.entries(skipRules)) {
            if (values.includes(answers[key])) {
                if (nextId === 'qualification') answers.qualification = 'none';
                if (nextId === 'purpose') answers.purpose = 'asylum';
                nextId = FLOW_STRUCTURE[nextId].next;
                break;
            }
        }
    }

    currentStepId = nextId;

    if (currentStepId === 'results') {
        await showResults();
    } else {
        await showStep(currentStepId);
    }
}

async function showStep(stepId) {
    const structure = FLOW_STRUCTURE[stepId];
    const flowText = t().flow[stepId];

    await addBotMessage(flowText.message);
    if (flowText.followUp) {
        await addBotMessage(flowText.followUp);
    }

    showOptions(structure.options, structure.moreOptions);
}

// ============ RESULTS ============

async function showResults() {
    const trans = t();
    await addBotMessage(trans.resultsIntro);

    const steps = generateResults(answers, currentLang);

    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        addResultCard(steps[i]);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    await addBotMessage(trans.resultsOutro);

    inputArea.innerHTML = `
        <button class="restart-btn" onclick="restart()">${trans.restart}</button>
        <p class="disclaimer">${trans.disclaimer}</p>
    `;
}

function addResultCard(step) {
    const card = document.createElement('div');
    card.className = 'message bot';
    card.style.maxWidth = '92%';

    let html = `
        <div class="result-card">
            <span class="step-badge">${step.number}</span>
            <h4>${step.title}</h4>
            <div class="timing">⏰ ${step.timing}</div>
            <p>${step.description}</p>
            <ul>${step.documents.map(d => `<li>${d}</li>`).join('')}</ul>
            ${step.tip ? `<div class="tip">💡 ${step.tip}</div>` : ''}
            ${step.warning ? `<div class="warning">⚠️ ${step.warning}</div>` : ''}
        </div>
    `;

    card.innerHTML = html;
    chatMessages.appendChild(card);
    scrollToBottom();
}

// ============ RESTART ============

function restart() {
    answers = {};
    currentStepId = 'start';
    chatMessages.innerHTML = '';
    inputArea.innerHTML = '';
    init();
}

// ============ INIT ============

async function init() {
    initLangSwitcher();
    document.getElementById('header-title').textContent = t().headerTitle;
    document.getElementById('header-subtitle').textContent = t().headerSubtitle;
    await showStep('start');
}

init();
