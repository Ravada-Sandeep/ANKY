const API = "http://127.0.0.1:5000";

if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

let selectedSubject = null;

let selectedTopic = null;

function toggleSubjectForm() {

    const form =
        document.getElementById("subjectForm");

    form.style.display =
        form.style.display === "none"
        ? "block"
        : "none";
}

function toggleTopicForm() {

    const form =
        document.getElementById("topicForm");

    form.style.display =
        form.style.display === "none"
        ? "block"
        : "none";
}

function toggleFlashcardForm() {

    const form =
        document.getElementById("flashcardForm");

    form.style.display =
        form.style.display === "none"
        ? "block"
        : "none";
}

function addSubject() {

  const subject_name =
      document.getElementById("subjectName").value.trim();


  if (!subject_name) {
    alert("Enter subject name");
    return;
  }

  fetch(API + "/subjects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization":
        "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      subject_name: subject_name
    })
  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("subjectMsg").innerText =
      data.message;

    document.getElementById("subjectName").value = "";
    document.getElementById("subjectForm")
    .style.display = "none";

    loadSubjects();
  });
}

function addTopic() {

  if (!selectedSubject) {
    alert("Please select a subject first");
    return;
  }

  const topic_name =
      document.getElementById("topicName").value.trim();

  if (!topic_name) {
    alert("Enter topic name");
    return;
  }

  fetch(API + "/topics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization":
        "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      subject_id: selectedSubject,
      topic_name: topic_name
    })
  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("topicMsg").innerText =
      data.message;

    document.getElementById("topicName").value = "";
    document.getElementById("topicForm")
    .style.display = "none";

    loadTopics(selectedSubject);
  });
}

function addFlashcard() {

  if (!selectedTopic) {
    alert("Please select a topic first");
    return;
  }

  const question =
      document.getElementById("question").value.trim();

  const answer =
      document.getElementById("answerText").value.trim();

  if (!question || !answer) {
    alert("Enter both question and answer");
    return;
  }

  fetch(API + "/flashcards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization":
        "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      topic_id: selectedTopic,
      question: question,
      answer: answer
    })
  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("flashcardMsg").innerText =
      data.message;

    document.getElementById("question").value = "";
    document.getElementById("answerText").value = "";
    document.getElementById("flashcardForm")
    .style.display = "none";
    loadFlashcards(selectedTopic);
  });
}




// Load Subjects
function loadSubjects() {
  fetch(API + "/subjects", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    let html = "";
    if (!Array.isArray(data)) {
    document.getElementById("subjects").innerHTML =
        "<p>No subjects found</p>";
    return;
}

    data.forEach(sub => {
      html += `
<div style="
display:flex;
justify-content:center;
align-items:center;
gap:10px;
margin:8px;
">

<button
onclick="loadTopics(${sub.id},
'${sub.subject_name}')">

${sub.subject_name}

</button>

<button
onclick="deleteSubject(${sub.id})">

Delete

</button>

</div>
`;
    });

    document.getElementById("subjects").innerHTML = html;
  });
}

// Load Topics
function loadTopics(subjectId) {

  selectedSubject = subjectId;
  document.getElementById("topicBtn")
    .style.display = "inline-block";
  selectedTopic = null;

  document.getElementById("quizBtn").style.display = "none";

  
  document.getElementById("topics").innerHTML = "";
  document.getElementById("flashcards").innerHTML = "";

  fetch(API + "/topics/" + subjectId, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {

    let html = "";

    if (!Array.isArray(data)) {
      document.getElementById("topics").innerHTML =
        "<p>No topics found</p>";

      document.getElementById("flashcards").innerHTML = "";

      return;
    }

    data.forEach(topic => {
      html += `
<div style="
display:flex;
justify-content:center;
align-items:center;
gap:10px;
margin:8px;
">

<button
onclick="loadFlashcards(
${topic.id},
'${topic.topic_name}'
)">

${topic.topic_name}

</button>

<button
onclick="deleteTopic(
${topic.id}
)">

Delete

</button>

</div>
`;
    });

    document.getElementById("topics").innerHTML = html;

    document.getElementById("flashcards").innerHTML = "";
  });
}
// Load Flashcards
function loadFlashcards(topicId) {

  selectedTopic = topicId;
  document.getElementById("flashcardBtn")
    .style.display = "inline-block";
  document.getElementById("flashcards").innerHTML = "";

  fetch(API + "/flashcards/" + topicId, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {

    let html = "";

    if (!Array.isArray(data)) {
      document.getElementById("quizBtn").style.display = "none";

      document.getElementById("flashcards").innerHTML =
        "<p>No flashcards found</p>";
      return;
    }

    document.getElementById("quizBtn").style.display =
      "inline-block";

    data.forEach(fc => {

  html += `
    <div class="flashcard">

      <b>Q:</b> ${fc.question}
      <br>

      <b>A:</b> ${fc.answer}
      <br><br>

      <button
      onclick="deleteFlashcard(${fc.id})">

        Delete

      </button>

      <hr>

    </div>
  `;
});

    document.getElementById("flashcards").innerHTML = html;
  })
  .catch(error => {
    console.error("Error loading flashcards:", error);
    document.getElementById("quizBtn").style.display = "none";

    document.getElementById("flashcards").innerHTML =
      "<p>Error loading flashcards</p>";
  });
}
function deleteFlashcard(flashcardId) {

    if (!confirm("Delete flashcard?")) {
        return;
    }

    fetch(API + "/flashcards/" + flashcardId, {

        method: "DELETE",

        headers: {
            "Authorization":
            "Bearer " +
            localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

    alert(data.message);

    loadFlashcards(selectedTopic);
});
}

function deleteSubject(subjectId) {

    if (!confirm("Delete Subject?")) {
        return;
    }

    fetch(API + "/subjects/" + subjectId, {

        method: "DELETE",

        headers: {
            "Authorization":
            "Bearer " +
            localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadSubjects();

        document.getElementById("topics")
            .innerHTML = "";

        document.getElementById("flashcards")
            .innerHTML = "";

        document.getElementById("currentSubject")
            .innerText =
            "Current Subject: None";

        document.getElementById("currentTopic")
            .innerText =
            "Current Topic: None";
    });
}

function deleteTopic(topicId) {

    if (!confirm("Delete Topic?")) {
        return;
    }

    fetch(API + "/topics/" + topicId, {

        method: "DELETE",

        headers: {
            "Authorization":
            "Bearer " +
            localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadTopics(
            selectedSubject,
            document
            .getElementById("currentSubject")
            .innerText
            .replace(
                "Current Subject: ",
                ""
            )
        );

        document.getElementById("flashcards")
            .innerHTML = "";

        document.getElementById("currentTopic")
            .innerText =
            "Current Topic: None";
    });
}


function startQuiz() {
  if (!selectedTopic) {
    alert("Please select a topic first");
    return;
  }

  localStorage.setItem("topicId", selectedTopic);
  window.location.href = "quiz.html";
}

function logout() {

  localStorage.clear();

  window.location.href = "login.html";
}

loadSubjects();