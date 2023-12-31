// game logic
const scoreDiv = document.querySelector('.score');
const errorMsg = document.querySelector(".error-msg");
const scoreForms = document.querySelector('.form-container form');

// set up the scoreboard
scoreDiv.textContent = `Score: 0 | Potential: ${potential}`;
let score = 0;


async function checkWord(word) {
    let activeElement = document.activeElement; // get the currently active element
    currentForm = activeElement.closest('.form-container form'); // find the closest parent with the class .form-container (used for word score)

    // Check for required letter and vowel
    if (!word.startsWith(s_letter.toLowerCase()) || !word.includes(v_letter.toLowerCase())) {
        errorMsg.innerHTML = `Word must start with ${s_letter.toUpperCase()} and include ${v_letter.toUpperCase()}`;
        errorModal.show();
        setTimeout(function() {
        errorModal.close();
        resetForm();
    }, 2000);
        return false;
    }
    
    // check if word has already been entered
    if (tried_words.includes(word)) {
        errorMsg.innerHTML = "Already Tried Word";
        errorModal.show();
        setTimeout(function() {
          errorModal.close();
          resetForm();
      }, 2000); 
        return false;
      }

    // check for null score from server - if so, word not in dictionary
    const formData = new FormData();
    formData.append('word', word);
    
    // Await for the score to return - here we call our submitform
    const data = await submitForm(formData, '/calculate');
    const word_score = data.game_score; 

    if (word_score === null) {
        errorMsg.innerHTML = "Unknown Word";
        errorModal.show();
        setTimeout(function() {
          errorModal.close();
          resetForm();
      }, 2000); 
        
        return false;
      }
    
    // update overall game score 
    score += word_score;
    scoreDiv.textContent = `Score: ${score} | Potential: ${potential}`;
    
    // show individual word scores
    const wordScoreDiv = currentForm.querySelector('.word-score');
    wordScoreDiv.textContent = word_score; 

    // if all checks pass - return true
    return true;
}


// this function submits formData to the backend and returns a json response - route should be a string as '/<route>'
async function submitForm(formData, route) {
  try {
    const response = await fetch(route, {
      method: 'POST',
      body: formData
    });
    if (!response.ok && response.status !== 400) { // whilst 400's are errors, we want to capture the response
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;

  } catch (error) {
    console.error('Error:', error);
  }
}


// reset the form from the current ( unsubmitted word ) onward - edge case if user keeps typing before reset mitigated by that.
// this way we know how far back to reset the board after a duplicate, unknown, invalid word etc.
function resetForm() {
  // we use the tried_words array to infer what the current non-submitted word index is  
  const indexes = {0: 1, 1: 6, 2: 11, 3: 16, 4: 21}; // key: value is {array_length: index} i.e 0 words = index 1, 1 words = index 6
  start_index = indexes[tried_words.length];

  for (let i = start_index; i <= gameLength; i++ ){
      document.getElementById(i.toString()).value = '';
  }
  lastFocusedInput = document.getElementById(start_index.toString());
  lastFocusedInput.focus();
}


// helper function - disables all forms at the end of the game
function disableAllForms(){
  document.querySelectorAll("input").forEach(input => (input.disabled = true));
  document.activeElement.blur();
}


// this function is called with the game is over. It calls the backend and sends the score.
async function gameOver() {
  disableAllForms();
  const flip = document.querySelector(".flip-card-inner");
  flip.style.transform = "rotateY(180deg)";
  flipped = true;
  const game_over = document.querySelector(".flip-card-back");
  try {
    const end_game = await sendData('/gameover', {'score': score});
    const wordList = end_game.data.top_words.map(word => `<p>${word[0]} for ${word[1]} points</p>`).join('');
    game_over.innerHTML = 
  `<div class=stats><h1>Game Over</h1>
  <p> The top 5 words were:</p><br>
  <p>${wordList}</p><br></div>
  <button class="reset-button" onclick="location.reload()">Restart Game</button>`;
  } catch (error) {
    console.error('Error:', error);
  }
}

// generic function used to send non-form data to the backend using JSON
async function sendData(url = '', data = {}) {
  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  });

  if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
  }

  const json = await response.json();
  return {
      status: response.status,
      data: json
  };
}


// function to logout the user
async function logout() {
  try {
    const confirm = await sendData('/logout', {'logout': 'true'});
    console.log(confirm.data["message"]);
    logged_in.innerHTML = "";
    user_id = "";
  } catch (error) {
      console.error('Error:', error);
  }
}

// function to retrieve user stats
async function get_stats() {
  try {
    const user_stats = await sendData('/stats', {'message': 'get_stats'});
    const games_played = user_stats.data[0];
    const highest_score = user_stats.data[1];
    const cumulative_score = user_stats.data[2];
    const average_score = Math.round(cumulative_score / games_played);
    if (user_stats.data.message === "no user logged in"){
      htmlContent = `<h1>Stats</h1><br>
      <div class = stats>Login to see your Statistics</div>
      <button type="button" class="reset-button" onclick="flip()">Close</button>`;
    } else {
      htmlContent = `<h1>Stats</h1><br>
      <div class = stats>
      <p>Games Played: ${games_played}</p>
      <p>Highest Score: ${highest_score}</p>
      <p>Average Score: ${average_score}</p>
      </div>
      <button type="button" class="reset-button" onclick="flip()">Close</button>`;
    }
    return htmlContent;

  } catch (error) {
    console.error('Error:', error);
  }
}