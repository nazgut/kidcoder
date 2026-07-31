"""KidCoder – Flask backend for kids coding portal."""

import json
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from game_data import LEVELS, LOGIC_PUZZLES, TYPING_LESSONS, QUIZ_QUESTIONS, MEMORY_PAIRS, THINKING_EXERCISES, CROSSWORD_PUZZLES, SUDOKU_PUZZLES, MATH_PROBLEMS, PIXEL_PUZZLES, CIPHER_PUZZLES, BINARY_PUZZLES, MELODY_GAMES, DEBUG_PUZZLES

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
            "crossword_completed": [], "crossword_stars": {},
            "sudoku_completed": [], "sudoku_stars": {},
            "math_completed": [], "math_stars": {},
            "pixel_completed": [], "pixel_stars": {},
            "cipher_completed": [], "cipher_stars": {},
            "binary_completed": [], "binary_stars": {},
            "melody_completed": [], "melody_stars": {},
            "debug_completed": [], "debug_stars": {}}


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


@app.route("/api/sudoku", methods=["GET"])
def get_sudoku_puzzles():
    """Return sudoku puzzle summaries."""
    summary = [{"id": s["id"], "title": s["title"], "description": s["description"], "size": s["size"], "difficulty": s["difficulty"]} for s in SUDOKU_PUZZLES]
    return jsonify(summary)


@app.route("/api/sudoku/<int:puzzle_id>", methods=["GET"])
def get_sudoku_puzzle(puzzle_id):
    """Return full sudoku puzzle data."""
    for s in SUDOKU_PUZZLES:
        if s["id"] == puzzle_id:
            return jsonify(s)
    return jsonify({"error": "Nie znaleziono sudoku"}), 404


@app.route("/api/math", methods=["GET"])
def get_math_problems():
    """Return math problem summaries."""
    summary = [{"id": m["id"], "title": m["title"], "description": m.get("story", ""), "type": m["type"], "lesson_type": m.get("lesson_type", "practice")} for m in MATH_PROBLEMS]
    return jsonify(summary)


@app.route("/api/math/<int:problem_id>", methods=["GET"])
def get_math_problem(problem_id):
    """Return full math problem data."""
    for m in MATH_PROBLEMS:
        if m["id"] == problem_id:
            return jsonify(m)
    return jsonify({"error": "Nie znaleziono zadania"}), 404


@app.route("/api/pixel", methods=["GET"])
def get_pixel_puzzles():
    """Return pixel art puzzle summaries."""
    summary = [{"id": p["id"], "title": p["title"], "description": p["description"], "size": p["size"]} for p in PIXEL_PUZZLES]
    return jsonify(summary)


@app.route("/api/pixel/<int:puzzle_id>", methods=["GET"])
def get_pixel_puzzle(puzzle_id):
    """Return full pixel art puzzle data."""
    for p in PIXEL_PUZZLES:
        if p["id"] == puzzle_id:
            return jsonify(p)
    return jsonify({"error": "Nie znaleziono obrazka"}), 404


@app.route("/api/cipher", methods=["GET"])
def get_cipher_puzzles():
    """Return cipher puzzle summaries."""
    summary = [{"id": c["id"], "title": c["title"], "description": c["description"]} for c in CIPHER_PUZZLES]
    return jsonify(summary)


@app.route("/api/cipher/<int:puzzle_id>", methods=["GET"])
def get_cipher_puzzle(puzzle_id):
    """Return full cipher puzzle data."""
    for c in CIPHER_PUZZLES:
        if c["id"] == puzzle_id:
            return jsonify(c)
    return jsonify({"error": "Nie znaleziono szyfru"}), 404


@app.route("/api/binary", methods=["GET"])
def get_binary_puzzles():
    """Return binary puzzle summaries."""
    summary = [{"id": b["id"], "title": b["title"], "description": b["description"], "bits": b["bits"]} for b in BINARY_PUZZLES]
    return jsonify(summary)


@app.route("/api/binary/<int:puzzle_id>", methods=["GET"])
def get_binary_puzzle(puzzle_id):
    """Return full binary puzzle data."""
    for b in BINARY_PUZZLES:
        if b["id"] == puzzle_id:
            return jsonify(b)
    return jsonify({"error": "Nie znaleziono zadania"}), 404


@app.route("/api/melody", methods=["GET"])
def get_melody_games():
    """Return melody game summaries."""
    summary = [{"id": m["id"], "title": m["title"], "description": m["description"]} for m in MELODY_GAMES]
    return jsonify(summary)


@app.route("/api/melody/<int:game_id>", methods=["GET"])
def get_melody_game(game_id):
    """Return full melody game data."""
    for m in MELODY_GAMES:
        if m["id"] == game_id:
            return jsonify(m)
    return jsonify({"error": "Nie znaleziono melodii"}), 404


@app.route("/api/debug", methods=["GET"])
def get_debug_puzzles():
    """Return debug puzzle summaries."""
    summary = [{"id": d["id"], "title": d["title"], "description": d["description"]} for d in DEBUG_PUZZLES]
    return jsonify(summary)


@app.route("/api/debug/<int:puzzle_id>", methods=["GET"])
def get_debug_puzzle(puzzle_id):
    """Return full debug puzzle data."""
    for d in DEBUG_PUZZLES:
        if d["id"] == puzzle_id:
            return jsonify(d)
    return jsonify({"error": "Nie znaleziono programu"}), 404


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

    # All other games share the same progress shape: <key>_completed + <key>_stars
    for key in ("logic", "quiz", "memory", "adventure", "thinking", "crossword",
                "math", "sudoku", "pixel", "cipher", "binary", "melody", "debug"):
        item_id = data.get(f"{key}_id")
        item_stars = data.get(f"{key}_stars", 1)
        if item_id is None:
            continue
        completed = progress.setdefault(f"{key}_completed", [])
        stars_map = progress.setdefault(f"{key}_stars", {})
        if item_id not in completed:
            completed.append(item_id)
        stars_map[str(item_id)] = max(stars_map.get(str(item_id), 0), item_stars)

    _save_progress(username, progress)
    return jsonify(progress)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5010)
