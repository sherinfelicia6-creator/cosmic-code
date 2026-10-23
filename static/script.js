
/* COSMIC CODE — NAVIGATION AND INTERACTIONS */

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const titleElement = document.getElementById("topbar-title");

const pageTitles = {
    "dashboard": "Week Dashboard",
    "weekly-plan": "Weekly Plan",
    "today": "Today's Practice",
    "milestones": "Milestones",
    "streaks": "Streaks",
    "progress-pulse": "Progress Pulse",
    "ai-mock-test": "AI Mock Test"
};

// Navigate to a selected page
function openPage(pageId) {
    const selectedPage = document.getElementById(pageId);

    if (!selectedPage || !selectedPage.classList.contains("page")) {
        pageId = "dashboard";
    }

    pages.forEach(function (page) {
        page.classList.toggle("active", page.id === pageId);
    });

    navLinks.forEach(function (link) {
        link.classList.toggle(
            "active",
            link.dataset.page === pageId
        );
    });

    titleElement.textContent = pageTitles[pageId] || "Cosmic Code";
}

// Sidebar navigation
navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const pageId = link.dataset.page;

        if (window.location.hash !== "#" + pageId) {
            window.location.hash = pageId;
        }

        openPage(pageId);
    });
});

// Buttons that navigate to another page
document.querySelectorAll("[data-go]").forEach(function (button) {
    button.addEventListener("click", function () {
        const pageId = button.dataset.go;

        if (window.location.hash !== "#" + pageId) {
            window.location.hash = pageId;
        }

        openPage(pageId);
    });
});

// Support browser back and forward buttons
window.addEventListener("hashchange", function () {
    openPage(window.location.hash.slice(1) || "dashboard");
});

// Open a page directly through its URL hash
openPage(window.location.hash.slice(1) || "dashboard");


/* PRACTICE DATA
   Data is stored locally in this browser.
   It is not shared between different devices.
*/

function loadPracticeData() {
    try {
        const saved = localStorage.getItem("cosmicCodePractice");

        if (saved) {
            const data = JSON.parse(saved);

            if (
                Number.isInteger(data.solved) &&
                data.solved >= 0 &&
                Number.isInteger(data.streak) &&
                data.streak >= 0 &&
                Array.isArray(data.dates)
            ) {
                return data;
            }
        }
    } catch (error) {
        console.warn("Could not load saved practice data.");
    }

    return {
        solved: 0,
        streak: 0,
        lastPractice: "",
        dates: []
    };
}

let practice = loadPracticeData();

function savePracticeData() {
    try {
        localStorage.setItem(
            "cosmicCodePractice",
            JSON.stringify(practice)
        );
    } catch (error) {
        console.warn("Could not save practice data.");
    }
}

function getLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function updatePracticeStats() {
    const weeklyGoal = 10;
    const percent = Math.min(
        100,
        Math.round((practice.solved / weeklyGoal) * 100)
    );

    document.getElementById("solved-count").textContent =
        practice.solved;

    document.getElementById("dashboard-streak").textContent =
        practice.streak;

    document.getElementById("current-streak").textContent =
        practice.streak;

    document.getElementById("dashboard-progress").textContent =
        percent + "%";

    document.getElementById("progress-solved").textContent =
        practice.solved;

    document.getElementById("progress-percent").textContent =
        percent + "%";

    document.getElementById("progress-label").textContent =
        Math.min(practice.solved, weeklyGoal) + " / " + weeklyGoal;

    document.getElementById("weekly-progress-fill").style.width =
        percent + "%";

    document.getElementById("progress-message").textContent =
        practice.solved >= weeklyGoal
            ? "Weekly goal reached! Great work."
            : "You have completed " + practice.solved +
              " of your " + weeklyGoal + " problem weekly goal.";

    // Milestone status
    document.getElementById("milestone-first").textContent =
        practice.solved >= 1 ? "Unlocked ✓" : "Locked";

    document.getElementById("milestone-ten").textContent =
        practice.solved >= 10 ? "Unlocked ✓" : "Locked";

    document.getElementById("milestone-streak").textContent =
        practice.streak >= 7 ? "Unlocked ✓" : "Locked";

    const nextMilestone = document.getElementById("next-milestone");

    if (practice.solved < 1) {
        nextMilestone.textContent =
            "Solve your first problem to unlock your first milestone.";
    } else if (practice.solved < 10) {
        nextMilestone.textContent =
            "Solve " + (10 - practice.solved) +
            " more problems to unlock Problem Solver.";
    } else if (practice.streak < 7) {
        nextMilestone.textContent =
            "Keep practising consistently to reach a 7-day streak.";
    } else {
        nextMilestone.textContent =
            "You have reached all three sample milestones. Keep learning!";
    }

    const today = getLocalDateKey(new Date());

    document.getElementById("streak-message").textContent =
        practice.lastPractice === today
            ? "You've practised today. Keep up the good work!"
            : "Complete a practice session to update your streak.";

    updateWeekCalendar();
}

// Show completed days in the weekly calendar
function updateWeekCalendar() {
    const now = new Date();
    const monday = new Date(now);

    const day = (now.getDay() + 6) % 7;
    monday.setDate(now.getDate() - day);

    const keys = [
        "day-mon", "day-tue", "day-wed", "day-thu",
        "day-fri", "day-sat", "day-sun"
    ];

    keys.forEach(function (id, index) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);

        const dateKey = getLocalDateKey(date);
        const element = document.getElementById(id);
        const container = element.parentElement;

        const completed = practice.dates.includes(dateKey);

        element.textContent = completed ? "✓" : "·";
        container.classList.toggle("completed", completed);
    });
}

// Record one completed practice problem
document.getElementById("complete-problem").addEventListener(
    "click",
    function () {
        const today = getLocalDateKey(new Date());

        practice.solved += 1;

        if (!practice.dates.includes(today)) {
            practice.dates.push(today);
        }

        if (practice.lastPractice !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const yesterdayKey = getLocalDateKey(yesterday);

            if (practice.lastPractice === yesterdayKey) {
                practice.streak += 1;
            } else {
                practice.streak = 1;
            }

            practice.lastPractice = today;
        }

        savePracticeData();
        updatePracticeStats();

        document.getElementById("completion-message").textContent =
            "Problem recorded! Your progress has been updated.";
    }
);


/* SAMPLE MOCK TEST */

const questions = [
    {
        question: "What is the output of 4 % 2?",
        options: ["0", "2", "4", "1"],
        answer: 0,
        explanation: "The % operator returns the remainder. 4 divided by 2 has remainder 0."
    },
    {
        question: "Which keyword checks a condition in Python?",
        options: ["repeat", "if", "define", "check"],
        answer: 1,
        explanation: "The if keyword lets a Python program make a decision."
    },
    {
        question: "What is the output of print(3 > 5)?",
        options: ["True", "False", "3", "5"],
        answer: 1,
        explanation: "3 is not greater than 5, so the result is False."
    }
];

let questionIndex = 0;
let score = 0;
let answered = false;

const questionText = document.getElementById("question-text");
const answerOptions = document.getElementById("answer-options");
const questionNumber = document.getElementById("question-number");
const quizFeedback = document.getElementById("quiz-feedback");
const nextButton = document.getElementById("next-question");
const quizContainer = document.getElementById("quiz-container");
const quizResult = document.getElementById("quiz-result");

function displayQuestion() {
    const question = questions[questionIndex];

    answered = false;

    questionNumber.textContent =
        "Question " + (questionIndex + 1) +
        " of " + questions.length;

    questionText.textContent = question.question;
    quizFeedback.textContent = "";
    nextButton.disabled = true;

    nextButton.textContent =
        questionIndex === questions.length - 1
            ? "View Results"
            : "Next Question →";

    answerOptions.innerHTML = "";

    question.options.forEach(function (option, index) {
        const button = document.createElement("button");

        button.className = "answer-option";
        button.textContent =
            String.fromCharCode(65 + index) + ". " + option;

        button.addEventListener("click", function () {
            selectAnswer(index);
        });

        answerOptions.appendChild(button);
    });
}

function selectAnswer(selectedIndex) {
    if (answered) return;

    answered = true;

    const question = questions[questionIndex];
    const buttons = answerOptions.querySelectorAll("button");

    buttons.forEach(function (button, index) {
        button.disabled = true;

        if (index === question.answer) {
            button.classList.add("correct");
        }
    });

    if (selectedIndex === question.answer) {
        score += 1;
        quizFeedback.textContent = "Correct! " + question.explanation;
        quizFeedback.style.color = "#198452";
    } else {
        buttons[selectedIndex].classList.add("wrong");
        quizFeedback.textContent = "Not quite. " + question.explanation;
        quizFeedback.style.color = "#b65353";
    }

    nextButton.disabled = false;
}

nextButton.addEventListener("click", function () {
    if (!answered) return;

    questionIndex += 1;

    if (questionIndex < questions.length) {
        displayQuestion();
    } else {
        quizContainer.classList.add("hidden");
        quizResult.classList.remove("hidden");

        document.getElementById("quiz-score").textContent =
            "You scored " + score + " out of " + questions.length + ".";
    }
});

document.getElementById("restart-quiz").addEventListener(
    "click",
    function () {
        questionIndex = 0;
        score = 0;

        quizResult.classList.add("hidden");
        quizContainer.classList.remove("hidden");

        displayQuestion();
    }
);

// Initialise the website
updatePracticeStats();
displayQuestion();
