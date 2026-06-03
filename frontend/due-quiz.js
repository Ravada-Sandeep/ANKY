const API = "http://127.0.0.1:5000";

if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

let questions = [];
let currentIndex = 0;
let answers = [];

function loadQuiz() {

    const stored =
        localStorage.getItem("dueQuestions");

    if (!stored) {

        document.getElementById("question")
            .innerText =
            "No due review available.";

        return;
    }

    questions = JSON.parse(stored);

    if (questions.length === 0) {

        document.getElementById("question")
            .innerText =
            "No flashcards due today.";

        return;
    }

    showQuestion();
}

function showQuestion() {

    if (currentIndex < questions.length) {

        document.getElementById("question")
            .innerText =
            questions[currentIndex].question;

        document.getElementById("progress")
            .innerText =
            `Question ${currentIndex + 1} of ${questions.length}`;

        document.getElementById("answer").value = "";

    }
    else {

        submitQuiz();
    }
}

function nextQuestion() {

    const userAnswer =
        document.getElementById("answer")
        .value.trim();

    if (!userAnswer) {

        alert("Enter answer");

        return;
    }

    answers.push({

        flashcard_id:
            questions[currentIndex].id,

        question:
            questions[currentIndex].question,

        correct_answer:
            questions[currentIndex].answer,

        user_answer:
            userAnswer
    });

    currentIndex++;

    showQuestion();
}

function submitQuiz() {

    document.getElementById("answer")
        .style.display = "none";

    document.getElementById("nextBtn")
        .style.display = "none";

    fetch(API + "/submit-quiz", {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json",

            "Authorization":
                "Bearer " +
                localStorage.getItem("token")
        },

        body: JSON.stringify({
            answers
        })
    })
    .then(res => res.json())
    .then(data => {

        localStorage.removeItem(
            "dueQuestions"
        );

        document.getElementById("progress")
            .innerText = "";

        document.getElementById("question")
            .innerText =
            "Due Review Completed!";

        document.getElementById("result")
            .innerText =
            `Score: ${data.score}/${data.total}`;

        showReview();
    });
}

function showReview() {

    let html = `
        <h2>Review Answers</h2>
    `;

    answers.forEach(a => {

        const correct =
            a.user_answer.toLowerCase().trim()
            ===
            a.correct_answer.toLowerCase().trim();

        html += `

            <div class="card">

                <p>
                    <b>Question:</b>
                    ${a.question}
                </p>

                <p>
                    <b>Your Answer:</b>
                    ${a.user_answer}
                </p>

                <p>
                    <b>Correct Answer:</b>
                    ${a.correct_answer}
                </p>

                <p>
                    <b>Status:</b>
                    ${correct ? "Correct" : "Incorrect"}
                </p>

                <hr>

            </div>

        `;
    });

    document.getElementById("review")
        .innerHTML = html;
}

loadQuiz();