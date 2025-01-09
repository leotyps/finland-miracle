let questions = [];
let currentQuestion = null;
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let wrongAttempts = 0;
let maxAttempts = 3;
let maxQuestions = 10;
let timerInterval;
let timerValue = 15;
let isAnswering = false;
let scoreThreshold = 5; // Added score threshold for win condition

async function loadQuestions() {
    try {
        const response = await fetch("/data/jiko.json");
        questions = await response.json();
        questions = questions.slice(0, maxQuestions);
        showNextQuestion();
    } catch (error) {
        console.error("Error loading questions:", error);
        document.getElementById("question-card").innerHTML = "Error loading questions. Please try again later.";
    }
}

function startTimer() {
    timerValue = 15;
    document.getElementById("timer").textContent = timerValue;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!isAnswering) return;
        timerValue--;
        document.getElementById("timer").textContent = timerValue;
        if (timerValue <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    isAnswering = false;
    wrongAttempts += 1;
    wrongAnswers += 1;
    document.getElementById("score").textContent = `Score: ${score}`;
    endGame(); // Directly end game when no answer is provided
}

function showNextQuestion() {
    if (questions.length === 0 || wrongAttempts >= maxAttempts) {
        endGame();
        return;
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[randomIndex];
    questions.splice(randomIndex, 1);

    document.getElementById("question-card").innerHTML = `
        <p class="text-center text-lg font-medium">${currentQuestion.question}</p>
        <p class="text-center text-sm font-medium text-gray-600 mt-2" id="timer-note">Anda memiliki 15 detik untuk menebak.</p>
        <p id="timer" class="text-center text-xl font-bold mt-4">15</p>
    `;
    document.getElementById("answer-input").value = "";
    document.getElementById("result").classList.add("hidden");
    document.getElementById("win-message").classList.add("hidden");
    document.getElementById("lose-message").classList.add("hidden");
    document.getElementById("question-card").classList.remove("hidden");

    isAnswering = true;
    startTimer();
}

function checkAnswer() {
    if (!isAnswering) return;
    isAnswering = false;
    clearInterval(timerInterval);

    const userAnswer = document.getElementById("answer-input").value.trim().toLowerCase();
    const correctAnswer = currentQuestion.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        score += 1;
        correctAnswers += 1;
        document.getElementById("win-message").classList.remove("hidden");
        document.getElementById("lose-message").classList.add("hidden");
    } else {
        wrongAttempts += 1;
        wrongAnswers += 1;
        document.getElementById("lose-message").classList.remove("hidden");
        document.getElementById("win-message").classList.add("hidden");
    }

    document.getElementById("score").textContent = `Score: ${score}`;

    // Check if should continue or end game
    if (wrongAttempts >= maxAttempts || questions.length === 0) {
        endGame();
    } else {
        // Wait 1 second before showing next question
        setTimeout(() => {
            showNextQuestion();
        }, 1000);
    }
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById("question-card").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");

    // Show win message only if score is 5 or higher
    if (correctAnswers >= scoreThreshold) {
        document.getElementById("win-message").classList.remove("hidden");
        document.getElementById("lose-message").classList.add("hidden");
    } else {
        document.getElementById("win-message").classList.add("hidden");
        document.getElementById("lose-message").classList.remove("hidden");
    }

    document.getElementById("correct-count").textContent = correctAnswers;
    document.getElementById("wrong-count").textContent = wrongAnswers;
}

document.getElementById("restart-game").addEventListener("click", () => {
    score = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    wrongAttempts = 0;
    loadQuestions();
    document.getElementById("result").classList.add("hidden");
    document.getElementById("submit-answer").disabled = false;
    document.getElementById("question-card").classList.remove("hidden");
});

document.getElementById("answer-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        checkAnswer();
    }
});

document.getElementById("submit-answer").addEventListener("click", () => {
    checkAnswer();
});

loadQuestions();