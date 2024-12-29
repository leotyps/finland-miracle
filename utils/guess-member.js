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

function quizCompleted() {
  swal(
    "Selesai!",
    "Quiz completed! Total Benar: " +
      correctCount +
      ", Total Salah: " +
      incorrectCount,
    "success",
    {
      button: "Quit!",
    }
  ).then(() => {
    resetQuiz();
    window.location.href = "guess.html";
  });
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
