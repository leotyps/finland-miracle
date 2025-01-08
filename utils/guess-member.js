const quizData = [];

fetch("/data/quiz.json")
  .then((response) => response.json())
  .then((data) => {
    quizData.push(...data);
    initializeQuiz();
  })
  .catch((error) => console.error("Error fetching quiz data:", error));

let currentQuestion = 0;
let correctCount = 0;
let incorrectCount = 0;
let quizCompletedFlag = false;
let quizResults = [];
let inactivityTimeout;

function initializeQuiz() {
  loadGameState();
  let totalQuestions = parseInt(localStorage.getItem("questionCount")) || 5;

  let duplicatedQuizData = [];
  while (duplicatedQuizData.length < totalQuestions) {
    duplicatedQuizData = [...duplicatedQuizData, ...quizData];
  }

  for (let i = duplicatedQuizData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [duplicatedQuizData[i], duplicatedQuizData[j]] = [
      duplicatedQuizData[j],
      duplicatedQuizData[i],
    ];
  }

  duplicatedQuizData = duplicatedQuizData.slice(0, totalQuestions);

  const fotoElement = document.getElementById("foto");
  const choicesElements = document.querySelectorAll(".choice-btn");
  const correctSpan = document.getElementById("correct");
  const incorrectSpan = document.getElementById("incorrect");

  loadQuestion();

  function loadQuestion() {
    if (currentQuestion < totalQuestions) {
      const currentQuiz = duplicatedQuizData[currentQuestion];
      fotoElement.src = currentQuiz.image;
      const choices = generateRandomChoices(currentQuiz.correctAnswer);
      choicesElements.forEach((btn, index) => {
        btn.textContent = choices[index];
      });
      resetInactivityTimer();
    } else {
      quizCompleted();
    }
  }

  function generateRandomChoices(correctAnswer) {
    const choices = [];
    const answers = [...new Set(quizData.map((q) => q.correctAnswer))];

    while (choices.length < 4) {
      const randomChoice = answers[Math.floor(Math.random() * answers.length)];
      if (!choices.includes(randomChoice)) {
        choices.push(randomChoice);
      }
    }

    if (!choices.includes(correctAnswer)) {
      const randomIndex = Math.floor(Math.random() * choices.length);
      choices[randomIndex] = correctAnswer;
    }

    return choices.sort(() => Math.random() - 0.5);
  }

  function checkAnswer(btn) {
    if (currentQuestion < totalQuestions) {
      const selectedAnswer = btn.textContent;
      const correctAnswer = duplicatedQuizData[currentQuestion].correctAnswer;

      quizResults.push({
        question: duplicatedQuizData[currentQuestion].image,
        answer: selectedAnswer,
        correct: selectedAnswer === correctAnswer,
      });

      if (selectedAnswer === correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      currentQuestion++;
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
    updateScore();
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(quizCompleted, 300000); // 5 menit
  }

  choicesElements.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      checkAnswer(btn);
      resetInactivityTimer();
    });
  });
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
