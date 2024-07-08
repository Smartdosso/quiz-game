document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const categorySelect = document.getElementById("category");
    const numQuestionsInput = document.getElementById("numQuestions");
    const questionContainer = document.getElementById("questionContainer");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");
    const resultContainer = document.getElementById("result");

    let currentQuestionIndex = 0;
    let questions = [];
    let score = 0;
    let userAnswers = [];

    startBtn.addEventListener("click", async () => {
        const category = categorySelect.value;
        const numQuestions = parseInt(numQuestionsInput.value);

        questions = await getRandomQuestions(category, numQuestions);
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];

        document.getElementById("setup").style.display = "none";
        document.getElementById("quiz").style.display = "block";
        nextBtn.style.display = "none";
        backBtn.style.display = "none";

        displayQuestion();
    });

    nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            displayResult();
        }
    });

    backBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    });

    async function readJSONFile(url) {
        const response = await fetch(url);
        return await response.json();
    }

    async function getRandomQuestions(type, num) {
        const data = await readJSONFile("questions.json");
        let allQuestions = [];

        if (type === "all") {
            allQuestions = [...data.html, ...data.css, ...data.js];
        } else {
            allQuestions = data[type];
        }

        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function (match) {
            switch (match) {
                case '&':
                    return '&amp;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '"':
                    return '&quot;';
                case "'":
                    return '&#39;';
                default:
                    return match;
            }
        });
    }

    function displayQuestion() {
        const question = questions[currentQuestionIndex];
        const userAnswer = userAnswers[currentQuestionIndex];
        questionContainer.innerHTML = `
            <div class="question">${escapeHTML(question.question)}</div>
            <div class="choices">
                ${question.choices.map((choice, index) => `
                    <div class="choice ${userAnswer ? (choice === question.answer ? 'correct' : choice === userAnswer ? 'incorrect' : '') : ''}" data-choice="${escapeHTML(choice)}">${escapeHTML(choice)}</div>
                `).join("")}
            </div>
            ${!userAnswer ? '<button id="submitBtn">Submit</button>' : ''}
        `;

        if (!userAnswer) {
            const choices = document.querySelectorAll(".choice");
            choices.forEach(choice => {
                choice.addEventListener("click", () => {
                    choices.forEach(c => c.classList.remove("selected"));
                    choice.classList.add("selected");
                });
            });

            document.getElementById("submitBtn").addEventListener("click", () => {
                const selectedChoice = document.querySelector(".choice.selected");
                if (!selectedChoice) {
                    alert("Please select an answer!");
                    return;
                }

                const selectedAnswer = selectedChoice.dataset.choice;
                userAnswers[currentQuestionIndex] = selectedAnswer;
                choices.forEach(choice => {
                    if (choice.dataset.choice === question.answer) {
                        choice.classList.add("correct");
                    } else if (choice.dataset.choice === selectedAnswer) {
                        choice.classList.add("incorrect");
                    }
                });

                if (selectedAnswer === question.answer) {
                    score++;
                }

                nextBtn.style.display = "block";
                backBtn.style.display = currentQuestionIndex > 0 ? "block" : "none";
                document.getElementById("submitBtn").style.display = "none";
            });
        } else {
            nextBtn.style.display = "block";
            backBtn.style.display = currentQuestionIndex > 0 ? "block" : "none";
        }
    }

    function displayResult() {
        document.getElementById("quiz").style.display = "none";
        resultContainer.style.display = "block";
        resultContainer.innerHTML = `
            <h2>Your Score: ${score} / ${questions.length}</h2>
            <p>${Math.round((score / questions.length) * 100)}%</p>
            <button id="tryAgainBtn">Try Again</button>
        `;

        document.getElementById("tryAgainBtn").addEventListener("click", () => {
            resetGame();
        });
    }

    function resetGame() {
        document.getElementById("setup").style.display = "block";
        document.getElementById("quiz").style.display = "none";
        resultContainer.style.display = "none";
        categorySelect.value = "html";
        numQuestionsInput.value = 10;
        currentQuestionIndex = 0;
        questions = [];
        score = 0;
        userAnswers = [];
    }
});

