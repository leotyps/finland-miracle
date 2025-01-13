const quizData = [];
let currentQuestion = 0;
let correctCount = 0;
let incorrectCount = 0;
let quizCompletedFlag = false;
let quizResults = [];
let inactivityTimeout;
let questionTimer;
let timeLeft = 15;

fetch("/data/quiz.json")
  .then((response) => response.json())
  .then((data) => {
    quizData.push(...data);

    const shuffledData = [...quizData].sort(() => Math.random() - 0.5);
    quizData.length = 0;
    quizData.push(...shuffledData);

    initializeQuiz();
  })
  .catch((error) => console.error("Error fetching quiz data:", error));

function initializeQuiz() {
  loadGameState();
  let totalQuestions = parseInt(localStorage.getItem("questionCount")) || 5;

  let gameQuestions = [];
  if (totalQuestions >= quizData.length) {
    gameQuestions = [...quizData].sort(() => Math.random() - 0.5);
  } else {
    const shuffled = [...quizData].sort(() => Math.random() - 0.5);
    gameQuestions = shuffled.slice(0, totalQuestions);
  }

  const fotoElement = document.getElementById("foto");
  const choicesElements = document.querySelectorAll(".choice-btn");
  const correctSpan = document.getElementById("correct");
  const incorrectSpan = document.getElementById("incorrect");

  function updateTimer() {
    const timerDisplay = document.getElementById("timer");
    timerDisplay.textContent = `Time left: ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(questionTimer);
      incorrectCount++;
      currentQuestion++;
      timeLeft = 15;
      loadQuestion();
      updateScore();
      saveGameState();
    }
  }

  function startTimer() {
    clearInterval(questionTimer);
    timeLeft = 15;
    updateTimer();
    questionTimer = setInterval(() => {
      timeLeft--;
      updateTimer();
    }, 1000);
  }

  async function loadQuestion() {
    if (currentQuestion < gameQuestions.length) {
      const currentQuiz = gameQuestions[currentQuestion];

      fotoElement.style.backgroundColor = "#f0f0f0"; // Placeholder while loading
      fotoElement.src = ""; // Clear existing image

      try {
        // Preload the image
        const img = await preloadImage(currentQuiz.image);
        fotoElement.style.backgroundColor = "transparent";
        fotoElement.src = img.src;
      } catch (error) {
        console.error("Failed to load image:", error);
        fotoElement.style.backgroundColor = "#f0f0f0"; // Fallback placeholder
      }

      const otherAnswers = quizData
        .filter((q) => q.correctAnswer !== currentQuiz.correctAnswer)
        .map((q) => q.correctAnswer);

      const wrongAnswers = [...new Set(otherAnswers)]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const choices = [...wrongAnswers, currentQuiz.correctAnswer].sort(
        () => Math.random() - 0.5
      );

      choicesElements.forEach((btn, index) => {
        btn.textContent = choices[index];
      });

      startTimer();
      resetInactivityTimer();
    } else {
      quizCompleted();
    }
  }

  function preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  function checkAnswer(btn) {
    if (currentQuestion < gameQuestions.length) {
      clearInterval(questionTimer);

      const selectedAnswer = btn.textContent;
      const correctAnswer = gameQuestions[currentQuestion].correctAnswer;

      quizResults.push({
        question: gameQuestions[currentQuestion].image,
        answer: selectedAnswer,
        correct: selectedAnswer === correctAnswer,
      });

      if (selectedAnswer === correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      currentQuestion++;
      timeLeft = 15;
      loadQuestion();
      updateScore();
      saveGameState();
    } else {
      quizCompleted();
    }
  }

  function quizCompleted() {
    if (quizCompletedFlag) return;
    quizCompletedFlag = true;

    clearInterval(questionTimer);
    resetQuiz();
    localStorage.setItem("quizResults", JSON.stringify(quizResults));
    localStorage.removeItem("currentQuestion");
    localStorage.removeItem("correctCount");
    localStorage.removeItem("incorrectCount");
    window.location.href = "/guess/result";
  }

  function updateScore() {
    correctSpan.textContent = correctCount;
    incorrectSpan.textContent = incorrectCount;
  }

  function resetQuiz() {
    currentQuestion = 0;
    correctCount = 0;
    incorrectCount = 0;
    timeLeft = 15;
    updateScore();
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(quizCompleted, 300000); // 5 minutes
  }

  choicesElements.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      checkAnswer(btn);
      resetInactivityTimer();
    });
  });

  loadQuestion();
}

function saveGameState() {
  localStorage.setItem("currentQuestion", currentQuestion);
  localStorage.setItem("correctCount", correctCount);
  localStorage.setItem("incorrectCount", incorrectCount);
}

function loadGameState() {
  currentQuestion = parseInt(localStorage.getItem("currentQuestion")) || 0;
  correctCount = parseInt(localStorage.getItem("correctCount")) || 0;
  incorrectCount = parseInt(localStorage.getItem("incorrectCount")) || 0;
}
