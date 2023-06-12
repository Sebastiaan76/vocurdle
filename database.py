import sqlite3

def get_word_value(word):
    conn = sqlite3.connect("words.db")
    c = conn.cursor()
    c.execute("SELECT game_score FROM words WHERE word = ?", (word.lower(),))
    result = c.fetchone()
    conn.close()

    if result:
        return result[0]
    else:
        return None
