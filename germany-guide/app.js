// ============ STATE ============
let currentLang = 'en';
let activeIndex = -1;
let filteredTopics = [];

// ============ DOM REFS ============
const searchInput = document.getElementById('search-input');
const suggestionsEl = document.getElementById('suggestions');
const clearBtn = document.getElementById('clear-btn');
const heroEl = document.querySelector('.hero');
const resultPanel = document.getElementById('result-panel');
const resultContent = document.getElementById('result-content');
const quickTagsEl = document.getElementById('quick-tags');
const backBtn = document.getElementById('back-btn');

// ============ LANGUAGE ============

function ui() { return UI[currentLang]; }

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update UI text
    document.getElementById('hero-title').textContent = ui().title;
    document.getElementById('hero-subtitle').textContent = ui().subtitle;
    searchInput.placeholder = ui().placeholder;
    document.getElementById('back-text').textContent = ui().back;
    document.getElementById('disclaimer-text').innerHTML = ui().disclaimer;

    // Update active lang button
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

    // Rebuild quick tags
    renderQuickTags();

    // Clear search state
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    suggestionsEl.classList.remove('visible');
    showHero();
}

// ============ SEARCH LOGIC ============

function search(query) {
    if (!query.trim()) {
        suggestionsEl.classList.remove('visible');
        filteredTopics = [];
        activeIndex = -1;
        return;
    }

    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);

    // Score each topic
    const scored = TOPICS.map(topic => {
        const keywords = topic.keywords[currentLang] || topic.keywords.en;
        let score = 0;

        for (const word of words) {
            for (const kw of keywords) {
                if (kw.toLowerCase().includes(word)) {
                    score += word.length / kw.length; // partial match scoring
                    if (kw.toLowerCase().startsWith(word)) score += 0.5; // prefix bonus
                    if (kw.toLowerCase() === word) score += 1; // exact bonus
                }
            }
            // Also match topic display name
            const name = (TOPIC_NAMES[currentLang] || TOPIC_NAMES.en)[topic.id];
            if (name && name.title.toLowerCase().includes(word)) score += 0.8;
        }

        return { topic, score };
    });

    // Filter and sort
    filteredTopics = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.topic);

    activeIndex = -1;
    renderSuggestions();
}

function renderSuggestions() {
    if (filteredTopics.length === 0) {
        suggestionsEl.innerHTML = `<div class="suggestion-item"><span class="s-text"><span class="s-title" style="opacity:0.5">${ui().noResults}</span></span></div>`;
        suggestionsEl.classList.add('visible');
        return;
    }

    suggestionsEl.innerHTML = filteredTopics.map((topic, i) => {
        const name = (TOPIC_NAMES[currentLang] || TOPIC_NAMES.en)[topic.id];
        return `
            <div class="suggestion-item${i === activeIndex ? ' active' : ''}" data-index="${i}">
                <span class="s-icon">${topic.icon}</span>
                <span class="s-text">
                    <span class="s-title">${name.title}</span>
                    <span class="s-desc">${name.desc}</span>
                </span>
                <span class="s-arrow">→</span>
            </div>`;
    }).join('');

    suggestionsEl.classList.add('visible');

    // Add click handlers
    suggestionsEl.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index);
            selectTopic(filteredTopics[idx]);
        });
    });
}

// ============ TOPIC DISPLAY ============

function selectTopic(topic) {
    suggestionsEl.classList.remove('visible');
    searchInput.blur();

    const name = (TOPIC_NAMES[currentLang] || TOPIC_NAMES.en)[topic.id];
    const steps = getTopicSteps(topic.id, currentLang);

    let html = `<div class="result-header"><h2>${topic.icon} ${name.title}</h2><p>${name.desc}</p></div>`;

    steps.forEach(step => {
        html += `
            <div class="step-card">
                <span class="step-badge">${step.badge}</span>
                <h3>${step.title}</h3>
                <div class="timing">⏰ ${step.timing}</div>
                <p>${step.desc}</p>
                <ul>${step.docs.map(d => `<li>${d}</li>`).join('')}</ul>
                ${step.tip ? `<div class="tip">💡 ${step.tip}</div>` : ''}
                ${step.warning ? `<div class="warning">⚠️ ${step.warning}</div>` : ''}
            </div>`;
    });

    resultContent.innerHTML = html;
    heroEl.classList.add('hidden');
    resultPanel.classList.remove('hidden');
    window.scrollTo({ top: 0 });
}

function showHero() {
    resultPanel.classList.add('hidden');
    heroEl.classList.remove('hidden');
}

// ============ QUICK TAGS ============

function renderQuickTags() {
    quickTagsEl.innerHTML = ui().quickTags
        .map(tag => `<button class="quick-tag">${tag}</button>`)
        .join('');

    quickTagsEl.querySelectorAll('.quick-tag').forEach(btn => {
        btn.addEventListener('click', () => {
            searchInput.value = btn.textContent;
            searchInput.focus();
            clearBtn.classList.remove('hidden');
            search(btn.textContent);
        });
    });
}

// ============ EVENT LISTENERS ============

// Search input
searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    clearBtn.classList.toggle('hidden', !val);
    search(val);
});

// Clear button
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    suggestionsEl.classList.remove('visible');
    searchInput.focus();
});

// Keyboard navigation
searchInput.addEventListener('keydown', (e) => {
    if (!suggestionsEl.classList.contains('visible')) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, filteredTopics.length - 1);
        renderSuggestions();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, -1);
        renderSuggestions();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && filteredTopics[activeIndex]) {
            selectTopic(filteredTopics[activeIndex]);
        } else if (filteredTopics.length > 0) {
            selectTopic(filteredTopics[0]);
        }
    } else if (e.key === 'Escape') {
        suggestionsEl.classList.remove('visible');
        searchInput.blur();
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        suggestionsEl.classList.remove('visible');
    }
});

// Focus shows suggestions if there's text
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) search(searchInput.value);
});

// Back button
backBtn.addEventListener('click', () => {
    showHero();
    searchInput.focus();
});

// Language buttons
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// ============ INIT ============
setLanguage('en');
searchInput.focus();
