"""KidCoder – Crossword puzzles for kids (Polish "hasło" format).

Each puzzle has horizontal words aligned so that one highlighted column
spells a secret word (hasło) when read top-to-bottom.
"""

CROSSWORD_PUZZLES = [
    {
        "id": 1,
        "title": "Ukryte zwierzę",
        "description": "Wpisz słowa i odkryj ukryte hasło!",
        "secret": "KOT",
        "rows": [
            {"word": "KINO", "clue": "Oglądamy tam filmy", "highlight": 0},
            {"word": "LOT", "clue": "Samolotem w niebo", "highlight": 1},
            {"word": "TORT", "clue": "Jemy ze świeczkami na urodziny", "highlight": 0},
        ],
    },
    {
        "id": 2,
        "title": "Gdzie mieszkasz?",
        "description": "Znajdź hasło ukryte w słowach!",
        "secret": "DOM",
        "rows": [
            {"word": "DYM", "clue": "Leci z komina", "highlight": 0},
            {"word": "SOK", "clue": "Pijemy go z owoców", "highlight": 1},
            {"word": "SMOK", "clue": "Zieje ogniem w bajkach", "highlight": 1},
        ],
    },
    {
        "id": 3,
        "title": "Spacer po naturze",
        "description": "Co ukrywa się w krzyżówce?",
        "secret": "LAS",
        "rows": [
            {"word": "LIS", "clue": "Rudy i sprytny, żyje w norze", "highlight": 0},
            {"word": "AUTO", "clue": "Ma cztery koła i silnik", "highlight": 0},
            {"word": "SER", "clue": "Żółty, z dziurkami", "highlight": 0},
        ],
    },
    {
        "id": 4,
        "title": "Pora roku",
        "description": "Odgadnij hasło z czterech słów!",
        "secret": "LATO",
        "rows": [
            {"word": "LAMPA", "clue": "Daje światło wieczorem", "highlight": 0},
            {"word": "ARBUZ", "clue": "Duży zielony owoc, czerwony w środku", "highlight": 0},
            {"word": "TUNEL", "clue": "Ciemne przejście w górze", "highlight": 0},
            {"word": "OKNO", "clue": "Patrzymy przez nie na świat", "highlight": 0},
        ],
    },
    {
        "id": 5,
        "title": "Wierny przyjaciel",
        "description": "Hasło to zwierzę, które uwielbiasz!",
        "secret": "PIES",
        "rows": [
            {"word": "SPORT", "clue": "Bieganie, pływanie i piłka nożna", "highlight": 1},
            {"word": "FILM", "clue": "Oglądamy go w kinie", "highlight": 1},
            {"word": "SEN", "clue": "Zamykasz oczy w nocy i go masz", "highlight": 1},
            {"word": "USTA", "clue": "Nimi mówisz i jesz", "highlight": 1},
        ],
    },
    {
        "id": 6,
        "title": "Ktoś bliski",
        "description": "Cztery słowa i jedno hasło!",
        "secret": "MAMA",
        "rows": [
            {"word": "KOMIKS", "clue": "Książeczka z obrazkami i dymkami", "highlight": 2},
            {"word": "TRAWA", "clue": "Zielona, rośnie w ogródku", "highlight": 2},
            {"word": "RAMKA", "clue": "W niej trzymamy zdjęcie", "highlight": 2},
            {"word": "PLAMA", "clue": "Brudny ślad na koszulce", "highlight": 2},
        ],
    },
    {
        "id": 7,
        "title": "Zabawa!",
        "description": "Odgadnij trzy słowa i poznaj hasło!",
        "secret": "GRA",
        "rows": [
            {"word": "OGON", "clue": "Pies nim macha z radości", "highlight": 1},
            {"word": "PIRAT", "clue": "Żegluje po morzu i szuka skarbów", "highlight": 2},
            {"word": "BRAT", "clue": "Chłopiec w twojej rodzinie", "highlight": 2},
        ],
    },
    {
        "id": 8,
        "title": "Coś do picia",
        "description": "Co ukrywa się w tych słowach?",
        "secret": "SOK",
        "rows": [
            {"word": "STOP", "clue": "Znak: zatrzymaj się!", "highlight": 0},
            {"word": "OBRAZ", "clue": "Wisi na ścianie, namalowany", "highlight": 0},
            {"word": "KLEJ", "clue": "Sklejamy nim papier", "highlight": 0},
        ],
    },
    {
        "id": 9,
        "title": "Ktoś w rodzinie",
        "description": "Cztery słowa ukrywają hasło!",
        "secret": "TATA",
        "rows": [
            {"word": "STOK", "clue": "Zjeżdżamy na nim na nartach", "highlight": 1},
            {"word": "BATON", "clue": "Słodki, czekoladowy", "highlight": 1},
            {"word": "ATLAS", "clue": "Książka z mapami świata", "highlight": 1},
            {"word": "BALON", "clue": "Kolorowy, lata w niebie", "highlight": 1},
        ],
    },
    {
        "id": 10,
        "title": "Podróżnik",
        "description": "Znajdź hasło i wyrusz w podróż!",
        "secret": "MAPA",
        "rows": [
            {"word": "MOST", "clue": "Przechodzisz nim nad rzeką", "highlight": 0},
            {"word": "ANANAS", "clue": "Tropikalny owoc z koroną", "highlight": 0},
            {"word": "PARK", "clue": "Zielone miejsce w mieście na spacer", "highlight": 0},
            {"word": "ALARM", "clue": "Dzwoni rano, żeby cię obudzić", "highlight": 0},
        ],
    },
]

# ---------------------------------------------------------------------------
# School contest "Autumn crossword" / "Herbstkreuzworträtsel"
# (jesienna krzyżówka obrazkowa – picture crossword for grades I-III).
# Clues are presented as pictures (emoji). Word counts follow the contest
# rules: grade I -> 3-5 words, grade II -> 5-7 words, grade III -> 8-10 words.
# IDs use separate ranges per language so progress tracking never collides
# with the Polish puzzles (1-10).
# ---------------------------------------------------------------------------

CROSSWORD_PUZZLES_EN = [
    {
        "id": 101,
        "grade": "Klasa I (3-5 haseł)",
        "title": "Autumn Leaves",
        "description": "Look at the pictures and find the hidden word!",
        "secret": "LEAF",
        "rows": [
            {"word": "APPLE", "clue": "a round fruit that falls from trees in autumn", "emoji": "🍎", "highlight": 3},
            {"word": "TREE", "clue": "its leaves turn yellow and red in autumn", "emoji": "🌳", "highlight": 2},
            {"word": "PEAR", "clue": "a sweet green fruit you pick in autumn", "emoji": "🍐", "highlight": 2},
            {"word": "FOG", "clue": "grey mist on cold autumn mornings", "emoji": "🌫️", "highlight": 0},
        ],
    },
    {
        "id": 102,
        "grade": "Klasa II (5-7 haseł)",
        "title": "Rainy Days",
        "description": "Solve the picture clues and read the secret word!",
        "secret": "AUTUMN",
        "rows": [
            {"word": "RAIN", "clue": "water falling from grey clouds", "emoji": "🌧️", "highlight": 1},
            {"word": "CLOUD", "clue": "white or grey, it floats in the sky", "emoji": "☁️", "highlight": 3},
            {"word": "CHESTNUT", "clue": "a shiny brown nut you collect in the park", "emoji": "🌰", "highlight": 4},
            {"word": "SUN", "clue": "it shines, but not for long in autumn", "emoji": "☀️", "highlight": 1},
            {"word": "MUSHROOM", "clue": "it grows in the forest after the rain", "emoji": "🍄", "highlight": 0},
            {"word": "WIND", "clue": "it blows the leaves off the trees", "emoji": "💨", "highlight": 2},
        ],
    },
    {
        "id": 103,
        "grade": "Klasa III (8-10 haseł)",
        "title": "Autumn Walk",
        "description": "Eight picture clues hide a very orange word!",
        "secret": "PUMPKINS",
        "rows": [
            {"word": "PEAR", "clue": "a sweet autumn fruit, green or yellow", "emoji": "🍐", "highlight": 0},
            {"word": "CLOUDY", "clue": "when the sky is full of clouds", "emoji": "☁️", "highlight": 3},
            {"word": "WARM", "clue": "a hot tea keeps you like this", "emoji": "🍵", "highlight": 3},
            {"word": "APPLE", "clue": "a crunchy red or green fruit", "emoji": "🍎", "highlight": 1},
            {"word": "JACKET", "clue": "you wear it outside when it gets cold", "emoji": "🧥", "highlight": 3},
            {"word": "SPIDER", "clue": "it weaves a web in the corner", "emoji": "🕷️", "highlight": 2},
            {"word": "ACORN", "clue": "a little oak nut loved by squirrels", "emoji": "🌰", "highlight": 4},
            {"word": "SCARF", "clue": "you wrap it around your neck", "emoji": "🧣", "highlight": 0},
        ],
    },
]

CROSSWORD_PUZZLES_DE = [
    {
        "id": 201,
        "grade": "Klasa I (3-5 haseł)",
        "title": "Im Herbstwald",
        "description": "Schau dir die Bilder an und finde das Lösungswort!",
        "secret": "BAUM",
        "rows": [
            {"word": "BLATT", "clue": "es fällt im Herbst vom Baum", "emoji": "🍂", "highlight": 0},
            {"word": "APFEL", "clue": "eine rote oder grüne Frucht", "emoji": "🍎", "highlight": 0},
            {"word": "NUSS", "clue": "das Eichhörnchen sammelt sie gern", "emoji": "🌰", "highlight": 1},
            {"word": "MAIS", "clue": "gelb und lecker, wird im Herbst geerntet", "emoji": "🌽", "highlight": 0},
        ],
    },
    {
        "id": 202,
        "grade": "Klasa II (5-7 haseł)",
        "title": "Bunte Blätter",
        "description": "Löse die Bilderrätsel und lies das Lösungswort!",
        "secret": "HERBST",
        "rows": [
            {"word": "HEXE", "clue": "sie fliegt an Halloween auf dem Besen", "emoji": "🧙", "highlight": 0},
            {"word": "REGEN", "clue": "er fällt aus grauen Wolken", "emoji": "🌧️", "highlight": 1},
            {"word": "BIRNE", "clue": "eine süße Frucht, im Herbst reif", "emoji": "🍐", "highlight": 2},
            {"word": "BUNT", "clue": "so sind die Blätter im Herbst", "emoji": "🎨", "highlight": 0},
            {"word": "SONNE", "clue": "sie scheint am Himmel", "emoji": "☀️", "highlight": 0},
            {"word": "WETTER", "clue": "im Herbst oft kalt und windig", "emoji": "🌦️", "highlight": 2},
        ],
    },
    {
        "id": 203,
        "grade": "Klasa III (8-10 haseł)",
        "title": "Herbstspaziergang",
        "description": "Neun Bilderrätsel verstecken den ersten Herbstmonat!",
        "secret": "SEPTEMBER",
        "rows": [
            {"word": "SONNE", "clue": "sie scheint am Himmel", "emoji": "☀️", "highlight": 0},
            {"word": "REGEN", "clue": "er fällt aus grauen Wolken", "emoji": "🌧️", "highlight": 1},
            {"word": "PILZ", "clue": "er wächst im Wald nach dem Regen", "emoji": "🍄", "highlight": 0},
            {"word": "TANNE", "clue": "ein Nadelbaum, der immer grün bleibt", "emoji": "🌲", "highlight": 0},
            {"word": "NEBEL", "clue": "grauer Dunst am Herbstmorgen", "emoji": "🌫️", "highlight": 1},
            {"word": "MAUS", "clue": "ein kleines Tier mit langem Schwanz", "emoji": "🐭", "highlight": 0},
            {"word": "BIRNE", "clue": "eine süße Frucht, im Herbst reif", "emoji": "🍐", "highlight": 0},
            {"word": "HEXE", "clue": "sie fliegt an Halloween auf dem Besen", "emoji": "🧙", "highlight": 1},
            {"word": "RAUPE", "clue": "sie krabbelt und wird ein Schmetterling", "emoji": "🐛", "highlight": 0},
        ],
    },
]
