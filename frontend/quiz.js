const API = "http://127.0.0.1:5000";

if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

let questions = [];
let currentIndex = 0;
let answers = [];

function loadQuiz() {
  const topicId = localStorage.getItem("topicId");
  if (!topicId) {

    document.getElementById("question").innerText =
      "Please select a topic first.";

    document.getElementById("answer").style.display =
      "none";

    document.querySelector("button").style.display =
      "none";

    return;
  }

  fetch(API + "/quiz/" + topicId, {
  headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
  }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Quiz data:", data);
    if (!Array.isArray(data)) {
    document.getElementById("question").innerText =
    "No flashcards are due for review.";

  document.getElementById("answer").style.display =
    "none";

  document.querySelector("button").style.display =
    "none";

  return;
  }

    questions = data;
    showQuestion();
  });
}

function showQuestion() {
  if (currentIndex < questions.length) {
    document.getElementById("question").innerText =
      questions[currentIndex].question;

    document.getElementById("progress").innerText =
      `Question ${currentIndex + 1} of ${questions.length}`;

    document.getElementById("answer").value = "";
  } else {
    submitQuiz();
  }
}

function nextQuestion() {
  const userAnswer = document.getElementById("answer").value.trim();

  if (!userAnswer) {
    alert("Enter answer");
    return;
  }

  answers.push({
    flashcard_id: questions[currentIndex].flashcard_id,
    user_answer: userAnswer
  });

  currentIndex++;
  showQuestion();
}

function submitQuiz() {
  document.getElementById("answer").style.display =
  "none";

document.querySelector("button").style.display =
  "none";
  fetch(API + "/submit-quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ answers })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("question").innerText = "Quiz Completed!";
    document.getElementById("result").innerText =
      `Score: ${data.score}/${data.total}`;
  });
}

loadQuiz();
