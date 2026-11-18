//---------------------------------Cached Elements--------------------------------
const tiles = document.querySelectorAll(".game-board > div > div");
const keyboard = document.querySelector(".on-screen-keyboard");
const keys = document.querySelectorAll(".keyboard-row button");
const instructions = document.querySelector(".instructions");
const reset = document.querySelector("#reset");
const help = document.querySelector("#help");
const video = document.querySelector("#video");
const audio = document.querySelector("#audio");
const message = document.querySelector("#message");

//-----------------------------Constants-------------------------------------
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const maxGuesses = 5;
const wordLength = 5;

//------------------------------Variables----------------------------------------

let words = [];
let previousGuesses = [];
let answer;
let guess;
let row;
let finished = true;

//---------------------------------functions-----------------------------
function start() {
  if (words.length === 0) {
    return;
  }
  answer = words[Math.floor(Math.random() * words.length)];
  previousGuesses = [];
  guess = "";
  row = 0;
  finished = false;
  message.textContent = "Guess the five-letter word!";

  tiles.forEach((tile) => {
    tile.textContent = "";
    tile.classList.remove("correct", "present", "absent");
  });

  keys.forEach((key) => {
    key.classList.remove("correct", "present", "absent");
  });
  console.log(answer);
}

//handling input
function handleKey(key) {
  if (finished) {
    return;
  }
  if (key === "enter") {
    if (guess.length === wordLength) {
      checkGuess();
    }
  } else if (key === "backspace") {
    if (guess.length > 0) {
      guess = guess.slice(0, -1);
      render();
    }
  } else if (
    key.length === 1 &&
    alphabet.includes(key) &&
    guess.length < wordLength
  ) {
    guess += key;
    render();
  }
}

//display current guess
function render() {
  for (let i = 0; i < wordLength; i++) {
    const index = row * wordLength + i;

    if (guess[i]) {
      tiles[index].textContent = guess[i].toUpperCase();
    } else {
      tiles[index].textContent = "";
    }
  }
}
function checkGuess() {
  if (!words.includes(guess)) {
    message.textContent = "Invalid word! Try again.";
    return;
  }
  if (previousGuesses.includes(guess)) {
    message.textContent = "You already guessed this word!";
    return;
  }
  previousGuesses.push(guess);
  message.textContent = "";
  const result = ["absent", "absent", "absent", "absent", "absent"];
  const used = [false, false, false, false, false];
  //correct position

  for (let i = 0; i < wordLength; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  //wrong position
  for (let i = 0; i < wordLength; i++) {
    if (result[i] !== "correct") {
      for (let j = 0; j < wordLength; j++) {
        if (guess[i] === answer[j] && !used[j]) {
          result[i] = "present";
          used[j] = true;
          break;
        }
      }
    }
  }

  for (let i = 0; i < wordLength; i++) {
    const index = row * wordLength + i;

    tiles[index].classList.add(result[i]);
    updateKey(guess[i], result[i]);
  }
  checkWinner();
}

function updateKey(letter, result) {
  keys.forEach((key) => {
    if (key.textContent.toLowerCase() === letter) {
      if (result === "correct") {
        key.classList.remove("present", "absent");
        key.classList.add("correct");
      } else if (result === "present" && !key.classList.contains("correct")) {
        key.classList.remove("absent");
        key.classList.add("present");
      } else if (
        result === "absent" &&
        !key.classList.contains("correct") &&
        !key.classList.contains("present")
      ) {
        key.classList.add("absent");
      }
    }
  });
}
//check win or loss
function checkWinner() {
  if (guess === answer) {
    finished = true;
    message.textContent = "Congratulations! You won!";
    return;
  }

  row++;
  guess = "";

  if (row === maxGuesses) {
    finished = true;
    message.textContent = "Game over! The word was " + answer.toUpperCase();
  } else {
    message.textContent = "Attempts remaining: " + (maxGuesses - row);
  }
}
// Show or hide instructions
function toggleHelp() {
  if (instructions.style.visibility === "hidden") {
    instructions.style.visibility = "visible";
  } else {
    instructions.style.visibility = "hidden";
  }
}
//---------------------Event listeners---------------------

reset.addEventListener("click", start);

help.addEventListener("click", toggleHelp);

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === "Backspace") {
    event.preventDefault();
  }
  handleKey(event.key.toLowerCase());
});
keyboard.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") {
    handleKey(event.target.textContent.toLowerCase());
  }
});

//------------------Load JSON---------------------------

// Request the word list from the JSON file
fetch("./js/words.json")
  // Convert the JSON response into a js array
  .then((response) => response.json())
  .then((data) => {
    words = data; // Store the loaded words in the words array
    start(); // Start the game after the words finish loading
  })
  // Handle errors if loading or processing fails
  .catch(() => {
    message.textContent = "Failed to load the word list!";
  });
