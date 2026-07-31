"""Melody games – Simon-style: listen to a sequence of colour-tones and repeat it.

The sequence itself is generated in the browser; each level defines difficulty.

Each level:
  id, title, description – metadata
  pads                   – number of colour pads (3 or 4)
  length                 – sequence length to repeat
  speed                  – ms per note during playback (smaller = faster)
  hints                  – progressive hints (PL)
"""

MELODY_GAMES = [
    {
        "id": 1,
        "title": "🎵 Trzy dźwięki",
        "description": "Posłuchaj i powtórz 3 dźwięki.",
        "pads": 3,
        "length": 3,
        "speed": 700,
        "hints": [
            "Naciśnij ▶ i uważnie patrz, które kolory się świecą.",
            "Możesz posłuchać melodii jeszcze raz – to nic nie kosztuje!",
        ],
    },
    {
        "id": 2,
        "title": "🎵 Cztery dźwięki",
        "description": "Melodia rośnie – 4 dźwięki.",
        "pads": 3,
        "length": 4,
        "speed": 700,
        "hints": [
            "Powtarzaj w głowie kolory jak rymowankę: „zielony, różowy, zielony…”",
        ],
    },
    {
        "id": 3,
        "title": "🎵 Nowy kolor!",
        "description": "Dochodzi czwarty kolor. Powtórz 4 dźwięki.",
        "pads": 4,
        "length": 4,
        "speed": 700,
        "hints": [
            "Teraz są 4 przyciski – słuchaj jeszcze uważniej.",
        ],
    },
    {
        "id": 4,
        "title": "🎵 Piątka",
        "description": "Powtórz melodię z 5 dźwięków.",
        "pads": 4,
        "length": 5,
        "speed": 650,
        "hints": [
            "Podziel melodię na dwie części: najpierw 3 dźwięki, potem 2.",
        ],
    },
    {
        "id": 5,
        "title": "🎵 Szóstka",
        "description": "6 dźwięków – dasz radę!",
        "pads": 4,
        "length": 6,
        "speed": 650,
        "hints": [
            "Programiści dzielą duże zadania na małe kawałki – melodię też można!",
        ],
    },
    {
        "id": 6,
        "title": "🎵 Szybciej!",
        "description": "6 dźwięków, ale szybsze tempo.",
        "pads": 4,
        "length": 6,
        "speed": 480,
        "hints": [
            "Nie panikuj przy szybkim tempie – kolejność się nie zmienia.",
        ],
    },
    {
        "id": 7,
        "title": "🎵 Siódemka",
        "description": "7 szybkich dźwięków.",
        "pads": 4,
        "length": 7,
        "speed": 480,
        "hints": [
            "Posłuchaj dwa razy zanim zaczniesz klikać.",
        ],
    },
    {
        "id": 8,
        "title": "🎵 Mistrz melodii",
        "description": "Finał: 8 dźwięków w szybkim tempie!",
        "pads": 4,
        "length": 8,
        "speed": 420,
        "hints": [
            "Ośmiodźwiękowa melodia to jak ośmiokrokowy program – krok po kroku!",
        ],
    },
]
