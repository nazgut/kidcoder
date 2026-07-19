"""Cipher puzzles – child decodes a secret word using a symbol key (tajne szyfry).

The symbol alphabet is consistent across puzzles so kids start to remember it:
  A🍎 B🎈 D🐬 E🥚 G🎁 I🍦 K🔑 L🦁 M🌙 O🌞 P🦜 R🌈 S⭐ T🌳 U🦄 Y🪀 Z⚡

Each puzzle:
  id, title, description – metadata
  story                  – secret-agent flavour text (PL)
  word                   – the answer (uppercase)
  key                    – letter -> emoji symbol (covers every letter of word)
  decoys                 – extra letters shown among the answer tiles
  hints                  – progressive hints (PL)
"""

CIPHER_PUZZLES = [
    {
        "id": 1,
        "title": "🕵️ Misja: Kot",
        "description": "Trzy symbole, trzy litery. Dasz radę!",
        "story": "Agent Miau przesłał swoją pierwszą tajną wiadomość!",
        "word": "KOT",
        "key": {"K": "🔑", "O": "🌞", "T": "🌳"},
        "decoys": ["A", "M"],
        "hints": [
            "Znajdź każdy symbol w kluczu i odczytaj jego literę.",
            "🔑 to litera K. Jaki wyraz zaczyna się na K i mruczy?",
        ],
    },
    {
        "id": 2,
        "title": "🏠 Misja: Dom",
        "description": "Gdzie mieszka agent? Odszyfruj!",
        "story": "Kwatera główna agentów jest ukryta. Odczytaj gdzie!",
        "word": "DOM",
        "key": {"D": "🐬", "O": "🌞", "M": "🌙"},
        "decoys": ["K", "T"],
        "hints": [
            "🐬 to D, 🌙 to M.",
            "To miejsce, w którym mieszkasz.",
        ],
    },
    {
        "id": 3,
        "title": "🌲 Misja: Las",
        "description": "Tajne spotkanie w zielonym miejscu.",
        "story": "Agenci spotykają się tam, gdzie rosną drzewa…",
        "word": "LAS",
        "key": {"L": "🦁", "A": "🍎", "S": "⭐"},
        "decoys": ["O", "E"],
        "hints": [
            "🦁 to L jak lew.",
            "Rośnie tam mnóstwo drzew i mieszkają zwierzęta.",
        ],
    },
    {
        "id": 4,
        "title": "🐉 Misja: Smok",
        "description": "Cztery symbole strzegą zamku.",
        "story": "Uwaga! Na wieży zamku ktoś zionie ogniem…",
        "word": "SMOK",
        "key": {"S": "⭐", "M": "🌙", "O": "🌞", "K": "🔑"},
        "decoys": ["A", "T"],
        "hints": [
            "Pierwsza litera to S jak ⭐ (stars!).",
            "Zieje ogniem i lata nad zamkiem.",
        ],
    },
    {
        "id": 5,
        "title": "🏴‍☠️ Misja: Pirat",
        "description": "Kto zakopał skarb? Odszyfruj!",
        "story": "Na mapie skarbów ktoś zostawił zaszyfrowany podpis.",
        "word": "PIRAT",
        "key": {"P": "🦜", "I": "🍦", "R": "🌈", "A": "🍎", "T": "🌳"},
        "decoys": ["S", "O"],
        "hints": [
            "🦜 papuga to P – papugi lubią siedzieć mu na ramieniu.",
            "Pływa statkiem i szuka skarbów. Arrr!",
        ],
    },
    {
        "id": 6,
        "title": "🏰 Misja: Zamek",
        "description": "Odszyfruj, czego strzeże smok.",
        "story": "Smok czegoś pilnuje. Wielkiego, z wieżami i mostem!",
        "word": "ZAMEK",
        "key": {"Z": "⚡", "A": "🍎", "M": "🌙", "E": "🥚", "K": "🔑"},
        "decoys": ["O", "D"],
        "hints": [
            "⚡ to Z jak zygzak błyskawicy.",
            "Mieszkają w nim król i królowa.",
        ],
    },
    {
        "id": 7,
        "title": "🤖 Misja: Robot",
        "description": "Maszyna wysłała wiadomość o sobie.",
        "story": "BIP BIP! Ktoś metalowy nadaje sygnał…",
        "word": "ROBOT",
        "key": {"R": "🌈", "O": "🌞", "B": "🎈", "T": "🌳"},
        "decoys": ["M", "K"],
        "hints": [
            "🎈 balonik to B.",
            "Maszyna, która myśli jak komputer i mówi BIP BIP.",
        ],
    },
    {
        "id": 8,
        "title": "☄️ Misja: Kometa",
        "description": "Coś przeleciało po niebie!",
        "story": "Obserwatorium agentów zauważyło coś z ogonem na niebie.",
        "word": "KOMETA",
        "key": {"K": "🔑", "O": "🌞", "M": "🌙", "E": "🥚", "T": "🌳", "A": "🍎"},
        "decoys": ["S", "R"],
        "hints": [
            "Zaczyna się na K jak 🔑.",
            "Leci przez kosmos i ma świecący ogon.",
        ],
    },
    {
        "id": 9,
        "title": "💻 Misja: Program",
        "description": "Siedem symboli dla prawdziwego kodera!",
        "story": "Główny komputer agentów uruchamia tajny…?",
        "word": "PROGRAM",
        "key": {"P": "🦜", "R": "🌈", "O": "🌞", "G": "🎁", "A": "🍎", "M": "🌙"},
        "decoys": ["T", "E"],
        "hints": [
            "🎁 prezent to G.",
            "Piszą go programiści, a komputer go wykonuje.",
        ],
    },
    {
        "id": 10,
        "title": "🗺️ Misja: Przygoda",
        "description": "Najdłuższy szyfr – misja finałowa!",
        "story": "Ostatnia wiadomość agencji: co czeka na ciebie jutro?",
        "word": "PRZYGODA",
        "key": {"P": "🦜", "R": "🌈", "Z": "⚡", "Y": "🪀", "G": "🎁", "O": "🌞", "D": "🐬", "A": "🍎"},
        "decoys": ["M", "K"],
        "hints": [
            "🪀 jojo to Y.",
            "Coś wspaniałego i pełnego niespodzianek – jak ta gra!",
        ],
    },
]
