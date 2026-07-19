"""Pixel art puzzles – child decodes a run-length coded picture (koduj obrazki).

Each puzzle:
  id, title, description  – metadata
  size                    – grid is size x size
  palette                 – letter -> {color, name}; "." means empty cell
  grid                    – list of strings (rows), chars from palette or "."
  hints                   – progressive hints (PL)
"""

PIXEL_PUZZLES = [
    {
        "id": 1,
        "title": "🎨 Serce",
        "description": "Pomaluj serduszko według kodu wiersza!",
        "size": 7,
        "palette": {"R": {"color": "#FF4757", "name": "czerwony"}},
        "grid": [
            ".......",
            ".RR.RR.",
            "RRRRRRR",
            "RRRRRRR",
            ".RRRRR.",
            "..RRR..",
            "...R...",
        ],
        "hints": [
            "Spójrz na kod obok wiersza – mówi ile pól pomalować i na jaki kolor.",
            "Drugi wiersz to: 1 puste, 2 czerwone, 1 puste, 2 czerwone, 1 puste.",
            "Zacznij od środka obrazka – serce jest symetryczne!",
        ],
    },
    {
        "id": 2,
        "title": "👻 Duszek",
        "description": "Zakoduj przyjaznego duszka!",
        "size": 7,
        "palette": {
            "B": {"color": "#54A0FF", "name": "niebieski"},
            "N": {"color": "#2F3542", "name": "czarny"},
        },
        "grid": [
            "..BBB..",
            ".BBBBB.",
            ".BNBNB.",
            ".BBBBB.",
            ".BBBBB.",
            ".BBBBB.",
            ".B.B.B.",
        ],
        "hints": [
            "Duszek ma dwa czarne oczka w trzecim wierszu.",
            "Ostatni wiersz to falbanka: niebieski, puste, niebieski, puste…",
            "Licz pola uważnie – kod zawsze mówi prawdę!",
        ],
    },
    {
        "id": 3,
        "title": "🍄 Grzybek",
        "description": "Muchomorek z kropkami – pomaluj go!",
        "size": 7,
        "palette": {
            "R": {"color": "#FF4757", "name": "czerwony"},
            "Y": {"color": "#FFD93D", "name": "żółty"},
            "K": {"color": "#FFE8C2", "name": "kremowy"},
        },
        "grid": [
            "..RRR..",
            ".RRYRR.",
            "RYRRRYR",
            "RRRRRRR",
            "..KKK..",
            "..KKK..",
            ".KKKKK.",
        ],
        "hints": [
            "Kapelusz jest czerwony z żółtymi kropkami.",
            "Nóżka grzybka jest kremowa i zaczyna się w piątym wierszu.",
            "W trzecim wierszu żółte kropki są na drugim i szóstym polu.",
        ],
    },
    {
        "id": 4,
        "title": "🌸 Kwiatek",
        "description": "Różowy kwiatek na zielonej łodydze.",
        "size": 7,
        "palette": {
            "P": {"color": "#FD79A8", "name": "różowy"},
            "Y": {"color": "#FFD93D", "name": "żółty"},
            "G": {"color": "#2ED573", "name": "zielony"},
        },
        "grid": [
            "..PPP..",
            ".PYYYP.",
            ".PYYYP.",
            "..PPP..",
            "...G...",
            "...GG..",
            "...G...",
        ],
        "hints": [
            "Środek kwiatka jest żółty, płatki różowe.",
            "Łodyga to jedno zielone pole w środku wiersza.",
            "W szóstym wierszu łodyga ma mały listek z prawej strony.",
        ],
    },
    {
        "id": 5,
        "title": "🚀 Rakieta",
        "description": "Rakieta gotowa do startu – 3… 2… 1…!",
        "size": 8,
        "palette": {
            "R": {"color": "#FF4757", "name": "czerwony"},
            "B": {"color": "#54A0FF", "name": "niebieski"},
            "Y": {"color": "#FFD93D", "name": "żółty"},
        },
        "grid": [
            "...RR...",
            "...BB...",
            "..BBBB..",
            "..BYYB..",
            "..BBBB..",
            ".RBBBBR.",
            ".RRBBRR.",
            "...YY...",
        ],
        "hints": [
            "Czubek rakiety jest czerwony, a okienko żółte.",
            "Skrzydła po bokach są czerwone – w szóstym i siódmym wierszu.",
            "Ogień z silnika to dwa żółte pola na samym dole.",
        ],
    },
    {
        "id": 6,
        "title": "🐠 Rybka",
        "description": "Pomarańczowa rybka puszcza bąbelki!",
        "size": 8,
        "palette": {
            "O": {"color": "#FF9F43", "name": "pomarańczowy"},
            "N": {"color": "#2F3542", "name": "czarny"},
            "B": {"color": "#54A0FF", "name": "niebieski"},
        },
        "grid": [
            "......B.",
            ".....B..",
            "...OOO..",
            "O.OOOOO.",
            "OOOOOON.",
            "O.OOOOO.",
            "...OOO..",
            "........",
        ],
        "hints": [
            "Bąbelki są niebieskie – na górze po prawej.",
            "Ogon rybki jest z lewej strony, a czarne oko z prawej.",
            "Środkowy wiersz rybki jest najdłuższy – aż 6 pomarańczowych pól i oko.",
        ],
    },
    {
        "id": 7,
        "title": "🍓 Truskawka",
        "description": "Słodka truskawka z pestkami.",
        "size": 8,
        "palette": {
            "R": {"color": "#FF4757", "name": "czerwony"},
            "G": {"color": "#2ED573", "name": "zielony"},
            "Y": {"color": "#FFD93D", "name": "żółty"},
        },
        "grid": [
            "...GG...",
            "..GGGG..",
            ".RRRRRR.",
            "RRYRRYRR",
            "RRRRRRRR",
            ".RYRRYR.",
            "..RRRR..",
            "...RR...",
        ],
        "hints": [
            "Listki na górze są zielone.",
            "Żółte pestki są w czwartym i szóstym wierszu.",
            "Truskawka zwęża się ku dołowi – jak trójkąt.",
        ],
    },
    {
        "id": 8,
        "title": "🤖 Robot",
        "description": "Zbuduj robota piksel po pikselu!",
        "size": 8,
        "palette": {
            "N": {"color": "#2F3542", "name": "czarny"},
            "B": {"color": "#54A0FF", "name": "niebieski"},
            "Y": {"color": "#FFD93D", "name": "żółty"},
            "R": {"color": "#FF4757", "name": "czerwony"},
        },
        "grid": [
            ".N....N.",
            "..N..N..",
            ".BBBBBB.",
            ".BYBBYB.",
            ".BBBBBB.",
            "..BRRB..",
            ".BBBBBB.",
            ".B.BB.B.",
        ],
        "hints": [
            "Robot ma dwie czarne antenki na górze.",
            "Oczy robota są żółte, a przyciski na brzuchu czerwone.",
            "Ostatni wiersz to nogi: niebieski, puste, dwa niebieskie, puste, niebieski.",
        ],
    },
]
