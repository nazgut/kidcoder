"""KidCoder – Flask backend for kids coding portal."""

import json
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from game_data import LEVELS, LOGIC_PUZZLES, TYPING_LESSONS, QUIZ_QUESTIONS, MEMORY_PAIRS, THINKING_EXERCISES, CROSSWORD_PUZZLES

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# ---------- helpers ----------

def _progress_path(username: str) -> str:
    safe = "".join(c for c in username if c.isalnum() or c in "_-")
    if not safe:
        safe = "anonymous"
    return os.path.join(DATA_DIR, f"{safe}.json")


def _load_progress(username: str) -> dict:
    path = _progress_path(username)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"username": username, "completed": [], "stars": {}, "current_level": 1,
            "typing_completed": [], "typing_stars": {}, "typing_best_wpm": {},
            "logic_completed": [], "logic_stars": {},
            "quiz_completed": [], "quiz_stars": {},
            "memory_completed": [], "memory_stars": {},
            "adventure_completed": [], "adventure_stars": {},
            "thinking_completed": [], "thinking_stars": {},
            "crossword_completed": [], "crossword_stars": {}}


def _save_progress(username: str, data: dict):
    path = _progress_path(username)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

# ---------- routes ----------

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/levels", methods=["GET"])
def get_levels():
    """Return list of all levels (summary)."""
    summary = [{"id": lv["id"], "title": lv["title"], "description": lv["description"]} for lv in LEVELS]
    return jsonify(summary)


@app.route("/api/levels/<int:level_id>", methods=["GET"])
def get_level(level_id):
    """Return full level data."""
    for lv in LEVELS:
        if lv["id"] == level_id:
            return jsonify(lv)
    return jsonify({"error": "Nie znaleziono poziomu"}), 404


@app.route("/api/typing", methods=["GET"])
def get_typing_lessons():
    """Return typing lesson summaries."""
    summary = [{"id": t["id"], "title": t["title"], "description": t["description"]} for t in TYPING_LESSONS]
    return jsonify(summary)


@app.route("/api/typing/<int:lesson_id>", methods=["GET"])
def get_typing_lesson(lesson_id):
    """Return full typing lesson data."""
    for t in TYPING_LESSONS:
        if t["id"] == lesson_id:
            return jsonify(t)
    return jsonify({"error": "Nie znaleziono lekcji"}), 404


@app.route("/api/logic", methods=["GET"])
def get_logic_puzzles():
    """Return logic puzzle summaries."""
    summary = [{"id": p["id"], "title": p["title"], "description": p["description"]} for p in LOGIC_PUZZLES]
    return jsonify(summary)


@app.route("/api/logic/<int:puzzle_id>", methods=["GET"])
def get_logic_puzzle(puzzle_id):
    """Return full logic puzzle data."""
    for p in LOGIC_PUZZLES:
        if p["id"] == puzzle_id:
            return jsonify(p)
    return jsonify({"error": "Nie znaleziono zagadki"}), 404


@app.route("/api/quiz", methods=["GET"])
def get_quiz_questions():
    """Return quiz question summaries."""
    summary = [{"id": q["id"], "title": q["title"], "description": q["description"]} for q in QUIZ_QUESTIONS]
    return jsonify(summary)


@app.route("/api/quiz/<int:quiz_id>", methods=["GET"])
def get_quiz_question(quiz_id):
    """Return full quiz question data."""
    for q in QUIZ_QUESTIONS:
        if q["id"] == quiz_id:
            return jsonify(q)
    return jsonify({"error": "Nie znaleziono quizu"}), 404


@app.route("/api/memory", methods=["GET"])
def get_memory_pairs():
    """Return memory game summaries."""
    summary = [{"id": m["id"], "title": m["title"], "description": m["description"]} for m in MEMORY_PAIRS]
    return jsonify(summary)


@app.route("/api/memory/<int:memory_id>", methods=["GET"])
def get_memory_pair(memory_id):
    """Return full memory game data."""
    for m in MEMORY_PAIRS:
        if m["id"] == memory_id:
            return jsonify(m)
    return jsonify({"error": "Nie znaleziono gry memory"}), 404


@app.route("/api/crossword", methods=["GET"])
def get_crossword_puzzles():
    """Return crossword puzzle summaries."""
    summary = [{"id": c["id"], "title": c["title"], "description": c["description"]} for c in CROSSWORD_PUZZLES]
    return jsonify(summary)


@app.route("/api/crossword/<int:puzzle_id>", methods=["GET"])
def get_crossword_puzzle(puzzle_id):
    """Return full crossword puzzle data."""
    for c in CROSSWORD_PUZZLES:
        if c["id"] == puzzle_id:
            return jsonify(c)
    return jsonify({"error": "Nie znaleziono krzyżówki"}), 404


@app.route("/api/thinking", methods=["GET"])
def get_thinking_exercises():
    """Return thinking exercise summaries."""
    summary = [{"id": e["id"], "title": e["title"], "description": e["description"]} for e in THINKING_EXERCISES]
    return jsonify(summary)


@app.route("/api/thinking/<int:exercise_id>", methods=["GET"])
def get_thinking_exercise(exercise_id):
    """Return full thinking exercise data."""
    for e in THINKING_EXERCISES:
        if e["id"] == exercise_id:
            return jsonify(e)
    return jsonify({"error": "Nie znaleziono ćwiczenia"}), 404


@app.route("/api/progress/<username>", methods=["GET"])
def get_progress(username):
    return jsonify(_load_progress(username))


@app.route("/api/progress/<username>", methods=["POST"])
def save_progress(username):
    data = request.get_json(force=True)
    progress = _load_progress(username)

    # Coding levels progress
    level_id = data.get("level_id")
    stars = data.get("stars", 1)
    if level_id is not None:
        if level_id not in progress["completed"]:
            progress["completed"].append(level_id)
        prev_stars = progress["stars"].get(str(level_id), 0)
        progress["stars"][str(level_id)] = max(prev_stars, stars)
        progress["current_level"] = max(progress.get("current_level", 1), level_id + 1)

    # Typing lessons progress
    typing_id = data.get("typing_id")
    typing_stars = data.get("typing_stars", 1)
    typing_wpm = data.get("typing_wpm", 0)
    if typing_id is not None:
        if "typing_completed" not in progress:
            progress["typing_completed"] = []
        if "typing_stars" not in progress:
            progress["typing_stars"] = {}
        if "typing_best_wpm" not in progress:
            progress["typing_best_wpm"] = {}
        if typing_id not in progress["typing_completed"]:
            progress["typing_completed"].append(typing_id)
        prev = progress["typing_stars"].get(str(typing_id), 0)
        progress["typing_stars"][str(typing_id)] = max(prev, typing_stars)
        prev_wpm = progress["typing_best_wpm"].get(str(typing_id), 0)
        progress["typing_best_wpm"][str(typing_id)] = max(prev_wpm, typing_wpm)

    # Logic puzzles progress
    logic_id = data.get("logic_id")
    logic_stars = data.get("logic_stars", 1)
    if logic_id is not None:
        if "logic_completed" not in progress:
            progress["logic_completed"] = []
        if "logic_stars" not in progress:
            progress["logic_stars"] = {}
        if logic_id not in progress["logic_completed"]:
            progress["logic_completed"].append(logic_id)
        prev = progress["logic_stars"].get(str(logic_id), 0)
        progress["logic_stars"][str(logic_id)] = max(prev, logic_stars)

    # Quiz progress
    quiz_id = data.get("quiz_id")
    quiz_stars = data.get("quiz_stars", 1)
    if quiz_id is not None:
        if "quiz_completed" not in progress:
            progress["quiz_completed"] = []
        if "quiz_stars" not in progress:
            progress["quiz_stars"] = {}
        if quiz_id not in progress["quiz_completed"]:
            progress["quiz_completed"].append(quiz_id)
        prev = progress["quiz_stars"].get(str(quiz_id), 0)
        progress["quiz_stars"][str(quiz_id)] = max(prev, quiz_stars)

    # Memory game progress
    memory_id = data.get("memory_id")
    memory_stars = data.get("memory_stars", 1)
    if memory_id is not None:
        if "memory_completed" not in progress:
            progress["memory_completed"] = []
        if "memory_stars" not in progress:
            progress["memory_stars"] = {}
        if memory_id not in progress["memory_completed"]:
            progress["memory_completed"].append(memory_id)
        prev = progress["memory_stars"].get(str(memory_id), 0)
        progress["memory_stars"][str(memory_id)] = max(prev, memory_stars)

    # Adventure progress
    adventure_id = data.get("adventure_id")
    adventure_stars = data.get("adventure_stars", 1)
    if adventure_id is not None:
        if "adventure_completed" not in progress:
            progress["adventure_completed"] = []
        if "adventure_stars" not in progress:
            progress["adventure_stars"] = {}
        if adventure_id not in progress["adventure_completed"]:
            progress["adventure_completed"].append(adventure_id)
        prev = progress["adventure_stars"].get(str(adventure_id), 0)
        progress["adventure_stars"][str(adventure_id)] = max(prev, adventure_stars)

    # Thinking exercises progress
    thinking_id = data.get("thinking_id")
    thinking_stars = data.get("thinking_stars", 1)
    if thinking_id is not None:
        if "thinking_completed" not in progress:
            progress["thinking_completed"] = []
        if "thinking_stars" not in progress:
            progress["thinking_stars"] = {}
        if thinking_id not in progress["thinking_completed"]:
            progress["thinking_completed"].append(thinking_id)
        prev = progress["thinking_stars"].get(str(thinking_id), 0)
        progress["thinking_stars"][str(thinking_id)] = max(prev, thinking_stars)

    # Crossword progress
    crossword_id = data.get("crossword_id")
    crossword_stars = data.get("crossword_stars", 1)
    if crossword_id is not None:
        if "crossword_completed" not in progress:
            progress["crossword_completed"] = []
        if "crossword_stars" not in progress:
            progress["crossword_stars"] = {}
        if crossword_id not in progress["crossword_completed"]:
            progress["crossword_completed"].append(crossword_id)
        prev = progress["crossword_stars"].get(str(crossword_id), 0)
        progress["crossword_stars"][str(crossword_id)] = max(prev, crossword_stars)

    _save_progress(username, progress)
    return jsonify(progress)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)
