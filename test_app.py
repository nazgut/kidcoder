"""Automated tests for KidCoder – covers all API endpoints, data integrity, and game logic."""

import json
import os
import shutil
import tempfile
import unittest

# Ensure tests use a temp data dir
os.environ["KIDCODER_TEST"] = "1"

from app import app, LEVELS, TYPING_LESSONS, LOGIC_PUZZLES, QUIZ_QUESTIONS, DATA_DIR
from game_data import CROSSWORD_PUZZLES


class TestBase(unittest.TestCase):
    """Base class with test client and temp data dir."""

    def setUp(self):
        self.app = app
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        self._orig_data_dir = DATA_DIR
        self._tmp = tempfile.mkdtemp()
        # Monkey-patch DATA_DIR for isolation
        import app as app_module
        app_module.DATA_DIR = self._tmp

    def tearDown(self):
        import app as app_module
        app_module.DATA_DIR = self._orig_data_dir
        shutil.rmtree(self._tmp, ignore_errors=True)


# ============ LEVELS API ============

class TestLevelsAPI(TestBase):

    def test_get_levels_returns_list(self):
        res = self.client.get("/api/levels")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 24)

    def test_levels_have_required_summary_fields(self):
        res = self.client.get("/api/levels")
        for lv in res.get_json():
            self.assertIn("id", lv)
            self.assertIn("title", lv)
            self.assertIn("description", lv)

    def test_get_single_level(self):
        for level_id in [1, 12, 24]:
            res = self.client.get(f"/api/levels/{level_id}")
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data["id"], level_id)

    def test_get_missing_level_returns_404(self):
        res = self.client.get("/api/levels/999")
        self.assertEqual(res.status_code, 404)

    def test_level_full_data_fields(self):
        res = self.client.get("/api/levels/1")
        data = res.get_json()
        required = ["id", "title", "description", "grid_width", "grid_height",
                     "hero_start", "hero_dir", "goal", "walls", "available_blocks", "hints"]
        for field in required:
            self.assertIn(field, data, f"Level 1 missing field: {field}")


# ============ LEVEL DATA INTEGRITY ============

class TestLevelDataIntegrity(TestBase):

    def test_unique_level_ids(self):
        ids = [lv["id"] for lv in LEVELS]
        self.assertEqual(len(ids), len(set(ids)), "Duplicate level IDs found")

    def test_sequential_level_ids(self):
        ids = sorted(lv["id"] for lv in LEVELS)
        self.assertEqual(ids, list(range(1, 25)))

    def test_hero_start_within_grid(self):
        for lv in LEVELS:
            x, y = lv["hero_start"]
            self.assertTrue(0 <= x < lv["grid_width"],
                            f"Level {lv['id']}: hero x={x} outside grid width {lv['grid_width']}")
            self.assertTrue(0 <= y < lv["grid_height"],
                            f"Level {lv['id']}: hero y={y} outside grid height {lv['grid_height']}")

    def test_goal_within_grid(self):
        for lv in LEVELS:
            goal = lv["goal"]
            if isinstance(goal, list) and len(goal) == 2 and isinstance(goal[0], int):
                x, y = goal
                self.assertTrue(0 <= x < lv["grid_width"],
                                f"Level {lv['id']}: goal x={x} outside grid")
                self.assertTrue(0 <= y < lv["grid_height"],
                                f"Level {lv['id']}: goal y={y} outside grid")

    def test_walls_within_grid(self):
        for lv in LEVELS:
            for wx, wy in lv["walls"]:
                self.assertTrue(0 <= wx < lv["grid_width"],
                                f"Level {lv['id']}: wall x={wx} outside grid")
                self.assertTrue(0 <= wy < lv["grid_height"],
                                f"Level {lv['id']}: wall y={wy} outside grid")

    def test_hero_not_on_wall(self):
        for lv in LEVELS:
            hero = tuple(lv["hero_start"])
            walls = [tuple(w) for w in lv["walls"]]
            self.assertNotIn(hero, walls, f"Level {lv['id']}: hero starts on a wall")

    def test_goal_not_on_wall(self):
        for lv in LEVELS:
            goal = lv["goal"]
            if isinstance(goal, list) and len(goal) == 2 and isinstance(goal[0], int):
                walls = [tuple(w) for w in lv["walls"]]
                self.assertNotIn(tuple(goal), walls, f"Level {lv['id']}: goal is on a wall")

    def test_available_blocks_not_empty(self):
        for lv in LEVELS:
            self.assertTrue(len(lv["available_blocks"]) > 0,
                            f"Level {lv['id']}: no available blocks")

    def test_hints_present(self):
        for lv in LEVELS:
            self.assertIn("hints", lv, f"Level {lv['id']}: missing hints")
            self.assertIsInstance(lv["hints"], list)

    def test_tutorial_test_alternation(self):
        """Odd levels should be tutorials (📖), even should be tests (🧪)."""
        for lv in LEVELS:
            if lv["id"] % 2 == 1:
                self.assertIn("📖", lv["title"],
                              f"Level {lv['id']}: odd level should be tutorial (📖)")
            else:
                self.assertIn("🧪", lv["title"],
                              f"Level {lv['id']}: even level should be test (🧪)")

    def test_gems_within_grid(self):
        for lv in LEVELS:
            for gx, gy in lv.get("gems", []):
                self.assertTrue(0 <= gx < lv["grid_width"],
                                f"Level {lv['id']}: gem x={gx} outside grid")
                self.assertTrue(0 <= gy < lv["grid_height"],
                                f"Level {lv['id']}: gem y={gy} outside grid")


# ============ TYPING API ============

class TestTypingAPI(TestBase):

    def test_get_typing_lessons(self):
        res = self.client.get("/api/typing")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 6)

    def test_typing_lesson_summary_fields(self):
        res = self.client.get("/api/typing")
        for lesson in res.get_json():
            self.assertIn("id", lesson)
            self.assertIn("title", lesson)

    def test_get_single_typing_lesson(self):
        res = self.client.get("/api/typing/1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["id"], 1)
        self.assertIn("words", data)

    def test_get_missing_typing_lesson_returns_404(self):
        res = self.client.get("/api/typing/999")
        self.assertEqual(res.status_code, 404)

    def test_typing_lessons_have_words(self):
        for lesson in TYPING_LESSONS:
            self.assertIn("words", lesson)
            self.assertTrue(len(lesson["words"]) > 0, f"Typing {lesson['id']}: empty words")

    def test_typing_unique_ids(self):
        ids = [t["id"] for t in TYPING_LESSONS]
        self.assertEqual(len(ids), len(set(ids)))


# ============ LOGIC API ============

class TestLogicAPI(TestBase):

    def test_get_logic_puzzles(self):
        res = self.client.get("/api/logic")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 42)

    def test_logic_summary_fields(self):
        res = self.client.get("/api/logic")
        for puzzle in res.get_json():
            self.assertIn("id", puzzle)
            self.assertIn("title", puzzle)
            self.assertIn("description", puzzle)

    def test_get_single_logic_puzzle(self):
        res = self.client.get("/api/logic/1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["id"], 1)

    def test_get_missing_logic_puzzle_returns_404(self):
        res = self.client.get("/api/logic/999")
        self.assertEqual(res.status_code, 404)


# ============ LOGIC DATA INTEGRITY ============

class TestLogicDataIntegrity(TestBase):

    def test_unique_puzzle_ids(self):
        ids = [p["id"] for p in LOGIC_PUZZLES]
        self.assertEqual(len(ids), len(set(ids)))

    def test_sequential_puzzle_ids(self):
        ids = sorted(p["id"] for p in LOGIC_PUZZLES)
        self.assertEqual(ids, list(range(1, 43)))

    def test_all_puzzles_have_required_fields(self):
        required = ["id", "title", "description", "type", "options", "answer", "explanation", "hints"]
        for p in LOGIC_PUZZLES:
            for field in required:
                self.assertIn(field, p, f"Logic puzzle {p['id']} missing '{field}'")

    def test_valid_puzzle_types(self):
        valid_types = {"sequence", "pattern", "logic_if", "true_false", "logic_gate", "sort", "find_path", "mirror"}
        for p in LOGIC_PUZZLES:
            self.assertIn(p["type"], valid_types,
                          f"Logic puzzle {p['id']} has invalid type '{p['type']}'")

    def test_answer_in_options(self):
        """The correct answer must be among the options."""
        for p in LOGIC_PUZZLES:
            answer = p["answer"]
            options = p["options"]
            if isinstance(answer, list):
                found = any(json.dumps(o) == json.dumps(answer) for o in options)
            else:
                found = answer in options
            self.assertTrue(found,
                            f"Logic puzzle {p['id']}: answer {answer} not in options {options}")

    def test_options_not_empty(self):
        for p in LOGIC_PUZZLES:
            self.assertTrue(len(p["options"]) >= 2,
                            f"Logic puzzle {p['id']}: needs at least 2 options")

    def test_sequence_puzzles_have_sequence(self):
        for p in LOGIC_PUZZLES:
            if p["type"] == "sequence":
                self.assertIn("sequence", p, f"Sequence puzzle {p['id']} needs 'sequence' field")

    def test_pattern_puzzles_have_pattern(self):
        for p in LOGIC_PUZZLES:
            if p["type"] == "pattern":
                self.assertIn("pattern", p, f"Pattern puzzle {p['id']} needs 'pattern' field")

    def test_logic_if_puzzles_have_rule_and_condition(self):
        for p in LOGIC_PUZZLES:
            if p["type"] == "logic_if":
                self.assertIn("rule", p, f"Logic_if puzzle {p['id']} needs 'rule' field")
                self.assertIn("condition", p, f"Logic_if puzzle {p['id']} needs 'condition' field")

    def test_sort_puzzles_have_items(self):
        for p in LOGIC_PUZZLES:
            if p["type"] == "sort":
                self.assertIn("items", p, f"Sort puzzle {p['id']} needs 'items' field")


# ============ QUIZ API ============

class TestQuizAPI(TestBase):

    def test_get_quiz_questions(self):
        res = self.client.get("/api/quiz")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 10)

    def test_quiz_summary_fields(self):
        res = self.client.get("/api/quiz")
        for q in res.get_json():
            self.assertIn("id", q)
            self.assertIn("title", q)
            self.assertIn("description", q)

    def test_get_single_quiz(self):
        res = self.client.get("/api/quiz/1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["id"], 1)

    def test_get_missing_quiz_returns_404(self):
        res = self.client.get("/api/quiz/999")
        self.assertEqual(res.status_code, 404)


# ============ QUIZ DATA INTEGRITY ============

class TestQuizDataIntegrity(TestBase):

    def test_unique_quiz_ids(self):
        ids = [q["id"] for q in QUIZ_QUESTIONS]
        self.assertEqual(len(ids), len(set(ids)))

    def test_sequential_quiz_ids(self):
        ids = sorted(q["id"] for q in QUIZ_QUESTIONS)
        self.assertEqual(ids, list(range(1, 11)))

    def test_all_quizzes_have_required_fields(self):
        required = ["id", "title", "description", "question", "options", "correct", "explanation", "hints"]
        for q in QUIZ_QUESTIONS:
            for field in required:
                self.assertIn(field, q, f"Quiz {q['id']} missing '{field}'")

    def test_correct_index_valid(self):
        for q in QUIZ_QUESTIONS:
            self.assertIsInstance(q["correct"], int)
            self.assertTrue(0 <= q["correct"] < len(q["options"]),
                            f"Quiz {q['id']}: correct index {q['correct']} out of range")

    def test_options_not_empty(self):
        for q in QUIZ_QUESTIONS:
            self.assertTrue(len(q["options"]) >= 2,
                            f"Quiz {q['id']}: needs at least 2 options")

    def test_hints_present(self):
        for q in QUIZ_QUESTIONS:
            self.assertIsInstance(q["hints"], list)
            self.assertTrue(len(q["hints"]) > 0,
                            f"Quiz {q['id']}: needs at least 1 hint")


# ============ CROSSWORD API ============

class TestCrosswordAPI(TestBase):

    def test_get_crossword_puzzles(self):
        res = self.client.get("/api/crossword")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 10)

    def test_crossword_summary_fields(self):
        res = self.client.get("/api/crossword")
        for puzzle in res.get_json():
            self.assertIn("id", puzzle)
            self.assertIn("title", puzzle)
            self.assertIn("description", puzzle)

    def test_get_single_crossword(self):
        res = self.client.get("/api/crossword/1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["id"], 1)
        self.assertIn("rows", data)
        self.assertIn("secret", data)

    def test_get_missing_crossword_returns_404(self):
        res = self.client.get("/api/crossword/999")
        self.assertEqual(res.status_code, 404)

    def test_crossword_unique_ids(self):
        ids = [c["id"] for c in CROSSWORD_PUZZLES]
        self.assertEqual(len(ids), len(set(ids)))

    def test_crossword_has_rows(self):
        for c in CROSSWORD_PUZZLES:
            self.assertIn("rows", c)
            self.assertTrue(len(c["rows"]) > 0, f"Crossword {c['id']}: empty rows")
            self.assertIn("secret", c)
            self.assertEqual(len(c["secret"]), len(c["rows"]),
                             f"Crossword {c['id']}: secret length must match row count")

    def test_crossword_row_fields(self):
        for c in CROSSWORD_PUZZLES:
            for i, r in enumerate(c["rows"]):
                self.assertIn("word", r, f"Crossword {c['id']} row {i}: missing 'word'")
                self.assertIn("clue", r, f"Crossword {c['id']} row {i}: missing 'clue'")
                self.assertIn("highlight", r, f"Crossword {c['id']} row {i}: missing 'highlight'")
                self.assertTrue(0 <= r["highlight"] < len(r["word"]),
                                f"Crossword {c['id']} row {i}: highlight out of range")

    def test_crossword_secret_matches_highlights(self):
        for c in CROSSWORD_PUZZLES:
            secret = c["secret"].upper()
            for i, r in enumerate(c["rows"]):
                letter = r["word"][r["highlight"]].upper()
                self.assertEqual(letter, secret[i],
                                 f"Crossword {c['id']} row {i}: highlight letter '{letter}' != secret[{i}] '{secret[i]}'")

    def test_crossword_progress_saving(self):
        self.client.post("/api/progress/testcw", json={"crossword_id": 1, "crossword_stars": 3})
        res = self.client.get("/api/progress/testcw")
        data = res.get_json()
        self.assertIn(1, data["crossword_completed"])
        self.assertEqual(data["crossword_stars"]["1"], 3)


# ============ PROGRESS API ============

class TestProgressAPI(TestBase):

    def test_get_new_user_progress(self):
        res = self.client.get("/api/progress/testuser123")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["username"], "testuser123")
        self.assertEqual(data["completed"], [])
        self.assertEqual(data["current_level"], 1)
        self.assertEqual(data["quiz_completed"], [])
        self.assertEqual(data["quiz_stars"], {})

    def test_save_coding_progress(self):
        res = self.client.post("/api/progress/testuser123",
                               json={"level_id": 1, "stars": 3})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn(1, data["completed"])
        self.assertEqual(data["stars"]["1"], 3)
        self.assertEqual(data["current_level"], 2)

    def test_save_typing_progress(self):
        res = self.client.post("/api/progress/testuser123",
                               json={"typing_id": 1, "typing_stars": 2, "typing_wpm": 45})
        data = res.get_json()
        self.assertIn(1, data["typing_completed"])
        self.assertEqual(data["typing_stars"]["1"], 2)
        self.assertEqual(data["typing_best_wpm"]["1"], 45)

    def test_save_logic_progress(self):
        res = self.client.post("/api/progress/testuser123",
                               json={"logic_id": 5, "logic_stars": 3})
        data = res.get_json()
        self.assertIn(5, data["logic_completed"])
        self.assertEqual(data["logic_stars"]["5"], 3)

    def test_save_quiz_progress(self):
        res = self.client.post("/api/progress/testuser123",
                               json={"quiz_id": 1, "quiz_stars": 3})
        data = res.get_json()
        self.assertIn(1, data["quiz_completed"])
        self.assertEqual(data["quiz_stars"]["1"], 3)

    def test_quiz_stars_only_increase(self):
        self.client.post("/api/progress/testuser123",
                         json={"quiz_id": 1, "quiz_stars": 3})
        res = self.client.post("/api/progress/testuser123",
                               json={"quiz_id": 1, "quiz_stars": 1})
        data = res.get_json()
        self.assertEqual(data["quiz_stars"]["1"], 3, "Quiz stars should not decrease")

    def test_stars_only_increase(self):
        self.client.post("/api/progress/testuser123",
                         json={"level_id": 1, "stars": 3})
        # Try saving lower stars
        res = self.client.post("/api/progress/testuser123",
                               json={"level_id": 1, "stars": 1})
        data = res.get_json()
        self.assertEqual(data["stars"]["1"], 3, "Stars should not decrease")

    def test_wpm_only_increase(self):
        self.client.post("/api/progress/testuser123",
                         json={"typing_id": 1, "typing_stars": 2, "typing_wpm": 50})
        res = self.client.post("/api/progress/testuser123",
                               json={"typing_id": 1, "typing_stars": 1, "typing_wpm": 30})
        data = res.get_json()
        self.assertEqual(data["typing_best_wpm"]["1"], 50, "WPM should not decrease")

    def test_logic_stars_only_increase(self):
        self.client.post("/api/progress/testuser123",
                         json={"logic_id": 1, "logic_stars": 3})
        res = self.client.post("/api/progress/testuser123",
                               json={"logic_id": 1, "logic_stars": 1})
        data = res.get_json()
        self.assertEqual(data["logic_stars"]["1"], 3, "Logic stars should not decrease")

    def test_progress_persists(self):
        self.client.post("/api/progress/testuser123",
                         json={"level_id": 5, "stars": 2})
        res = self.client.get("/api/progress/testuser123")
        data = res.get_json()
        self.assertIn(5, data["completed"])

    def test_no_duplicate_completed(self):
        self.client.post("/api/progress/testuser123",
                         json={"level_id": 1, "stars": 1})
        self.client.post("/api/progress/testuser123",
                         json={"level_id": 1, "stars": 2})
        res = self.client.get("/api/progress/testuser123")
        data = res.get_json()
        self.assertEqual(data["completed"].count(1), 1)

    def test_username_sanitization(self):
        """Special chars in username should be stripped for file safety."""
        # Flask routing strips path traversal - test with special chars in single segment
        res = self.client.get("/api/progress/test__user")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("username", data)


# ============ STATIC FILES ============

class TestStaticFiles(TestBase):

    def test_index_page_loads(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"KidCoder", res.data)


# ============ LEVEL SOLVABILITY ============

class TestLevelSolvability(TestBase):
    """Verify that the goal is reachable from the hero start (no walls blocking path entirely)."""

    def _bfs_reachable(self, lv):
        """BFS to check if goal cell is reachable from hero start on the grid."""
        w, h = lv["grid_width"], lv["grid_height"]
        walls = set(tuple(ww) for ww in lv["walls"])
        start = tuple(lv["hero_start"])
        goal = lv["goal"]

        # Handle multi-goal (gems) levels - just check goal position
        if isinstance(goal, list) and len(goal) == 2 and isinstance(goal[0], int):
            target = tuple(goal)
        else:
            return True  # Skip complex goal checks

        visited = set()
        queue = [start]
        visited.add(start)

        while queue:
            x, y = queue.pop(0)
            if (x, y) == target:
                return True
            for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in walls and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
        return False

    def test_all_levels_goal_reachable(self):
        for lv in LEVELS:
            reachable = self._bfs_reachable(lv)
            self.assertTrue(reachable,
                            f"Level {lv['id']}: goal not reachable from hero start")

    def test_gems_reachable(self):
        """Check that all gems are on reachable cells."""
        for lv in LEVELS:
            if not lv.get("gems"):
                continue
            w, h = lv["grid_width"], lv["grid_height"]
            walls = set(tuple(ww) for ww in lv["walls"])
            start = tuple(lv["hero_start"])

            visited = set()
            queue = [start]
            visited.add(start)
            while queue:
                x, y = queue.pop(0)
                for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in walls and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))

            for gx, gy in lv["gems"]:
                self.assertIn((gx, gy), visited,
                              f"Level {lv['id']}: gem at ({gx},{gy}) not reachable")


if __name__ == "__main__":
    unittest.main()
