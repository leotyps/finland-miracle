const elements = {
  foto: document.getElementById("foto"),
  choices: Array.from(document.querySelectorAll(".choice-btn")),
  correct: document.getElementById("correct"),
  incorrect: document.getElementById("incorrect")
};

const gameState = {
  quizData: [],
  currentQuestion: 0,
  correctCount: 0,
  incorrectCount: 0,
  quizCompletedFlag: false,
  quizResults: [],
  inactivityTimeout: null,
  totalQuestions: parseInt(localStorage.getItem("questionCount")) || 5
};

const imageCache = new Map();

async function preloadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const img = new Image();
  const loadPromise = new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

  img.src = src;
  imageCache.set(src, loadPromise);
  return loadPromise;
}


async function initializeQuiz() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("/data/quiz.json", {
      signal: controller.signal,
      cache: 'force-cache'
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    gameState.quizData = data;

    loadGameState();
    await prepareQuizData();
    attachEventListeners();
    loadQuestion();

  } catch (error) {
    console.error("Error initializing quiz:", error);
    showErrorMessage("Failed to load quiz. Please refresh the page.");
  }
}

async function prepareQuizData() {
  let duplicatedData = [];
  while (duplicatedData.length < gameState.totalQuestions) {
    duplicatedData = [...duplicatedData, ...gameState.quizData];
  }
  for (let i = duplicatedData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [duplicatedData[i], duplicatedData[j]] = [duplicatedData[j], duplicatedData[i]];
  }

  gameState.quizData = duplicatedData.slice(0, gameState.totalQuestions);

  await Promise.all(
    gameState.quizData.map(quiz => preloadImage(quiz.image))
  );
}

function loadQuestion() {
  if (gameState.currentQuestion >= gameState.totalQuestions) {
    quizCompleted();
    return;
  }

  const currentQuiz = gameState.quizData[gameState.currentQuestion];

  const cachedImage = imageCache.get(currentQuiz.image);
  if (cachedImage) {
    elements.foto.src = currentQuiz.image;
  }

  const choices = generateRandomChoices(currentQuiz.correctAnswer);
  elements.choices.forEach((btn, index) => {
    btn.textContent = choices[index];
  });

  resetInactivityTimer();
}

function generateRandomChoices(correctAnswer) {
  const uniqueAnswers = [...new Set(gameState.quizData.map(q => q.correctAnswer))];
  const choices = new Set();
  choices.add(correctAnswer);

  while (choices.size < 4) {
    const randomAnswer = uniqueAnswers[Math.floor(Math.random() * uniqueAnswers.length)];
    choices.add(randomAnswer);
  }

  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function checkAnswer(btn) {
  if (gameState.currentQuestion >= gameState.totalQuestions) return;

  const selectedAnswer = btn.textContent;
  const correctAnswer = gameState.quizData[gameState.currentQuestion].correctAnswer;

  gameState.quizResults.push({
    question: gameState.quizData[gameState.currentQuestion].image,
    answer: selectedAnswer,
    correct: selectedAnswer === correctAnswer
  });

  if (selectedAnswer === correctAnswer) {
    gameState.correctCount++;
  } else {
    gameState.incorrectCount++;
  }

  gameState.currentQuestion++;
  loadQuestion();
  updateScore();
  saveGameState();
}

function quizCompleted() {
  if (gameState.quizCompletedFlag) return;

  gameState.quizCompletedFlag = true;
  localStorage.setItem("quizResults", JSON.stringify(gameState.quizResults));
  clearGameState();
  window.location.href = "/guess/result";
}

function updateScore() {
  elements.correct.textContent = gameState.correctCount;
  elements.incorrect.textContent = gameState.incorrectCount;
}

function resetInactivityTimer() {
  clearTimeout(gameState.inactivityTimeout);
  gameState.inactivityTimeout = setTimeout(quizCompleted, 300000);
}

function attachEventListeners() {
  elements.choices.forEach(btn => {
    btn.addEventListener("click", handleChoice);
  });

  document.addEventListener("mousemove", debounce(resetInactivityTimer, 1000));
  document.addEventListener("keypress", debounce(resetInactivityTimer, 1000));
}

function handleChoice(event) {
  event.preventDefault();
  checkAnswer(this);
  resetInactivityTimer();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function saveGameState() {
  const state = {
    currentQuestion: gameState.currentQuestion,
    correctCount: gameState.correctCount,
    incorrectCount: gameState.incorrectCount
  };
  localStorage.setItem("gameState", JSON.stringify(state));
}

function loadGameState() {
  const savedState = JSON.parse(localStorage.getItem("gameState") || "{}");
  Object.assign(gameState, savedState);
  updateScore();
}

function clearGameState() {
  localStorage.removeItem("gameState");
}

function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
}

document.addEventListener("DOMContentLoaded", initializeQuiz);