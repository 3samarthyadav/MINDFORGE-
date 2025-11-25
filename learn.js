// ---------------- QUESTION SYSTEM (Google Sheet version) ----------------
let questions = [];
let currentQuestionIndex = 0;
let currentDifficulty = "Easy";
let elapsedSeconds = 0;
let hasStartedTyping = false;
let stopwatchInterval = null;

// Utility to safely get element by ID
function safeGet(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`⚠️ Element with id "${id}" not found`);
  return el;
}

// Load questions from Google Sheet (CSV link)
async function loadQuestionsFromSheet() {
  try {
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZzlocCvau4SZmXJ9DVvSzeuy7KUqte51hVVwv5vobxLYbWrISc2dRlIcS3WDjGQk3h7pSAiXdDIXP/pub?output=csv";
    const res = await fetch(sheetURL);
    const csvText = await res.text();
    const lines = csvText.split("\n").filter(line => line.trim() !== "");
    const headers = lines[0].split(",").map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ? values[i].trim() : "";
      });
      return obj;
    });
    questions = data;
    console.log("🔥 Loaded questions from sheet:", questions);
    renderQuestion(currentQuestionIndex);
  } catch (err) {
    console.error("❌ Error loading questions from sheet:", err);
    const titleEl = safeGet("question-title");
    if (titleEl) titleEl.textContent = "Error loading questions";
  }
}

// Render a question by index
function renderQuestion(index) {
  if (!questions[index]) {
    console.warn("⚠️ No question at index", index);
    return;
  }
  const q = questions[index];
  currentDifficulty = q.difficulty || "Easy";

  const titleEl = safeGet("question-title");
  const descEl = safeGet("question-desc");
  const inputEl = safeGet("question-input");
  const outputEl = safeGet("question-output");
  const editorEl = safeGet("code-editor");
  const stopwatchEl = safeGet("stopwatch");

  if (titleEl) titleEl.textContent = q.title || "Untitled Question";
  if (descEl) descEl.textContent = q.description || "No description available";
  if (inputEl) inputEl.textContent = q.input || "No input example";
  if (outputEl) outputEl.textContent = q.output || "No expected output";

  if (editorEl) editorEl.value = "";

  elapsedSeconds = 0;
  hasStartedTyping = false;
  if (stopwatchEl) stopwatchEl.textContent = "00:00:00";

  if (stopwatchInterval) clearInterval(stopwatchInterval);
  stopwatchInterval = null;
}

// Stopwatch utilities
function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2,"0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2,"0");
  const s = String(sec % 60).padStart(2,"0");
  return `${h}:${m}:${s}`;
}
function updateStopwatch() {
  elapsedSeconds++;
  const stopwatchEl = safeGet("stopwatch");
  if (stopwatchEl) stopwatchEl.textContent = formatTime(elapsedSeconds);
}
function startStopwatch() {
  if (!hasStartedTyping) {
    stopwatchInterval = setInterval(updateStopwatch, 1000);
    hasStartedTyping = true;
  }
}
const editorEl = safeGet("code-editor");
if (editorEl) editorEl.addEventListener("input", startStopwatch);

// Error panel
function showError(type, msg) {
  const errorEl = safeGet("error-output");
  if (errorEl) errorEl.textContent = `${type} Error:\n${msg}`;
}
function clearErrors() {
  const errorEl = safeGet("error-output");
  if (errorEl) errorEl.textContent = "No errors yet.";
}

// Run & Submit buttons (assuming you added them)
const runBtn = safeGet("run-btn");
const submitBtn = safeGet("submit-btn");

if (runBtn) {
  runBtn.addEventListener("click", () => {
    clearErrors();
    const code = editorEl ? editorEl.value : "";
    const outputEl = safeGet("code-output");
    try {
      const result = eval(code);
      if (outputEl) outputEl.innerText = result ?? "No output";
    } catch (err) {
      showError("Runtime", err.message);
      if (outputEl) outputEl.innerText = "Error: " + err.message;
    }
  });
}
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    clearErrors();
    const code = editorEl ? editorEl.value : "";
    const result = fakeJudge(code);
    if (result.error) {
      showError(result.type, result.message);
      return;
    }
    // No firestore scoring in this version
    loadNextQuestion();
  });
}
function fakeJudge(code) {
  if (code.includes("error")) return { error: true, type: "Runtime", message: "Simulated runtime error." };
  return { error: false };
}
function loadNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions.length) {
    alert("🎉 No more questions!");
    return;
  }
  renderQuestion(currentQuestionIndex);
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  loadQuestionsFromSheet();
});
