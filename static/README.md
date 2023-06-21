# VOCURDLE - Vocabulary based word game
#### Video Demo:  <URL HERE>
#### Description: Vocurdle is a vocabulary based word game with a similar look and feel to 'Wordle'.  


The premise of the game is to guess five words, each having 5 letters. There are two constraints  
on the player. One is that the word must start with the 'Start Letter' and the second that it must  
contain the 'required vowel' somewhere. These to letters are chosen at random by the game.

  
Each word has an individual score. More obscure words using less common letters are scored higher.  
There is a theoretical 'max score' per game depending on what the two constraint letters are.

  
The game allows a player to register an account, to login and to logout as well as tracking statistics  
over multiple games.

  
## How and where did the word list come to be?

  
A word list of 5 letter words was obtained here: https://github.com/dwyl/english-words/blob/master/words_alpha.txt  
This word list was then run (over 4 hours) through the Datamuse API here: https://www.datamuse.com/api/  

  
The reason for using the Datamuse API was primarily to get the 'word frequency' meta-data.  
Any word that didn't have This data was 'washed' out of the word list, this resulted in approxmately 13k words.

  
This task was performed by the ```get_frequency()``` function in the ```helpers.py``` file.  



