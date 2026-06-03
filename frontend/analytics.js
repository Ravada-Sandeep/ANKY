const API = "http://127.0.0.1:5000";

if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

function logout() {

    localStorage.clear();

    window.location.href = "login.html";
}

function loadSummary() {

    fetch(API + "/dashboard-summary", {
        headers: {
            "Authorization":
                "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

       document.getElementById("summary").innerHTML = `
<div class="summary-grid">

    <div class="metric-card">
        <h3>Subjects</h3>
        <p>${data.subjects}</p>
    </div>

    <div class="metric-card">
        <h3>Topics</h3>
        <p>${data.topics}</p>
    </div>

    <div class="metric-card">
        <h3>Flashcards</h3>
        <p>${data.flashcards}</p>
    </div>

    <div class="metric-card">
        <h3>Due Today</h3>
        <p>${data.due_today}</p>
    </div>

    <div class="metric-card">
        <h3>Retention</h3>
        <p>${data.avg_retention}%</p>
    </div>

</div>
`;
    })
    .catch(error => {

        console.error(error);

        document.getElementById("summary").innerHTML =
            "<p>Error loading summary.</p>";
    });
}

function startDueReview() {

    fetch(API + "/due-flashcards", {
        headers: {
            "Authorization":
                "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

        if (!Array.isArray(data) || data.length === 0) {

            alert("No flashcards due today.");

            return;
        }

        localStorage.setItem(
            "dueQuestions",
            JSON.stringify(data)
        );

        window.location.href =
            "due-quiz.html";
    })
    .catch(error => {

        console.error(error);

        alert("Error loading due flashcards.");
    });
}

loadSummary();