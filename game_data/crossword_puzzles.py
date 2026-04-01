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
            {"word": "KOMIK", "clue": "Książeczka z obrazkami i dymkami", "highlight": 2},
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
