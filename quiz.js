const STORAGE_KEY = 'dwd.quiz.state';
const HISTORY_KEY = 'dwd.quiz.history';
const THEME_KEY = 'dwd.quiz.theme';
const COOLDOWN_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const questions = [
  {
    id: 'collab-style',
    dimension: 'collaboration',
    prompt: 'How do you prefer to solve thorny bugs?',
    helper: 'Signal the style that keeps you in flow.',
    options: [
      { label: 'Spin up a mob session', hint: 'Bandwidth beats latency', score: 3 },
      { label: 'Pair with one trusted partner', hint: 'Two cursors, one fix', score: 2 },
      { label: 'Solo deep dive, async updates later', hint: 'Silence + logs', score: 1 },
    ],
  },
  {
    id: 'tooling-stack',
    dimension: 'tooling',
    prompt: 'Pick the toolchain that feels like home.',
    helper: 'Your muscle memory belongs somewhere.',
    options: [
      { label: 'tmux + Neovim scripts', hint: 'Keyboard all the way', score: 3 },
      { label: 'JetBrains / VS Code tuned to perfection', hint: 'Plugins FTW', score: 2 },
      { label: 'Minimal IDE, focus on problem space', hint: 'Less noise, more signal', score: 1 },
    ],
  },
  {
    id: 'delivery-style',
    dimension: 'delivery',
    prompt: 'When shipping features, what’s your bias?',
    helper: 'Speed vs. polish.',
    options: [
      { label: 'Ship nightly, iterate live', hint: 'Continuous everything', score: 3 },
      { label: 'Balance: soft launches + alerts', hint: 'Trust but verify', score: 2 },
      { label: 'Craft obsessively, fewer releases', hint: 'Every pixel matters', score: 1 },
    ],
  },
  {
    id: 'learning-loop',
    dimension: 'growth',
    prompt: 'How do you upskill when new tech drops?',
    helper: 'What’s your education loop?',
    options: [
      { label: 'Prototype + break things', hint: 'Docs can wait', score: 3 },
      { label: 'Read/docs + try sample project', hint: 'Layered learning', score: 2 },
      { label: 'Take a structured course', hint: 'Curriculum first', score: 1 },
    ],
  },
];

const profiles = {
  collaboration: {
    name: 'Pair Programming Catalyst',
    summary: 'Energized by synchronous debugging and quick signal boosts.',
    strengths: [
      'Spins up live pairing rooms to unblock complex issues.',
      'Translates fuzzy ideas into concrete next steps for squads.',
      'Keeps communication latency low across channels.',
    ],
    actions: [
      'Host a weekly live debug jam with high-signal matches.',
      'Filter matches for ops-focused partners to balance speed vs. safety.',
      'Share your pairing availability in profile highlights.',
    ],
    matchHint: 'Thrives when matched with release-minded pilots who offer guardrails.',
    idealPartners: ['delivery', 'tooling'],
    stretchPartners: ['growth'],
  },
  tooling: {
    name: 'Terminal Tactician',
    summary: 'Lives in dotfiles, bending the shell to every whim.',
    strengths: [
      'Automates repetitive workflows for everyone in the room.',
      'Optimizes environments for fast feedback and low friction.',
      'Evangelizes keyboard-first shortcuts that keep momentum up.',
    ],
    actions: [
      'Swap setup scripts with makers who crave tighter loops.',
      'Add a snippet of your dotfiles to your profile portfolio.',
      'Pair with a growth-focused dev to co-build onboarding macros.',
    ],
    matchHint: 'Pairs best with curiosity-heavy builders who stress-test tools.',
    idealPartners: ['growth', 'collaboration'],
    stretchPartners: ['delivery'],
  },
  delivery: {
    name: 'Velocity Pilot',
    summary: 'Ships fast, guards quality with telemetry and rapid rollback plans.',
    strengths: [
      'Defines crisp release cadences the squad can trust.',
      'Instrumentalizes features with observability from day one.',
      'Stays calm under hotfix pressure, balancing polish vs. speed.',
    ],
    actions: [
      'Spin up a co-release ritual with collaborators who love automation.',
      'Highlight your telemetry stack in conversations for instant alignment.',
      'Invite matches to shadow a launch window to feel the cadence.',
    ],
    matchHint: 'Looks for collaborators who bring experimentation energy.',
    idealPartners: ['collaboration', 'growth'],
    stretchPartners: ['tooling'],
  },
  growth: {
    name: 'Curiosity Cartographer',
    summary: 'Maps new domains through experiments and deliberate reflection.',
    strengths: [
      'Turns nebulous tech into digestible learning paths.',
      'Documents insights so others can level up faster.',
      'Brings calm focus to nascent problem spaces.',
    ],
    actions: [
      'Co-host exploratory spikes with terminal tacticians for rapid protos.',
      'Share your latest learning loop in profile notes.',
      'Flag preferred collaboration windows to attract complementary partners.',
    ],
    matchHint: 'Complements operators who anchor releases and tooling.',
    idealPartners: ['tooling', 'delivery'],
    stretchPartners: ['collaboration'],
  },
};

const matchCandidates = [
  {
    id: 'ava-ops',
    name: 'Ava Singh',
    role: 'Platform Reliability Lead',
    dimension: 'delivery',
    location: 'Remote • UTC-3',
    vibe: 'Nightly deploy cadence with tight telemetry loops',
  },
  {
    id: 'mika-labs',
    name: 'Mika Ito',
    role: 'R&D Prototype Engineer',
    dimension: 'growth',
    location: 'Tokyo • UTC+9',
    vibe: 'Spins up lab notebooks + async walkthroughs',
  },
  {
    id: 'leo-cli',
    name: 'Leo Ortega',
    role: 'DX Automation Specialist',
    dimension: 'tooling',
    location: 'Austin • UTC-5',
    vibe: 'Ships CLI add-ons that remove toil',
  },
  {
    id: 'sara-sync',
    name: 'Sara Mensah',
    role: 'Pairing Facilitator',
    dimension: 'collaboration',
    location: 'Berlin • UTC+1',
    vibe: 'Hosts weekly live-bug clinics across time zones',
  },
];

const baseIntroNarrative =
  'This quick scan maps how you build, ship, and collaborate so we can pair you with devs who boost your flow instead of slowing it down.';

const dom = {
  themeToggle: document.getElementById('themeToggle'),
  introScreen: document.getElementById('introScreen'),
  quizScreen: document.getElementById('quizScreen'),
  resultScreen: document.getElementById('resultScreen'),
  introNarrative: document.getElementById('introNarrative'),
  etaBadge: document.getElementById('etaBadge'),
  freshnessBadge: document.getElementById('freshnessBadge'),
  questionPrompt: document.getElementById('questionPrompt'),
  questionHelper: document.getElementById('questionHelper'),
  optionsContainer: document.getElementById('optionsContainer'),
  progressCount: document.getElementById('progressCount'),
  progressPercent: document.getElementById('progressPercent'),
  progressBar: document.getElementById('progressBar'),
  cooldownMessage: document.getElementById('cooldownMessage'),
  historyPanel: document.getElementById('historyPanel'),
  historyList: document.getElementById('historyList'),
  personalityType: document.getElementById('personalityType'),
  personalitySummary: document.getElementById('personalitySummary'),
  resultTimestamp: document.getElementById('resultTimestamp'),
  strengthsList: document.getElementById('strengthsList'),
  actionsList: document.getElementById('actionsList'),
  matchPanel: document.getElementById('matchPanel'),
  matchGrid: document.getElementById('matchGrid'),
  compatibilityHint: document.getElementById('compatibilityHint'),
  primerModal: document.getElementById('primerModal'),
  buttons: {
    start: document.getElementById('startQuiz'),
    next: document.getElementById('nextBtn'),
    prev: document.getElementById('prevBtn'),
    retake: document.getElementById('retakeBtn'),
    history: document.getElementById('viewHistory'),
    skip: document.getElementById('skipIntro'),
    learnMore: document.getElementById('learnMore'),
    closePrimer: document.getElementById('closePrimer'),
    viewMatches: document.getElementById('viewMatches'),
    share: document.getElementById('shareBtn'),
  },
};

const typeToDimension = Object.entries(profiles).reduce((acc, [dimension, profile]) => {
  acc[profile.name] = dimension;
  return acc;
}, {});

const analytics = {
  events: [],
  track(event, payload = {}) {
    const entry = { event, payload, ts: Date.now() };
    this.events.push(entry);
    console.info('[analytics]', event, payload);
  },
};

let quizState = createFreshState();

function createFreshState() {
  return {
    startedAt: Date.now(),
    currentIndex: 0,
    answers: {},
    completed: false,
    result: null,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshState();
    const parsed = JSON.parse(raw);
    return { ...createFreshState(), ...parsed };
  } catch {
    return createFreshState();
  }
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizState));
  } catch {
    // storage might be unavailable; ignore to keep UX flowing
  }
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function persistHistory(entries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

function getLastAttempt() {
  const history = loadHistory();
  return history[0];
}

function withinCooldown() {
  const last = getLastAttempt();
  if (!last) return false;
  const elapsed = Date.now() - last.completedAt;
  return elapsed < COOLDOWN_DAYS * MS_PER_DAY;
}

function updateCooldownMessage() {
  const last = getLastAttempt();
  if (!last) {
    dom.cooldownMessage.textContent = '';
    return;
  }
  const remaining = Math.max(
    0,
    COOLDOWN_DAYS * MS_PER_DAY - (Date.now() - last.completedAt),
  );
  if (remaining <= 0) {
    dom.cooldownMessage.textContent = 'Ready for a new scan. Cooldown clear.';
    dom.cooldownMessage.style.color = 'var(--accent)';
    return;
  }
  const days = Math.ceil(remaining / MS_PER_DAY);
  dom.cooldownMessage.textContent = `Retake unlocks in ~${days} day${
    days === 1 ? '' : 's'
  }.`;
  dom.cooldownMessage.style.color = 'var(--danger)';
}

function refreshIntroContext() {
  const last = getLastAttempt();
  dom.etaBadge.textContent = `≈2 min · ${questions.length} prompts`;
  if (!last) {
    dom.freshnessBadge.textContent = 'Awaiting first scan';
    dom.introNarrative.textContent = baseIntroNarrative;
    return;
  }
  const dimension = last.dimension || inferDimensionFromType(last.type);
  const rel = formatRelativeTime(last.completedAt);
  dom.freshnessBadge.textContent = `Updated ${rel}`;
  const profile = profiles[dimension];
  if (profile) {
    dom.introNarrative.textContent = `Last scan tagged you as ${last.type}. We now bias matches toward collaborators who ${profile.matchHint.toLowerCase()}.`;
  }
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'just now';
  const diff = Date.now() - timestamp;
  if (diff < 0) return 'just now';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function inferDimensionFromType(type) {
  if (!type) return 'collaboration';
  return typeToDimension[type] || 'collaboration';
}

function normalizeResult(raw) {
  if (!raw) return null;
  if (raw.dominantDimension) return raw;
  const dominantDimension = raw.dimension || inferDimensionFromType(raw.type);
  return { ...raw, dominantDimension };
}

function getProfile(result) {
  if (!result) return null;
  const dimension = result.dominantDimension || inferDimensionFromType(result.type);
  return profiles[dimension];
}

function renderStrengths(result) {
  dom.strengthsList.innerHTML = '';
  const profile = getProfile(result);
  if (!profile?.strengths) return;
  profile.strengths.forEach((strength) => {
    const li = document.createElement('li');
    li.textContent = strength;
    dom.strengthsList.appendChild(li);
  });
}

function renderActions(result) {
  dom.actionsList.innerHTML = '';
  const profile = getProfile(result);
  if (!profile?.actions) return;
  profile.actions.forEach((action) => {
    const li = document.createElement('li');
    li.textContent = action;
    dom.actionsList.appendChild(li);
  });
}

function renderCompatibility(result) {
  const profile = getProfile(result);
  if (!profile) {
    dom.compatibilityHint.classList.add('hidden');
    dom.compatibilityHint.textContent = '';
    return;
  }
  const partnerNames = (profile.idealPartners || [])
    .map((key) => profiles[key]?.name || key)
    .filter(Boolean);
  dom.compatibilityHint.textContent = `${profile.matchHint}${
    partnerNames.length ? ` Ideal partners: ${partnerNames.join(', ')}.` : ''
  }`;
  dom.compatibilityHint.classList.remove('hidden');
}

function scoreMatch(userDimension, candidateDimension) {
  let score = 48;
  const profile = profiles[userDimension];
  if (!profile) return score;
  if (candidateDimension === userDimension) {
    score += 12;
  }
  if (profile.idealPartners?.includes(candidateDimension)) {
    score += 35;
  }
  if (profile.stretchPartners?.includes(candidateDimension)) {
    score -= 8;
  }
  return Math.min(99, Math.max(40, score));
}

function renderMatches(result) {
  const normalized = normalizeResult(result);
  if (!normalized) {
    dom.matchPanel.classList.add('hidden');
    dom.matchGrid.innerHTML = '';
    return;
  }
  const userDimension = normalized.dominantDimension;
  const ranked = matchCandidates
    .map((candidate) => ({
      ...candidate,
      score: scoreMatch(userDimension, candidate.dimension) + Math.random() * 4,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (!ranked.length) {
    dom.matchPanel.classList.add('hidden');
    dom.matchGrid.innerHTML = '';
    return;
  }
  dom.matchPanel.classList.remove('hidden');
  dom.matchGrid.innerHTML = '';
  ranked.forEach((candidate) => {
    const card = document.createElement('article');
    card.className = 'match-card';
    const name = document.createElement('h4');
    name.textContent = candidate.name;
    const role = document.createElement('p');
    role.textContent = `${candidate.role} • ${candidate.location}`;
    const vibe = document.createElement('p');
    vibe.textContent = candidate.vibe;
    const compat = document.createElement('p');
    compat.className = 'compat-score';
    compat.textContent = `${Math.round(candidate.score)}% sync — ${profiles[candidate.dimension]?.name || candidate.dimension}`;
    card.append(name, role, vibe, compat);
    dom.matchGrid.appendChild(card);
  });
}

function refreshMatches(result, source = 'auto') {
  renderMatches(result);
  const dimension =
    result?.dominantDimension || (result?.type ? inferDimensionFromType(result.type) : undefined);
  analytics.track(
    source === 'manual' ? 'matches_refresh' : 'matches_ready',
    dimension ? { dimension } : {},
  );
}

async function handleShare() {
  if (!dom.buttons.share) return;
  const result = normalizeResult(quizState.result || getLastAttempt());
  if (!result) return;
  const text = `DateWithDev scanned me as ${result.type} (${result.summary}). Up for a pairing session?`;
  analytics.track('share_attempt', { dimension: result.dominantDimension });
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Dev Personality Result', text });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    dom.buttons.share.textContent = 'shared ✓';
    analytics.track('share_success', { method: navigator.share ? 'web-share' : 'clipboard' });
    setTimeout(() => {
      dom.buttons.share.textContent = 'share_signal.sh';
    }, 2200);
  } catch (error) {
    analytics.track('share_error', { message: error?.message });
    dom.buttons.share.textContent = 'share_signal.sh';
  }
}

function handleSkipIntro() {
  const history = loadHistory();
  analytics.track('intro_skip', {
    hasProgress: Boolean(Object.keys(quizState.answers).length),
    hasHistory: Boolean(history.length),
  });
  if (quizState.completed && quizState.result) {
    showResult(quizState.result);
    return;
  }
  if (Object.keys(quizState.answers).length) {
    showScreen('quiz');
    renderQuestion();
    updateNavigationState();
    return;
  }
  if (history.length) {
    const latest = normalizeResult({
      ...history[0],
      dimension: history[0].dimension,
      summary: history[0].summary,
    });
    if (latest) {
      showResult(latest);
      return;
    }
  }
  startQuiz();
}

function openPrimer() {
  dom.primerModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  analytics.track('primer_opened');
}

function closePrimer() {
  dom.primerModal.classList.add('hidden');
  document.body.style.overflow = '';
  analytics.track('primer_closed');
}

function startQuiz() {
  if (withinCooldown()) {
    dom.cooldownMessage.textContent =
      'Cooldown active. Come back later or finish reviewing history.';
    return;
  }
  quizState = createFreshState();
  persistState();
  analytics.track('quiz_start', { questionCount: questions.length });
  showScreen('quiz');
  renderQuestion();
  updateNavigationState();
}

function resumeIfNeeded() {
  quizState = loadState();
  refreshIntroContext();
  if (quizState.completed) {
    showResult(quizState.result);
  } else if (Object.keys(quizState.answers).length) {
    showScreen('quiz');
    renderQuestion();
    updateNavigationState();
  } else {
    showScreen('intro');
  }
}

function showScreen(name) {
  dom.introScreen.classList.toggle('hidden', name !== 'intro');
  dom.quizScreen.classList.toggle('hidden', name !== 'quiz');
  dom.resultScreen.classList.toggle('hidden', name !== 'result');
}

function renderQuestion() {
  const question = questions[quizState.currentIndex];
  if (!question) return;
  dom.questionPrompt.textContent = question.prompt;
  dom.questionHelper.textContent = question.helper;
  const selectedScore = quizState.answers[question.id];
  dom.optionsContainer.innerHTML = '';

  question.options.forEach((option, idx) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    button.dataset.index = idx;
    button.dataset.selected = selectedScore === option.score;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', selectedScore === option.score);
    button.setAttribute('tabindex', idx === 0 ? '0' : '-1');
    button.addEventListener('click', () => handleSelect(option.score));

    const textWrap = document.createElement('div');
    const label = document.createElement('p');
    label.className = 'option-label';
    label.textContent = option.label;
    const hint = document.createElement('p');
    hint.className = 'option-hint';
    hint.textContent = option.hint;
    textWrap.append(label, hint);

    const key = document.createElement('span');
    key.className = 'option-key';
    key.textContent = `[${idx + 1}]`;

    button.append(textWrap, key);
    dom.optionsContainer.appendChild(button);
  });

  const pct = Math.round(((quizState.currentIndex + 1) / questions.length) * 100);
  dom.progressCount.textContent = `Q${quizState.currentIndex + 1}/${questions.length}`;
  dom.progressPercent.textContent = `${pct}%`;
  dom.progressBar.style.width = `${pct}%`;
}

function handleSelect(score) {
  const question = questions[quizState.currentIndex];
  quizState.answers[question.id] = score;
  persistState();
  analytics.track('quiz_answer', { questionId: question.id, score });
  renderQuestion();
  const autoAdvance = quizState.currentIndex < questions.length - 1;
  if (autoAdvance) {
    setTimeout(() => {
      quizState.currentIndex += 1;
      renderQuestion();
      updateNavigationState();
    }, 180);
  } else {
    dom.buttons.next.focus();
  }
}

function updateNavigationState() {
  dom.buttons.prev.disabled = quizState.currentIndex === 0;
  const answeredCount = Object.keys(quizState.answers).length;
  const readyToSubmit = answeredCount === questions.length;
  dom.buttons.next.textContent = readyToSubmit ? 'compile →' : 'next →';
}

function go(direction) {
  const nextIndex = quizState.currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= questions.length) return;
  quizState.currentIndex = nextIndex;
  renderQuestion();
  updateNavigationState();
  persistState();
}

function submitQuiz() {
  if (Object.keys(quizState.answers).length !== questions.length) return;
  const result = computePersonality(quizState.answers);
  quizState.completed = true;
  quizState.result = result;
  persistState();
  appendHistory(result);
  showResult(result);
  updateCooldownMessage();
  refreshIntroContext();
  analytics.track('quiz_submit', {
    type: result.type,
    dimension: result.dominantDimension,
  });
}

function appendHistory(result) {
  const next = [
    {
      id: crypto.randomUUID(),
      completedAt: result.completedAt,
      type: result.type,
      summary: result.summary,
      dimension: result.dominantDimension,
    },
    ...loadHistory(),
  ].slice(0, 10);
  persistHistory(next);
}

function showResult(rawResult) {
  const result = normalizeResult(rawResult);
  if (!result) return;
  quizState.result = result;
  showScreen('result');
  dom.personalityType.textContent = result.type;
  dom.personalitySummary.textContent = result.summary;
  dom.resultTimestamp.textContent = `Updated ${new Date(result.completedAt).toLocaleString()}`;
  renderStrengths(result);
  renderActions(result);
  renderCompatibility(result);
  refreshMatches(result, 'auto');
  renderHistory();
}

function computePersonality(answers) {
  const totals = {
    collaboration: 0,
    tooling: 0,
    delivery: 0,
    growth: 0,
  };
  questions.forEach((q) => {
    totals[q.dimension] += answers[q.id] || 0;
  });
  const [dominantKey] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const profile = profiles[dominantKey] || profiles.collaboration;
  return {
    type: profile.name,
    summary: profile.summary,
    completedAt: Date.now(),
    totals,
    dominantDimension: dominantKey,
  };
}

function renderHistory() {
  const history = loadHistory();
  if (!history.length) {
    dom.historyPanel.classList.add('hidden');
    return;
  }
  dom.historyPanel.classList.remove('hidden');
  dom.historyList.innerHTML = '';
  history.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `
      <span>${entry.type}</span>
      <span>${new Date(entry.completedAt).toLocaleDateString()}</span>
    `;
    dom.historyList.appendChild(item);
  });
}

function toggleHistoryPanel() {
  dom.historyPanel.classList.toggle('hidden');
  if (!dom.historyPanel.classList.contains('hidden')) {
    renderHistory();
  }
}

function handleNext() {
  const answeredCount = Object.keys(quizState.answers).length;
  if (answeredCount === questions.length && quizState.currentIndex === questions.length - 1) {
    submitQuiz();
  } else {
    go(1);
  }
}

function handleThemeToggle() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  dom.themeToggle.textContent = next === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // ignore
  }
}

function hydrateTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
    dom.themeToggle.textContent = stored === 'dark' ? 'light' : 'dark';
    return;
  }
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = prefersLight ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  dom.themeToggle.textContent = theme === 'dark' ? 'light' : 'dark';
}

function handleRetake() {
  const canRetake = !withinCooldown();
  analytics.track('retake_requested', { allowed: canRetake });
  if (!canRetake) {
    dom.cooldownMessage.textContent = 'Cooldown still active. Retake disabled.';
    showScreen('intro');
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  quizState = createFreshState();
  persistState();
  refreshIntroContext();
  showScreen('intro');
}

function registerHotkeys() {
  document.addEventListener('keydown', (event) => {
    if (!dom.primerModal.classList.contains('hidden')) {
      if (event.key === 'Escape') {
        closePrimer();
      }
      return;
    }
    if (dom.quizScreen.classList.contains('hidden')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (/^[1-9]$/.test(event.key)) {
      const optionIndex = Number(event.key) - 1;
      const question = questions[quizState.currentIndex];
      const option = question?.options[optionIndex];
      if (option) {
        handleSelect(option.score);
      }
    } else if (event.key.toLowerCase() === 'enter') {
      handleNext();
    }
  });
}

function init() {
  hydrateTheme();
  updateCooldownMessage();
  refreshIntroContext();
  analytics.track('intro_viewed', { hasHistory: Boolean(getLastAttempt()) });
  dom.buttons.start.addEventListener('click', startQuiz);
  dom.buttons.history.addEventListener('click', toggleHistoryPanel);
  dom.buttons.next.addEventListener('click', handleNext);
  dom.buttons.prev.addEventListener('click', () => go(-1));
  dom.buttons.retake.addEventListener('click', handleRetake);
  dom.themeToggle.addEventListener('click', handleThemeToggle);
  dom.buttons.skip?.addEventListener('click', handleSkipIntro);
  dom.buttons.learnMore?.addEventListener('click', openPrimer);
  dom.buttons.closePrimer?.addEventListener('click', closePrimer);
  dom.buttons.viewMatches?.addEventListener('click', () => {
    const baseline = quizState.result || normalizeResult(getLastAttempt());
    if (!baseline) return;
    refreshMatches(baseline, 'manual');
  });
  dom.buttons.share?.addEventListener('click', handleShare);
  dom.primerModal.addEventListener('click', (event) => {
    if (event.target === dom.primerModal) {
      closePrimer();
    }
  });
  dom.resultScreen.addEventListener('transitionend', renderHistory);
  registerHotkeys();
  resumeIfNeeded();
}

document.addEventListener('DOMContentLoaded', init);

