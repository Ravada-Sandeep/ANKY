const API = "http://127.0.0.1:5000";

// REGISTER
function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(API + "/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, password })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message;
  });
}

// LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("msg").innerText = data.message;
    }
  });
}