"""Binary puzzles – child toggles light bulbs (bits) to build a target number.

Classic CS-unplugged: each bulb is worth 1, 2, 4, 8, 16 dots. Lit bulbs add up.

Each puzzle:
  id, title, description – metadata
  bits                   – number of bulbs (3-5, values 2^0 .. 2^(bits-1))
  target                 – the number to build (0 < target < 2^bits)
  hints                  – progressive hints (PL)
"""

BINARY_PUZZLES = [
    {
        "id": 1,
        "title": "💡 Pierwsze światełka",
        "description": "Zapal żarówki, żeby zrobić liczbę 3.",
        "bits": 3,
        "target": 3,
        "hints": [
            "Każda żarówka ma swoją wartość: 4, 2 i 1 kropka.",
            "Zapalone żarówki dodają swoje kropki do sumy.",
            "2 + 1 = 3. Zapal dwie żarówki po prawej!",
        ],
    },
    {
        "id": 2,
        "title": "💡 Piątka",
        "description": "Zapal żarówki, żeby zrobić liczbę 5.",
        "bits": 3,
        "target": 5,
        "hints": [
            "Potrzebujesz dokładnie 5 kropek.",
            "4 + 1 = 5. Która żarówka zostaje zgaszona?",
        ],
    },
    {
        "id": 3,
        "title": "💡 Wszystko włączone!",
        "description": "Zapal żarówki, żeby zrobić liczbę 7.",
        "bits": 3,
        "target": 7,
        "hints": [
            "4 + 2 + 1 = ?",
            "To największa liczba z trzech żarówek – zapal wszystkie!",
        ],
    },
    {
        "id": 4,
        "title": "💡 Nowa żarówka: 8",
        "description": "Doszła żarówka z 8 kropkami! Zrób liczbę 9.",
        "bits": 4,
        "target": 9,
        "hints": [
            "Teraz masz żarówki: 8, 4, 2 i 1.",
            "8 + 1 = 9. Tylko dwie żarówki są potrzebne!",
        ],
    },
    {
        "id": 5,
        "title": "💡 Dziesiątka",
        "description": "Zrób liczbę 10.",
        "bits": 4,
        "target": 10,
        "hints": [
            "Zacznij od największej żarówki, która się mieści: 8.",
            "10 − 8 = 2. Jaka żarówka dołoży resztę?",
        ],
    },
    {
        "id": 6,
        "title": "💡 Trzynastka",
        "description": "Zrób liczbę 13.",
        "bits": 4,
        "target": 13,
        "hints": [
            "8 się mieści w 13. Zostaje 5.",
            "8 + 4 + 1 = 13.",
        ],
    },
    {
        "id": 7,
        "title": "💡 Pełna moc",
        "description": "Zrób liczbę 15.",
        "bits": 4,
        "target": 15,
        "hints": [
            "8 + 4 + 2 + 1 = ?",
            "Znowu wszystkie żarówki – 15 to maksimum dla czterech!",
        ],
    },
    {
        "id": 8,
        "title": "💡 Wielka szesnastka",
        "description": "Piąta żarówka ma 16 kropek! Zrób liczbę 19.",
        "bits": 5,
        "target": 19,
        "hints": [
            "Zacznij od 16. Zostaje 3.",
            "16 + 2 + 1 = 19.",
        ],
    },
    {
        "id": 9,
        "title": "💡 Dwadzieścia jeden",
        "description": "Zrób liczbę 21.",
        "bits": 5,
        "target": 21,
        "hints": [
            "16 się mieści. 21 − 16 = 5.",
            "16 + 4 + 1 = 21.",
        ],
    },
    {
        "id": 10,
        "title": "💡 Mistrz bitów",
        "description": "Ostatnie wyzwanie: zrób liczbę 27.",
        "bits": 5,
        "target": 27,
        "hints": [
            "27 = 16 + 11, a 11 = 8 + 3.",
            "16 + 8 + 2 + 1 = 27. Tylko żarówka 4 śpi!",
        ],
    },
]
