const quizData = [];
let currentQuestion = 0;
let correctCount = 0;
let incorrectCount = 0;
let quizCompletedFlag = false;
let quizResults = [];
let inactivityTimeout;
let questionTimer;
let timeLeft = 15; 

function preloadImages(imageUrls) {
  return Promise.all(imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }));
}

fetch("/data/quiz.json")
  .then((response) => response.json())
  .then(async (data) => {
    quizData.push(...data);
    const imageUrls = quizData.map((q) => q.image);

    const fotoElement = document.getElementById("foto");
    fotoElement.style.backgroundColor = "#f0f0f0";
    fotoElement.src = ""; 
    
    await preloadImages(imageUrls);
    initializeQuiz();
  })
  .catch((error) => console.error("Error fetching quiz data:", error));

function initializeQuiz() {
  loadGameState();
  let totalQuestions = parseInt(localStorage.getItem("questionCount")) || 5;

  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer';
  timerDisplay.className = 'text-xl font-bold mb-4';
  document.querySelector('#foto').parentElement.insertBefore(timerDisplay, document.querySelector('#foto'));

  let duplicatedQuizData = [];
  while (duplicatedQuizData.length < totalQuestions) {
    duplicatedQuizData = [...duplicatedQuizData, ...quizData];
  }
  duplicatedQuizData = duplicatedQuizData
    .slice(0, totalQuestions)
    .sort(() => Math.random() - 0.5);

  const fotoElement = document.getElementById("foto");
  const choicesElements = document.querySelectorAll(".choice-btn");
  const correctSpan = document.getElementById("correct");
  const incorrectSpan = document.getElementById("incorrect");

  function updateTimer() {
    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `Waktu kamu sisa: ${timeLeft} detik`;
    
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

  function loadQuestion() {
    if (currentQuestion < totalQuestions) {
      const currentQuiz = duplicatedQuizData[currentQuestion];

      fotoElement.style.backgroundColor = "transparent";
      fotoElement.src = currentQuiz.image;

      const choices = generateRandomChoices(currentQuiz.correctAnswer);
      choicesElements.forEach((btn, index) => {
        btn.textContent = choices[index];
      });
      
      startTimer();
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
      clearInterval(questionTimer);
      
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
    inactivityTimeout = setTimeout(quizCompleted, 300000); 
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