// Node and electron requirements
const { ipcRenderer } = require("electron");
var fs = require("fs");

// Grabbing HTML elements
let buttonValue,
  doubleOn = 1,
  answerButton,
  singleJeopardy = true;

const scoreText = document.getElementById("Score");
let scoreValue = 0;

const answerBtns = document.querySelectorAll(".answer-button"); // Gets buttons from main page initially

answerBtns.forEach((btn) =>
  btn.addEventListener("click", (event) => {
    // Check if the click came from the main board or the DJ modal content
    // This check might need refinement depending on how you structure DJ buttons
    if (event.target.closest("#doubleJeopardyModalContent")) {
      console.log("Clicked button inside DJ Modal");
      // Handle DJ button click differently if needed
      // For now, let's assume it uses the same logic
    } else {
      console.log("Clicked button on main board");
    }
    showModal(); // Show the original check/wrong modal
    buttonValue = event.target.textContent.substring(1);
    buttonValue = parseInt(buttonValue);
    console.log(buttonValue);
    answerButton = btn; // Store the clicked button (could be main or DJ)
  })
);

const checkButton = document.getElementById("CheckButton");
// checkButton.innerHTML = '<img src="assets/check-mark.png" height="33">'; // Moved to DOMContentLoaded

const wrongButton = document.getElementById("WrongButton");
// wrongButton.innerHTML = '<img src="assets/wrong.png" width="33">'; // Moved to DOMContentLoaded

const noAnswerButton = document.getElementById("NoAnswer");
const resetButton = document.getElementById("Reset");
const doubleButton = document.getElementById("DailyDouble");

// The original answer modal
const modal = document.getElementById("myModal");

// --- Elements for the Double Jeopardy modal ---
const openDoubleJeopardyBtn = document.getElementById("openDoubleJeopardyBtn");

// To show the original modal
function showModal() {
  if (modal) {
    modal.style.display = "block";
  }
}

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// --- Event listeners for the original modal's buttons ---
if (checkButton) {
  checkButton.addEventListener("click", () => {
    if (scoreValue + buttonValue < 0) {
      scoreText.textContent = "Score: -$" + Math.abs(scoreValue + buttonValue);
    } else {
      scoreText.textContent = "Score: $" + (scoreValue + buttonValue);
    }
    scoreValue = scoreValue + buttonValue;

    if (modal) modal.style.display = "none";
    if (answerButton) answerButton.style.visibility = "hidden"; // Hide the specific button clicked (main or DJ)
    if (doubleButton) doubleButton.className = "double-button";
    doubleOn = 1;
  });
}

if (wrongButton) {
  wrongButton.addEventListener("click", () => {
    if (doubleOn == 1) {
      //No deductions for incorrect DD with Coryat scoring
      if (scoreValue - buttonValue < 0) {
        scoreText.textContent =
          "Score: -$" + Math.abs(scoreValue - buttonValue);
      } else {
        scoreText.textContent = "Score: $" + (scoreValue - buttonValue);
      }
      scoreValue = scoreValue - buttonValue;
    }

    if (modal) modal.style.display = "none";
    if (answerButton) answerButton.style.visibility = "hidden";
    if (doubleButton) doubleButton.className = "double-button";
    doubleOn = 1;
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    // Reset score
    scoreValue = 0;
    scoreText.textContent = "Score: $0";

    // Go back to single jeopardy
    if (!singleJeopardy) {
      showDoubleJeopardy();
    }
  });
}

if (noAnswerButton) {
  noAnswerButton.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
    if (answerButton) answerButton.style.visibility = "hidden";
    if (doubleButton) doubleButton.className = "double-button";
    doubleOn = 1;
  });
}

if (doubleButton) {
  doubleButton.addEventListener("click", () => {
    doubleButton.className =
      doubleButton.className == "double-clicked"
        ? "double-button"
        : "double-clicked";
    doubleOn = doubleButton.className == "double-clicked" ? 2 : 1;
  });
}

// --- Functions and Listeners for Double Jeopardy Modal ---

function showDoubleJeopardy() {
  // Check whether you're in single or double jeopardy
  answerBtns.forEach((btn) => {
    // Getting button value
    let value = btn.textContent;
    value = parseInt(value.slice(1));

    if (singleJeopardy) {
      btn.textContent = "$" + value * 2;
    } else {
      btn.textContent = "$" + value * 0.5;
    }
  });

  if (!singleJeopardy) {
    openDoubleJeopardyBtn.textContent = "DOUBLE JEOPARDY";
  } else {
    openDoubleJeopardyBtn.textContent = "JEOPARDY ROUND";
  }

  // Flip between single and double jeopardy
  singleJeopardy = !singleJeopardy;
}

// Listener for the button that OPENS the DJ modal
if (openDoubleJeopardyBtn) {
  openDoubleJeopardyBtn.addEventListener("click", showDoubleJeopardy);
} else {
  console.error("Button with ID 'openDoubleJeopardyBtn' not found.");
}

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  // Set icons for original modal buttons
  if (checkButton)
    checkButton.innerHTML = '<img src="assets/check-mark.png" height="33">';
  if (wrongButton)
    wrongButton.innerHTML = '<img src="assets/wrong.png" width="33">';

  // Ensure modals start hidden
  if (modal) modal.style.display = "none";
  if (doubleJeopardyModal) doubleJeopardyModal.style.display = "none"; // Make sure DJ modal is hidden too
});
