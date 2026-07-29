"""Debug puzzles – a short 'program' of steps contains exactly one buggy step.

The child reads the plan and clicks the step that is wrong – just like
a programmer hunting a bug.

Each puzzle:
  id, title, description – metadata
  story                  – what the robot is trying to do (PL)
  steps                  – list of steps; exactly one is wrong
  bug_index              – 0-based index of the buggy step
  fix                    – the corrected step (shown in the explanation)
  explanation            – why it was a bug (PL)
  hints                  – progressive hints (PL)
"""

DEBUG_PUZZLES = [
    {
        "id": 1,
        "title": "🐞 Kanapka",
        "description": "Robot robi kanapkę, ale coś poszło nie tak!",
        "story": "Robot Bajtek dostał program „zrób kanapkę”. Znajdź błędny krok!",
        "steps": [
            "Weź dwie kromki chleba",
            "Posmaruj je masłem",
            "Połóż plasterek sera",
            "Wyrzuć kanapkę do kosza",
            "Zjedz kanapkę",
        ],
        "bug_index": 3,
        "fix": "Połóż kanapkę na talerzu",
        "explanation": "Po wyrzuceniu kanapki nie da się jej zjeść! Programista sprawdza każdy krok – to się nazywa debugowanie.",
        "hints": [
            "Przeczytaj kroki po kolei i wyobraź sobie, co robi robot.",
            "Czy po jednym z kroków dalsza część programu w ogóle się uda?",
        ],
    },
    {
        "id": 2,
        "title": "🐞 Mycie zębów",
        "description": "Wieczorny program robota ma błąd.",
        "story": "Bajtek myje zęby przed snem. Który krok jest zepsuty?",
        "steps": [
            "Weź szczoteczkę",
            "Nałóż pastę do zębów",
            "Szczotkuj zęby 2 minuty",
            "Wypłucz buzię wodą",
            "Schowaj szczoteczkę do lodówki",
        ],
        "bug_index": 4,
        "fix": "Odstaw szczoteczkę do kubka",
        "explanation": "Szczoteczka mieszka w kubku, nie w lodówce! Jeden zły krok psuje cały program.",
        "hints": [
            "Początek programu wygląda dobrze…",
            "Gdzie powinna trafić szczoteczka po myciu?",
        ],
    },
    {
        "id": 3,
        "title": "🐞 Kwiatek",
        "description": "Program sadzenia kwiatka nie działa.",
        "story": "Bajtek sadzi słonecznik. Znajdź błąd, zanim roślinka zwiędnie!",
        "steps": [
            "Wykop mały dołek",
            "Włóż nasionko do dołka",
            "Zasyp dołek ziemią",
            "Podlej nasionko colą",
            "Postaw doniczkę na słońcu",
        ],
        "bug_index": 3,
        "fix": "Podlej nasionko wodą",
        "explanation": "Rośliny piją wodę, nie colę! Komputer zrobi dokładnie to, co każe program – nawet głupstwo.",
        "hints": [
            "Co roślinki lubią pić?",
        ],
    },
    {
        "id": 4,
        "title": "🐞 Ciasto",
        "description": "Urodzinowe ciasto się nie udało.",
        "story": "Bajtek piecze ciasto na urodziny. Dlaczego jest zimne i twarde?",
        "steps": [
            "Wsyp mąkę do miski",
            "Dodaj jajka i cukier",
            "Wymieszaj ciasto",
            "Włóż ciasto do zamrażarki",
            "Poczekaj aż się upiecze",
        ],
        "bug_index": 3,
        "fix": "Włóż ciasto do piekarnika",
        "explanation": "Ciasto piecze się w piekarniku, a nie mrozi w zamrażarce. Dlatego krok „poczekaj aż się upiecze” nigdy się nie kończy!",
        "hints": [
            "Gdzie robi się gorąco: w zamrażarce czy w piekarniku?",
        ],
    },
    {
        "id": 5,
        "title": "🐞 Zimowy spacer",
        "description": "Robot ubiera się na śnieg. Brrr!",
        "story": "Na dworze pada śnieg. Bajtek się ubiera – ale zmarzły mu stopy!",
        "steps": [
            "Załóż ciepły sweter",
            "Załóż kurtkę",
            "Załóż czapkę i szalik",
            "Załóż sandały",
            "Załóż rękawiczki",
        ],
        "bug_index": 3,
        "fix": "Załóż ciepłe buty",
        "explanation": "Sandały na śnieg?! Debugowanie to szukanie kroku, który nie pasuje do zadania.",
        "hints": [
            "Który element ubrania nie pasuje do zimy?",
        ],
    },
    {
        "id": 6,
        "title": "🐞 Karmienie psa",
        "description": "Piesek Pixel jest głodny, a program szwankuje.",
        "story": "Bajtek karmi pieska Pixela. Czemu Pixel nie może zjeść?",
        "steps": [
            "Weź miskę Pixela",
            "Wsyp karmę do miski",
            "Postaw miskę na dachu",
            "Zawołaj Pixela",
            "Pogłaszcz Pixela",
        ],
        "bug_index": 2,
        "fix": "Postaw miskę na podłodze",
        "explanation": "Piesek nie sięgnie miski na dachu! Program musi pasować do tego, kto go wykonuje.",
        "hints": [
            "Wyobraź sobie małego pieska. Dokąd nie da rady sięgnąć?",
        ],
    },
    {
        "id": 7,
        "title": "🐞 Przez ulicę",
        "description": "Program przechodzenia przez ulicę ma groźny błąd.",
        "story": "Bajtek idzie do parku i musi przejść przez ulicę. Znajdź błąd – to ważne!",
        "steps": [
            "Zatrzymaj się przed pasami",
            "Spójrz w lewo i w prawo",
            "Poczekaj na czerwone światło",
            "Przejdź spokojnie przez pasy",
        ],
        "bug_index": 2,
        "fix": "Poczekaj na zielone światło",
        "explanation": "Przechodzimy TYLKO na zielonym świetle! Niektóre błędy w programach są naprawdę niebezpieczne – dlatego programiści wszystko sprawdzają.",
        "hints": [
            "Na jakim świetle wolno przechodzić przez ulicę?",
        ],
    },
    {
        "id": 8,
        "title": "🐞 Plecak do szkoły",
        "description": "W plecaku Bajtka coś miauczy…",
        "story": "Bajtek pakuje plecak do szkoły. Który krok jest błędem?",
        "steps": [
            "Włóż książki",
            "Włóż piórnik",
            "Włóż śniadanie",
            "Włóż kota",
            "Zapnij plecak",
        ],
        "bug_index": 3,
        "fix": "Włóż bidon z wodą",
        "explanation": "Kot nie jest przyborem szkolnym! Debugowanie czasem bywa zabawne.",
        "hints": [
            "Co miauczy i na pewno nie powinno być w plecaku?",
        ],
    },
    {
        "id": 9,
        "title": "🐞 Bałwan",
        "description": "Bałwan wyszedł jakiś dziwny…",
        "story": "Bajtek lepi bałwana, ale sąsiedzi się śmieją. Czemu?",
        "steps": [
            "Ulep dużą kulę śniegu",
            "Postaw na niej średnią kulę",
            "Postaw małą kulę na samej górze",
            "Zrób nos z banana",
            "Włóż patyki jako ręce",
        ],
        "bug_index": 3,
        "fix": "Zrób nos z marchewki",
        "explanation": "Bałwan ma nos z marchewki! Program działał, ale wynik był zły – takie błędy też trzeba znajdować.",
        "hints": [
            "Z jakiego warzywa robi się nos bałwana?",
        ],
    },
    {
        "id": 10,
        "title": "🐞 Kąpiel",
        "description": "Wieczorna kąpiel robota – z błędem!",
        "story": "Bajtek bierze kąpiel przed snem. Znajdź błędny krok.",
        "steps": [
            "Napuść ciepłej wody do wanny",
            "Wsyp płyn do kąpieli",
            "Wejdź do wanny w ubraniu",
            "Umyj się dokładnie",
            "Wytrzyj się ręcznikiem",
        ],
        "bug_index": 2,
        "fix": "Zdejmij ubranie i wejdź do wanny",
        "explanation": "Do wanny wchodzimy bez ubrania! Komputer nie domyśli się sam – program musi być dokładny.",
        "hints": [
            "Co trzeba zrobić z ubraniem przed kąpielą?",
        ],
    },
]
