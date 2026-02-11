const questions = [
  { id: 1, text: "Little interest or pleasure in doing things" },
  { id: 2, text: "Feeling down, depressed, or hopeless" },
  { id: 3, text: "Trouble falling or staying asleep, or sleeping too much" },
  { id: 4, text: "Feeling tired or having little energy" },
  { id: 5, text: "Poor appetite or overeating" },
  { id: 6, text: "Feeling bad about yourself or that you are a failure" },
  { id: 7, text: "Trouble concentrating on things" },
  { id: 8, text: "Moving or speaking slowly or being fidgety" },
  { id: 9, text: "Thoughts that you would be better off dead" }
];

// 🔀 Shuffle questions
const shuffled = [...questions].sort(() => Math.random() - 0.5);

const form = document.getElementById("phq9Form");

// Render questions with CORRECT SERIAL NUMBER
shuffled.forEach((q, index) => {
  form.insertAdjacentHTML("beforeend", `
    <div class="question-item">
      <div class="question-text">
        ${index + 1}. ${q.text}
      </div>
      <div class="radio-group">
        ${["Not at all", "Several days", "More than half the days", "Nearly every day"]
          .map((label, value) => `
            <label class="radio-option">
              <input type="radio" name="q${q.id}" value="${value}">
              ${label}
            </label>
          `).join("")}
      </div>
    </div>
  `);
});

// Submit button
form.insertAdjacentHTML("beforeend", `
  <div class="submit-section">
    <button type="submit" class="submit-btn">Submit PHQ-9</button>
  </div>
`);

// 🎨 Visual selection
document.addEventListener("change", e => {
  if (e.target.type === "radio") {
    document
      .querySelectorAll(`input[name="${e.target.name}"]`)
      .forEach(r => r.parentElement.classList.remove("selected"));

    e.target.parentElement.classList.add("selected");
  }
});

// 🧠 Submit logic
form.addEventListener("submit", e => {
  e.preventDefault();

  let score = 0;

  for (let i = 1; i <= 9; i++) {
    const ans = document.querySelector(`input[name="q${i}"]:checked`);
    if (!ans) {
      alert("Please answer all questions");
      return;
    }
    score += parseInt(ans.value);
  }

  const level =
    score <= 4 ? "Minimal Depression" :
    score <= 9 ? "Mild Depression" :
    score <= 14 ? "Moderate Depression" :
    score <= 19 ? "Moderately Severe Depression" :
    "Severe Depression";

  document.querySelector(".test-container").innerHTML = `
    <div style="text-align:center;padding:40px">
      <h2>PHQ-9 Result</h2>
      <div style="font-size:48px;font-weight:800">${score}</div>
      <p style="font-size:20px">${level}</p>
      <p style="color:#666">Redirecting to dashboard…</p>
    </div>
  `;

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 2500);
});
