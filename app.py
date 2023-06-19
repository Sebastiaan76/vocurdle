from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from database import get_word_value
import random
import sqlite3

app = Flask(__name__)
app.config['SECRET_KEY'] = '4057f3e7e0e47e2cb466041afe9181e20297576ba16cb1d6b184982ba3b8821b'
app.debug = True
# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
def vocurdle():
    info = get_letters()
    while info["num_of_words"] < 40: # ensure we get a list big enough to give the player a chance
        info = get_letters()
    
    words_tuple = info["words_tuple"]
    potential_score = info["potential_score"]
    required_letters = info["required_letters"]

    # check if there is an active session, and if so, send the user_id
    if session:
        logged_in = session["user_id"]
    else:
        logged_in = ""

    return render_template("index.html", still_logged_in=logged_in, words_tuple=words_tuple, potential_score=potential_score, start_letter=required_letters[0], vowel_letter=required_letters[1])

@app.route("/update_stats", methods=["POST"])
def update_stats():    
    if request.method == "POST":
        word = request.form.get("word")
        game_score = get_word_value(word)

        return 200

@app.route("/gameover", methods=["POST"])
def gameover():
    if request.method == "POST":
        # read the JSON
        data = request.get_json()
        score = data["score"]
        
        # lets update the database
        conn = sqlite3.connect("words.db")
        c = conn.cursor()

        # update the users game count++
        c.execute("UPDATE users SET games_played = games_played + 1 WHERE user_id = ?", (session["user_id"],))
        conn.commit()

        # check if this is their best score so far, if so, update it
        c.execute("UPDATE users SET highest_score = ? WHERE user_id = ? AND highest_score < ?", (score, session["user_id"], score))
        conn.commit()

        # Update the cumulative score
        c.execute("UPDATE users SET cumulative_score = cumulative_score + ? WHERE user_id = ?", (score, session["user_id"]))
        conn.commit()

        conn.close()


        return jsonify({'message': 'data received'})



@app.route("/calculate", methods=["POST"])
def calculate():    
    if request.method == "POST":
        word = request.form.get("word")
        game_score = get_word_value(word)

        return jsonify({'game_score': game_score}), 200

@app.route('/logout', methods=["POST"])
def logout():
    if request.method == "POST":
        data = request.get_json()
        if data["logout"] == "true":
            logging_out = session["user_id"]
            session.clear()
            return jsonify({'message': f'user {logging_out} logged out'})


@app.route("/login", methods=["GET", "POST"])
def login(): 
    if request.method == "POST":
        session.clear()
        user_id = request.form.get("user_id")
        password = request.form.get("password")

        # Ensure username was submitted
        if not request.form.get("user_id"):
            return jsonify({'message': "Enter User id"}), 400

        # Ensure password was submitted
        elif not request.form.get("password"):
            return jsonify({'message': "Enter Password"}), 400

        conn = sqlite3.connect("words.db")
        c = conn.cursor()
        c.execute("SELECT user_id, password FROM users WHERE user_id = ?", (user_id,))
        row = c.fetchone()
        if not row:
            return jsonify({'message': 'User not found'}), 400
        # Ensure username exists and password is correct
        if len(row) != 2 or not check_password_hash(row[1], request.form.get("password")):
            return jsonify({'message': "Invalid Username/Password"}), 400

        # Remember which user has logged in
        session["user_id"] = row[0]
        conn.close()

        # User is logged in
        return jsonify({'message': f'User {user_id} Logged In', 'logged_in': 'true', 'user_id': f'{user_id}'}), 200

    else:
        return jsonify({'message': "Error"}), 400

@app.route("/register", methods=["POST"])
def register():
    if request.method == "POST":
        user_id = request.form.get("user_id")
        hashed_password = generate_password_hash(request.form.get("password"))
        pass_conf = request.form.get("pass_conf")
        
        if not user_id:
            return jsonify({'message': "Enter a username"}), 400

        # Ensure password was submitted
        elif not hashed_password:
            return jsonify({'message': "Enter a password"}), 400
        
        # Ensure confirmation password was submitted
        elif not pass_conf:
            return jsonify({'message': "Confirm Password"}), 400
        
        # check if they match
        if pass_conf != request.form.get("password"):
            return jsonify({'message': "Passwords don't match"}), 400
        # Database stuff
        conn = sqlite3.connect("words.db")
        c = conn.cursor()
        c.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
        row = c.fetchone()
        # check if the user exists
        if row is not None:
            conn.close()
            return jsonify({'message': "User already exists"}), 400

        c.execute("INSERT INTO users (user_id, password, games_played, highest_score, cumulative_score) VALUES (?, ?, ?, ?, ?)", 
              (user_id, hashed_password, 0, 0, 0))
        conn.commit()
        conn.close()
        
        return jsonify({'message': "Registered Succesfully!"}), 200

def get_letters():
    vowels = 'aeiou'
    letters = 'bcdfghjklmnpqrstvwxyz'
    required_letters = tuple((random.choice(letters), random.choice(vowels)))
    # get the list of the top 5 words and understand the perfect score potential
    conn = sqlite3.connect("words.db")
    c = conn.cursor()
    like_pattern = f"{required_letters[0]}%{required_letters[1]}%"
    c.execute("SELECT word, game_score FROM words WHERE word LIKE ? ORDER BY game_score DESC LIMIT 5", (like_pattern,))
    rows = c.fetchall()
    # sum up the total possible scores - this is the theoretical max a player could achieve if they got the top 5 words
    potential_score = 0
    for row in rows:
        potential_score += row[1]
    c.execute("SELECT COUNT(*) FROM words WHERE word LIKE ?", (like_pattern,))
    num_of_words = c.fetchone()[0]
    conn.close()

    return {"words_tuple": rows ,"required_letters": required_letters, "potential_score": potential_score, "num_of_words": num_of_words}