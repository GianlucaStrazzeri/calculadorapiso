// Simple localStorage wrapper for training planner
const KEY = 'training_planner_sessions_v1';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed reading training storage', e);
    return [];
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed writing training storage', e);
  }
}

export function listSessions() {
  return read();
}

export function saveSession(session) {
  const data = read();
  const idx = data.findIndex((s) => s.id === session.id);
  if (idx >= 0) data[idx] = session;
  else data.push(session);
  write(data);
}

export function removeSession(id) {
  const data = read().filter((s) => s.id !== id);
  write(data);
}

export function addFeedback(sessionId, feedback) {
  const data = read();
  const s = data.find((x) => x.id === sessionId);
  if (!s) return;
  s.feedback = s.feedback || [];
  s.feedback.push({ ...feedback, createdAt: new Date().toISOString() });
  write(data);
}

export function createSessionDraft(overrides = {}) {
  return {
    id: 'sess_' + Date.now(),
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    exercises: [],
    objectives: '',
    expectedLoad: 0,
    notes: '',
    completed: false,
    feedback: [],
    ...overrides,
  };
}

export default { listSessions, saveSession, removeSession, addFeedback, createSessionDraft };
