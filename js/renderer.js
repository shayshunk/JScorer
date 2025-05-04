// Node and electron requirements
const { ipcRenderer } = require("electron");
var fs = require("fs");

// Get base score value
let base = 200;

// Grabbing HTML elements
let buttonValue,
  doubleOn = false,
  answerButton,
  singleJeopardy = true;

let scoreValue = 0,
  counter = 0;
let singleJeopardyData = [],
  doubleJeopardyData = [];

const scoreText = document.getElementById("Score");
const answerBtns = document.querySelectorAll(".answer-button"); // Gets buttons from main page initially

class GameHistory { //History of the game
  #index;           //Index, 0 at beginning, incremented with each answer
  #answerInfo;      //Data about each answer, see below
  #upToDate;        //Boolean to check if UNDO is in effect

  constructor() {
    this.#index = 0;
    this.#answerInfo = [];
    this.#upToDate = true;
    console.log(this.#index);
  }

  addAnswer(state, value, location, dailyDouble){
    const dataEntry = {
      state: state,             //0 default - 1 No Answer - 2 Correct - 3 Wrong, bucko
      value: value,             //Score of each answer, taken from button value
      location: location,       //Number (location) of each button, to restore/remove state from correct button
      dailyDouble: dailyDouble  //Is it a DD or no?
    };
    if(this.#upToDate){                         //Check if UNDO is in effect
      this.#answerInfo.push(dataEntry);   //Add the 4 values to the end of the array, 
    }
    else{
      this.#answerInfo[this.#index] = dataEntry;
    }
      console.log(this.#index);
    this.#index++;
    console.log(this.#index);           //Debug info, can erase later
    console.log(this.#answerInfo[this.#index - 1]); //Debug
  }

  undo(){
    console.log("Undo Clicked.");
    this.#upToDate = false;
    this.#index--;
    return this.#answerInfo[this.#index];
  }

  redo(){
    console.log("Redo clicked.");
    const returnInfo = this.#answerInfo[this.#index];
    this.#index++;
    return returnInfo;
  }

  reset(){
    this.#index = 0;
    this.#answerInfo = [];
    console.log("Reset game history.")
  }

  upToDate(){
    if(this.#answerInfo.length === this.#index){
      console.log(this.#answerInfo.length);
      console.log(this.#index);
      this.#upToDate = true;
      return this.#upToDate;
    }
  }

}

const gameHistory = new GameHistory();

answerBtns.forEach((btn) => {
  // Assigning button ids
  btn.id = counter;
  counter++;

  // Intializing data array
  singleJeopardyData.push({
    answer: 0,
    double: false,
  });

  doubleJeopardyData.push({
    answer: 0,
    double: false,
  });

  // On click
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
    answerButton = btn; // Store the clicked button (could be main or DJ)
  });
});

// Loading
loadFile();

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

const redoBtn = document.getElementById("redoBtn");
const undoBtn = document.getElementById("Undo");

// Load most recent file
async function loadFile() {
  await loadSingleJeopardyFile();
  await loadDoubleJeopardyFile();
}

async function updateScore() {
  // Updating score
  scoreText.textContent = "Score: $" + scoreValue;
}

async function loadSingleJeopardyFile() {
  if (fs.existsSync("SingleJeopardyData.txt")) {
    // Converting txt to JSON
    fs.readFile("SingleJeopardyData.txt", "utf8", (err, jeopardyData) => {
      if (err) {
        console.log(err);
        return;
      }

      // Grabbing data
      const data = JSON.parse(jeopardyData);

      // Iterate through buttons
      data.forEach((clue, index) => {
        // Updating array
        singleJeopardyData[index].answer = clue.answer;
        singleJeopardyData[index].double = clue.double;

        if (clue.answer != 0) {
          button = document.getElementById(index);
          button.style.visibility = "hidden";

          if (clue.answer == 2) {
            scoreValue += (Math.floor(index / 6) + 1) * base;
          } else if (clue.answer == 3 && clue.double == false) {
            scoreValue -= (Math.floor(index / 6) + 1) * base;
          }
        }
      });
      updateScore();
    });
  }
}

async function loadDoubleJeopardyFile() {
  if (fs.existsSync("DoubleJeopardyData.txt")) {
    // Converting txt to JSON
    fs.readFile("DoubleJeopardyData.txt", "utf8", (err, jeopardyData) => {
      if (err) {
        console.log(err);
        return;
      }

      // Grabbing data
      const data = JSON.parse(jeopardyData);

      // Iterate through buttons
      data.forEach((clue, index) => {
        doubleJeopardyData[index].answer = clue.answer;
        doubleJeopardyData[index].double = clue.double;

        if (clue.answer != 0) {
          if (clue.answer == 2) {
            scoreValue += (Math.floor(index / 6) + 1) * base * 2;
          } else if (clue.answer == 3 && clue.double == false) {
            scoreValue -= (Math.floor(index / 6) + 1) * base * 2;
          }
        }
      });
      updateScore();
    });
  }
}

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

    gameHistory.addAnswer(2, buttonValue, answerButton.id, doubleOn);  //Add correcrt answer to history

    // Updating array
    if (singleJeopardy) {
      singleJeopardyData[answerButton.id].answer = 2;
      singleJeopardyData[answerButton.id].double = doubleOn;
    } else {
      doubleJeopardyData[answerButton.id].answer = 2;
      doubleJeopardyData[answerButton.id].double = doubleOn;
    }

    if (modal) {
      modal.style.display = "none";
    }
    if (answerButton) {
      answerButton.style.visibility = "hidden"; // Hide the specific button clicked (main or DJ)
    }
    if (doubleButton) {
      doubleButton.className = "double-button";
    }
    doubleOn = false;

    // Saving
    saveFile();
  });
}

if (wrongButton) {
  wrongButton.addEventListener("click", () => {
    if (doubleOn === false) {
      //No deductions for incorrect DD with Coryat scoring
      if (scoreValue - buttonValue < 0) {
        scoreText.textContent =
          "Score: -$" + Math.abs(scoreValue - buttonValue);
      } else {
        scoreText.textContent = "Score: $" + (scoreValue - buttonValue);
      }
      scoreValue = scoreValue - buttonValue;
    }

    gameHistory.addAnswer(3, buttonValue, answerButton.id, doubleOn);

    // Updating array
    if (singleJeopardy) {
      singleJeopardyData[answerButton.id].answer = 3;
      singleJeopardyData[answerButton.id].double = doubleOn;
    } else {
      doubleJeopardyData[answerButton.id].answer = 3;
      doubleJeopardyData[answerButton.id].double = doubleOn;
    }

    if (modal) {
      modal.style.display = "none";
    }
    if (answerButton) {
      answerButton.style.visibility = "hidden";
    }
    if (doubleButton) {
      doubleButton.className = "double-button";
    }
    doubleOn = false;

    // Saving
    saveFile();
  });
}

if (noAnswerButton) {
  noAnswerButton.addEventListener("click", () => {

    gameHistory.addAnswer(1, buttonValue, answerButton.id, doubleOn);

    // Updating array
    if (singleJeopardy) {
      singleJeopardyData[answerButton.id].answer = 1;
      singleJeopardyData[answerButton.id].double = doubleOn;
    } else {
      doubleJeopardyData[answerButton.id].answer = 1;
      doubleJeopardyData[answerButton.id].double = doubleOn;
    }

    if (modal) {
      modal.style.display = "none";
    }
    if (answerButton) {
      answerButton.style.visibility = "hidden";
    }
    if (doubleButton) {
      doubleButton.className = "double-button";
    }
    doubleOn = false;

    // Saving
    saveFile();
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    // Reset score
    scoreValue = 0;
    scoreText.textContent = "Score: $0";
    gameHistory.reset();

    redoBtn.style.visibility = "hidden";

    // Go back to single jeopardy
    if (!singleJeopardy) {
      showDoubleJeopardy();
    }

    // Show all buttons
    answerBtns.forEach((btn) => {
      btn.style.visibility = "visible";
      singleJeopardyData[btn.id].answer = 0;
      singleJeopardyData[btn.id].double = false;
      doubleJeopardyData[btn.id].answer = 0;
      doubleJeopardyData[btn.id].double = false;
    });

    // Saving
    saveFile();
  });
}

if (doubleButton) {
  doubleButton.addEventListener("click", () => {
    doubleButton.className =
      doubleButton.className == "double-clicked"
        ? "double-button"
        : "double-clicked";
    doubleOn = doubleButton.className == "double-clicked" ? true : false;
  });
}

//Function for Undo button and Redo button

function undoButton(){
  const undoEntry = gameHistory.undo();             //Return the last entry in the gameHistory array
  if(undoEntry != null){                            //Error check
    if(undoEntry.state == 2){
      scoreValue = scoreValue - undoEntry.value;    //Deduct the .value entry for a correct response
    }
    if(undoEntry.state == 3){
      scoreValue = scoreValue + undoEntry.value;    //Add .value for wrong response
    }
    //console.log(undoEntry);                         //Debug
    updateScore();                                  //Update the score

    const revealButton = document.getElementById(undoEntry.location);
    revealButton.style.visibility = "visible";  //Make the previous button visible again
    redoBtn.style.visibility = "visible";
  }
  else return;

}

function redoButton(){
  const redoEntry = gameHistory.redo();
  if(redoEntry != null) {
    if(redoEntry.state == 2){
      scoreValue = scoreValue + redoEntry.value;    //Add the .value entry for a correct response
    }
    if(redoEntry.state == 3){
      scoreValue = scoreValue - redoEntry.value;    //Deduct .value for wrong response
    }
    updateScore();

    const revealButton = document.getElementById(redoEntry.location);
    revealButton.style.visibility = "hidden";  //Make the previous button visible again
    if(gameHistory.upToDate()){
      redoBtn.style.visibility = "hidden";
    }
  }
  else{
    redoBtn.style.visibility = "hidden";      //Should never trigger
    return;
  }

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
      // Checking if button already clicked in other round
      if (doubleJeopardyData[btn.id].answer == 0) {
        btn.style.visibility = "visible";
      } else {
        btn.style.visibility = "hidden";
      }
    } else {
      btn.textContent = "$" + value * 0.5;
      // Checking if button already clicked in other round
      if (singleJeopardyData[btn.id].answer == 0) {
        btn.style.visibility = "visible";
      } else {
        btn.style.visibility = "hidden";
      }
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

function saveFile() {
  // JSONify
  const singleJSON = JSON.stringify(singleJeopardyData);
  const doubleJSON = JSON.stringify(doubleJeopardyData);

  // Save to file
  fs.writeFile("SingleJeopardyData.txt", singleJSON, function (err) {
    if (err) {
      console.log(err);
    }
  });
  fs.writeFile("DoubleJeopardyData.txt", doubleJSON, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

// Listener for the button that OPENS the DJ modal
if (openDoubleJeopardyBtn) {
  openDoubleJeopardyBtn.addEventListener("click", showDoubleJeopardy);
} else {
  console.error("Button with ID 'openDoubleJeopardyBtn' not found.");
}

// Listener for the Undo and Redo buttons
if (undoBtn) {
  undoBtn.addEventListener("click", undoButton);
} else {
  console.error("Button with ID 'undoBtn' not found.");
}

if (redoBtn) {
  redoBtn.addEventListener("click", redoButton);
  redoBtn.style.visibility = "hidden";
} else {
  console.error("Button with ID 'redoBtn' not found.");
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
