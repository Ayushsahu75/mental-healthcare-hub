const questions = [
  { id: 1, text: "Feeling nervous, anxious, or on edge" },
  { id: 2, text: "Not being able to stop or control worrying" },
  { id: 3, text: "Worrying too much about different things" },
  { id: 4, text: "Trouble relaxing" },
  { id: 5, text: "Being so restless that it is hard to sit still" },
  { id: 6, text: "Becoming easily annoyed or irritable" },
  { id: 7, text: "Feeling afraid as if something awful might happen" }
];

// ✅ REAL shuffle (Fisher–Yates)
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const shuffled = shuffleArray(questions);

const options = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day"
];

const form = document.getElementById("gad7Form");

// Render
shuffled.forEach((q, index) => {
  form.insertAdjacentHTML("beforeend", `
    <div class="question-item">
      <div class="question-text">${index + 1}. ${q.text}</div>
      <div class="radio-group">
        ${options.map((label, value) => `
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
    <button type="submit" class="submit-btn">Submit GAD-7</button>
  </div>
`);

// Visual select
document.addEventListener("change", e => {
  if (e.target.type === "radio") {
    document
      .querySelectorAll(`input[name="${e.target.name}"]`)
      .forEach(r => r.parentElement.classList.remove("selected"));
    e.target.parentElement.classList.add("selected");
  }
});

// Submit logic
form.addEventListener("submit", e => {
  e.preventDefault();

  let score = 0;
  for (let i = 1; i <= 7; i++) {
    const ans = document.querySelector(`input[name="q${i}"]:checked`);
    if (!ans) {
      alert("Please answer all questions");
      return;
    }
    score += parseInt(ans.value);
  }

  const level =
    score <= 4 ? "Minimal Anxiety" :
    score <= 9 ? "Mild Anxiety" :
    score <= 14 ? "Moderate Anxiety" :
    "Severe Anxiety";

  document.querySelector(".test-container").innerHTML = `
    <div style="text-align:center;padding:40px">
      <h2>GAD-7 Result</h2>
      <div style="font-size:48px;font-weight:800">${score}</div>
      <p style="font-size:20px">${level}</p>
      <p style="color:#666">Redirecting to dashboard…</p>
    </div>
  `;

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 2500);
});
