// select our main-container HTML element and define events to listen for
const forms = document.querySelector('.main-container');
const bubble_events = ['click', 'mousedown', 'input', 'keydown', 'touchstart'];
const nobubble_events = ['blur', 'focus'];
const firstInput = document.getElementById("1");
const wordLength = 5; // 5 letter words
const gameLength = 25; // 5 words per game === 25


// variables we track to do 'stuff'
let lastFocusedInput = null;
let tried_words = [];
let current_word = "";
let start_index = 1;

// set focus on the first form element - first letter of first word
if(firstInput) {
    firstInput.focus();
    firstInput.click();
    lastFocusedInput = firstInput;
}


/* Set up Event Listeners */
// listen to bubbling events
bubble_events.forEach(e => {
    forms.addEventListener(e, eventDelegate);
});

// listen to non-bubbling events
nobubble_events.forEach(e => {
    forms.addEventListener(e, eventDelegate, true);
});


/* *** Function Declarations *** */
// Event Delegation - route the various events captured to the right handlers
function eventDelegate(e) {
    const targetElement = e.target;
    // if we are flipped on a login, register form etc, we don't want the usual event handling as we need
    // users to be able to enter form data
    if (menu_flip.style.transform === "rotateY(180deg)"){
        return;
    }
    lastFocusedInput.focus(); // catch all to ensure if user clicks off the board we re-focus where we were

    // lets keep the event capturing to our input form fields
    if (targetElement.tagName.toLowerCase() === 'input') {
        switch (e.type) {
            case 'input':
                userInput(e); // filter alpha only + make uppercase
                break;
            case 'keydown':
                if (e.key === 'Tab') stopDefault(e); // if it's TAB don't allow
                keyDown(e); // send key to keyDown for further processing
                break;
            case 'mousedown':
            case 'click':
            case 'touchstart':
                stopDefault(e); // no clicking randomly. Keep on the game board
                break;
            default:
                break;
        }
    }
}

// Stop Default mouse/tab - we don't want users clicking off the game by accident or tabbing
function stopDefault(e) {
    if (e.type === 'mousedown' ||
        e.type === 'click' ||
        e.type === 'touchstart' ||
       (e.type === 'keydown' && e.key === 'Tab')
       ){
        e.preventDefault();
        }
    }

    
// Keydown Handler
function keyDown(e) {
    //Handle Enter
    if (e.type === 'keydown' && e.key === 'Enter'){
        // if we are at the end of rows 1 thru 4 wait for ENTER and submit the word
        if (e.target.value.length === 1 && parseInt(e.target.id) % wordLength === 0 && parseInt(e.target.id) < gameLength ){
                submitWord(start_index);
                start_index = parseInt(e.target.id) + 1;
                lastFocusedInput = document.getElementById((parseInt(e.target.id) + 1).toString());
                lastFocusedInput.focus();
        }
        // if we are on the last tile, submit word and end the game
        else if (e.target.value.length === 1 && parseInt(e.target.id) === gameLength){
                submitWord(start_index);
                start_index = 21;
        }
    } else if (e.type === 'keydown' && e.key === 'Backspace'){
            if (parseInt(e.target.id) > start_index){ // as long as we aren't on the very last tile
                if (lastFocusedInput.value === ""){ // as long as the current tile is empty - we jump back
                    lastFocusedInput = document.getElementById((parseInt(e.target.id) - 1).toString());
                    lastFocusedInput.value = "";
                    lastFocusedInput.select();
                }     
            }
        }
}

// User Input - input alpha chars only and advance letter input
function userInput(e) {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    e.target.value = value; // filter non-alpha and set to uppercase

    // move the tile focus with every keypress until the last tile in the row ( mod 5 = 0 )
    if (e.target.value.length === 1 && parseInt(e.target.id) % wordLength != 0 && parseInt(e.target.id) < gameLength){
        lastFocusedInput = document.getElementById((parseInt(e.target.id) + 1).toString());
        lastFocusedInput.focus();
    }
}

// convenience function to submit a completed word - relies on the start index being updated from 1 to 6 to 11 to 16 to 21 as we build
async function submitWord(start_index) {
    current_word = "";
    for (let i = start_index; i <= (start_index + 4); i++ ){
        current_word += document.getElementById(i.toString()).value.toLowerCase();
    }
    if (await checkWord(current_word)) { // checkWord() function lives in game.js
        tried_words.push(current_word);
        // check if we already have 5 words - if so - end game
    if ( tried_words.length === 5) {
        gameOver();
      }
    }  
}