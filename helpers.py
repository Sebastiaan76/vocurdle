from datamuse import Datamuse
import time
import csv
import sqlite3

# function to take list of words in \n delimited text file and create a CSV with the word and it's frequency per 1M words
# as determined by datamuse api. 
# example result from datamuse: [{'word': 'thick', 'score': 65889, 'tags': ['f:29.603049']}] - note tags key is a list
def get_frequency(source, dest, request_per_second):
    rps = 1 / request_per_second
    api = Datamuse()
    with open(source, "r") as in_file:
        with open(dest, "w") as out_file:
            for w in in_file:
                w = w.rstrip()
                print(f"sending word {w}")
                result = api.words(sp=w, md="f", max=1)
                print(result)
                if not result:
                    print(f"no result for word: {w} at all - skipping")
                    continue
                d = result[0]
                if d["word"] != w:
                    print(f"the word {w} doesn't seem to exist on Datamuse. Skipping")
                    continue
                f_value = d['tags'][0].split(':')[1]  # Access the value of 'f' from the list
                out_file.write(f"{d['word']},{f_value}\n")
                time.sleep(rps)

# quick function to find the highest 'f' tag ( word frequency ) in the word list. 
# need this to figure out how to normalise the scores now.
def find_highest(file):
    highest = {'word': '', 'raw_score': 0}
    with open(file, 'r') as f:
        reader = csv.DictReader(f, fieldnames=['word', 'raw_score'])
        for row in reader:
            if float(row['raw_score']) > float(highest['raw_score']):
                highest.update({"word": row['word'], "raw_score": row["raw_score"]})
    return highest

# already know from the above function that 1901 is the highest
def find_lowest(file):
    lowest = {'word': '', 'raw_score': 1901}
    with open(file, 'r') as f:
        reader = csv.DictReader(f, fieldnames=['word', 'raw_score'])
        for row in reader:
            if float(row['raw_score']) < float(lowest['raw_score']):
                lowest.update({"word": row['word'], "raw_score": row["raw_score"]})
    return lowest

# function to apply a standard scrabble score as the basis for our final score
def word_score(word):
    scrabble_letter_scores = {
        'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4, 'i': 1, 'j': 8, 'k': 5, 'l': 1, 'm': 3,
        'n': 1, 'o': 1, 'p': 3, 'q': 10, 'r': 1, 's': 1, 't': 1, 'u': 1, 'v': 4, 'w': 4, 'x': 8, 'y': 4, 'z': 10
    }
    scrabble_score = sum(scrabble_letter_scores.get(letter, 0) for letter in word.lower())
    
    return scrabble_score
# this function will take a words raw_score ( word frequency from datamuse ) and assign a multiplier
# smaller scores ( less common words ) get a larger multiplier. This is a non-scientific application based on...observing that data
# and noting that 90% of words score below 0.05
def get_multiplier(freq):
    multipliers = [
    (0.001, 20),
    (0.01, 15),
    (0.1, 10),
    (0.75, 7),
    (1, 5),
    (5, 3),
    (10, 2),
    (float('inf'), 1.2)  # This will cover all frequencies greater than 10
    ] 
    for limit, multiplier in multipliers:
        if freq < limit:
            return multiplier # returns the multiplier applicable to the word


# function to load the database from the word list, we include the game score for the word here too
# words from here: https://github.com/dwyl/english-words/blob/master/words_alpha.txt
def load_database(file):
    conn = sqlite3.connect('words.db')
    c = conn.cursor()
    data = {'word': "", 'raw_score': 0.0, 'game_score': 0}
    with open(file, "r") as f:
        reader = csv.DictReader(f, fieldnames=['word', 'raw_score'])
        for row in reader:
            data = {'word': row['word'], 'raw_score': float(row['raw_score']), 'game_score': (int(word_score(row['word']) * get_multiplier(float(row['raw_score']))))}
            c.execute("INSERT INTO words (word, raw_score, game_score) VALUES (:word, :raw_score, :game_score)", data)
            print(f"inserted {row['word']}")
        conn.commit()
        conn.close()





