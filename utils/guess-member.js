const quizData = [
  { image: "/src/gen12/Aralie_1.jpeg", correctAnswer: "Aralie" },
  { image: "/src/gen12/Delynn_1.jpeg", correctAnswer: "Delynn" },
  { image: "/src/gen12/Erine_1.jpeg", correctAnswer: "Erine" },
  { image: "/src/gen12/Fritzy_1.jpeg", correctAnswer: "Fritzy" },
  { image: "/src/gen12/Kimmy_1.jpeg", correctAnswer: "Kimmy" },
  { image: "/src/gen12/Lana_1.jpeg", correctAnswer: "Lana" },
];

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

let currentQuestion = 0;
let correctCount = 0;
let incorrectCount = 0;

const fotoElement = document.getElementById("foto");
const choicesElements = document.querySelectorAll(".choice-btn");
const correctSpan = document.getElementById("correct");
const incorrectSpan = document.getElementById("incorrect");

function loadQuestion() {
  if (currentQuestion < totalQuestions) {
    const currentQuiz = duplicatedQuizData[currentQuestion];
    fotoElement.src = currentQuiz.image;
    const choices = generateRandomChoices(currentQuiz.correctAnswer);
    choicesElements.forEach((btn, index) => {
      btn.textContent = choices[index];
    });
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

    if (selectedAnswer === correctAnswer) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    currentQuestion++;
    loadQuestion();
    updateScore();
  } else {
    quizCompleted();
  }
}

function showNotification(message) {
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'notification-container';
  notificationContainer.className = `
      fixed top-16 right-4 z-50 flex items-center bg-purple-800 text-white
      px-4 py-3 rounded-3xl shadow-lg transform transition-all duration-300 opacity-0
      sm:top-20 sm:right-6 max-w-xs w-full sm:max-w-sm
  `;
  
  notificationContainer.innerHTML = `
      <div class="flex items-center w-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0h.01M12 15h.01M21.75 12A9.75 9.75 0 1112 2.25 9.75 9.75 0 0121.75 12z" />
          </svg>
          <span class="text-sm sm:text-base break-words">${message}</span>
      </div>
  `;

  document.body.appendChild(notificationContainer);
  setTimeout(() => {
      notificationContainer.style.opacity = '1';
      notificationContainer.style.transform = 'translateY(0)';
  }, 50);
  setTimeout(() => {
      notificationContainer.style.opacity = '0';
      notificationContainer.style.transform = 'translateY(10px)';
      setTimeout(() => notificationContainer.remove(), 300);
  }, 3000);
}


function quizCompleted() {
  const message = `Quiz completed! Total Benar: ${correctCount}, Total Salah: ${incorrectCount}`;
  showNotification(message);
  setTimeout(() => {
    resetQuiz();
    window.location.href = "/guess";
  }, 3000); 
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

loadQuestion();
