# **Vocurdle - A Vocabulary based word game**

**Video Demo:** [https://youtu.be/67y28d_k8sk  ](https://youtu.be/67y28d_k8sk)

**Description:** Vocurdle is a vocabulary based word game with a similar look and feel to 'Wordle'.

## **Overview:**  

The premise of the game is to guess five words, each having 5 letters. There are two constraints  

on the player. One is that the word must start with the **'Start Letter'** and the second that it must  

contain the **'Required vowel'** somewhere. These two letters are chosen at random by the game on initial page load.

Each word has an individual score. More obscure words using less common letters are scored higher.  There is a theoretical '**max score**' per game depending on what the two constraint letters are.

The game allows a player to register an account, to login and to logout as well as tracking statistics over multiple games. Player sessions also survive browser refreshes.

The game is essentially a single page application, and after the initial page load, no other refreshes happen. All updates are done dynamically via Javascript communicating with the backend via POST requests. There is also a bunch of behavior coded in javascript to do with the way the input forms behave. Things like auto-focus of the current letter, auto advancing forms when a user enters a letter, similar for backspacing, ‘locking’ of a form when a word has been submitted etc. The letter grid is ‘double sided’ and things like login, logout, registration and stats dialogs appear on the reverse side. This creates a nice use of screen real estate, and looks great with the ‘flip’ animation behavior. This is better seen in the video demo. \


## **Game Data - The Word List.**

A word list of 5 letter words was obtained here: [https://github.com/dwyl/english-words/blob/master/words_alpha.txt  ](https://github.com/dwyl/english-words/blob/master/words_alpha.txt)

This word list was then run through the Datamuse API here: [https://www.datamuse.com/api/ ](https://www.datamuse.com/api/) 

The reason for using the Datamuse API was primarily to get the _'word frequency' _meta-data.  

Any word that didn't have this data was 'washed' out of the word list, this resulted in approximately 13k words.

This task was performed by the ```get_frequency()``` function in the ```helpers.py``` file. 

I chose to do this once in the building of the game vs dynamically as a player played. This was deliberate to keep the game fast, and I figured there wasn’t much point doing it ‘lazily’ or risking the same words constantly being requested from the api by multiple players.

Project Structure and Backend functionality.

The project has the following file structure: \
.

├── app.py

├── helpers.py

├── README.md

├── static

│   ├── forms.js

│   ├── game.js

│   ├── icons/

│   ├── images/

│   ├── modals.js

│   └── style.css

├── templates

│   ├── index.html

│   └── layout.html

└── words.db

**app.py** is the main Flask file and contains all the routes needed. A GET request to the main route instantiates the game by running the ```get_letters()``` function which generates the starting letter and vowel at random. It then checks against the word list for all the words that match the constraint. We ensure that the player has a pool of at least 40 words. We then send a bunch of variables to the template.  \
 \
All other game communication with the backend from here is done in Javascript via post requests so there are no other page loads ( it’s a single page app ). \
 \
We have the following routes and their uses: \
**/** - the main route which loads the game by calling the ```vocurdle()``` function.

**/stats** - queries the database and returns player statistics in a JSON response.

**/gameover** - at game end stores the players stats in the database and also returns the top words the player could have got so the player can learn for next time.

**/calculate** - this route calculates the word score and returns it to the game it’s called on each word submission.

**/register** - creates a new user.

**/login** - logs in a registered user and creates the session.  

**/logout** - logs out the user and clears the session.

There are 2 helper functions in app.py that are called from other routes - I broke these out to avoid cluttering the route function. 

```get_letters()``` which generates the letters as well as the top 5 possible words ( and therefore top potential score ). \
 \
```get_word_value()``` which returns the score for a given word.

There is also the **helpers.py **file, which isn't used for the game itself, but instead contains functions used to create the word list and word scores and load them into the Database.

This was helpful when designing the game, and I felt warranted inclusion as it presented its own challenges. \
 \
The word scoring is done in 2 ways. First, we apply the words Scrabble score using ```word_score()```. We then apply a multiplier based on the Datamuse word frequency score. The less frequent the word, the bigger the multiplier. This was actually quite a difficult thing to do, as the frequency score range was between 0 to 1,901, however the huge majority of words had scores between 0.001 and 0.01, i.e. it’s not an even distribution. So hence the approach of using ‘bands’ and applying a multiplier.  \
 \
This ends up imperfect, but quite valid with common words scoring lower than uncommon words.

## **Database:**

The Database has two tables:  \
Words table with following example schema:


<table>
  <tr>
   <td><strong>word</strong>
   </td>
   <td><strong>raw_score</strong>
   </td>
   <td><strong>game_score</strong>
   </td>
  </tr>
  <tr>
   <td>computer
   </td>
   <td>0.00633
   </td>
   <td>120
   </td>
  </tr>
  <tr>
   <td>science
   </td>
   <td>0.00321
   </td>
   <td>80
   </td>
  </tr>
</table>


**Word** is self-explanatory.

**Raw_score** is the datamuse word frequency score in raw form

**Game_score** is the derived score used by adding the scrabble score + (multiplier * raw_score)

The users table has the following schema which should be self-explanatory: 



<table>
  <tr>
   <td><strong>user_id</strong>
   </td>
   <td><strong>games_played</strong>
   </td>
   <td><strong>highest_score</strong>
   </td>
   <td><strong>cumulative_score</strong>
   </td>
   <td><strong>password</strong>
   </td>
  </tr>
  <tr>
   <td>cs@50.com
   </td>
   <td>50
   </td>
   <td>1375
   </td>
   <td>3234757
   </td>
   <td>pbkdf2:sha256
   </td>
  </tr>
  <tr>
   <td>d@vid.com
   </td>
   <td>2
   </td>
   <td>1220
   </td>
   <td>3200
   </td>
   <td>pbkdf2:sha256
   </td>
  </tr>
</table>



## **HTML / CSS / Javascript**

**HTML:**  
There are 2 templates. The main ‘layout.html’ which uses CSS FlexBox and is the overall structure. Then we have index.html which contains the Forms which make up the boxes that users enter letters into. The entire app is responsive and looks good on both Desktop, Ipad and Phone.  

**CSS:**  
I spent a significant amount of time learning more about CSS layouts (i.e. Flexbox), media queries for responsive design, animation, units (i.e. ems, px etc ). I did a bunch of Youtube tutorials, googling and spent time on W3C and trial and error on codepen.io. I actually enjoyed this part of the process and probably spent way longer on it than I needed - but I learned a bunch! I’m particularly happy with the Sidenav pop-out animation and the Card Flip dynamic to maximize the use of screen space.

**Javascript:**  
Hands down, this is where the bulk of the work and time was spent (weeks). The Javascript content covered in CS50 is, by design introductory, and I wanted to go much deeper. So I spent time doing a Udemy course on Javascript + various Youtube tutorials as well as googling and spending time on MDN.  \
 \
During this process I learned not only about Javascript, but the DOM. Key concepts that I found interesting and necessary were Event Handling ( bubbling and non-bubbling events ), different methods for defining functions and things like function hoisting, as well as Javascript Promises and the more modern (and my preferred) async and await functionality which is used throughout this project.  

The Javascript is more or less logically separated into: \
**Modals.js** - functions pertaining to the menus and their associated content

**Forms.js** - functions that handle the behavior and submission of the input forms that the player interacts with to enter the words. There is in fact an incredible amount of work that went into this and I spent a few weeks on this alone. I wanted to have Focus on the specific form field the user was at, I had to disable default behavior of Tab and backspace and a bunch of other stuff that is better seen in the video.

**Game.js** - This file contains all the functionality relating to the game itself, and communicating with the backend for things like the word scores etc.
