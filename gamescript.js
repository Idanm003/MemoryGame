const MAX_PAIRS = 8;
const API_URLS = {
    HARRY_POTTER: "https://hp-api.onrender.com/api",
    DOGS: "https://dog.ceo/api",
    COUNTRIES: "https://api.restcountries.com/countries/v5",
};
const THEMES = ["Harry Potter", "Dogs", "Countries", "Random"];

const gameBoard = document.getElementById("game-board");
const gameControls = document.getElementById("game-controls");
const themeChoose = document.getElementById("theme-choose");
const themeButtons = document.querySelector(".theme-buttons");
const winMsg = document.querySelector(".winMsg");

let lockedBoard = false;
let hasFlippedOver = false;
let currentTheme = '';
let firstCard, secondCard;
let matchedCards = 0;

function showView(view) {
    const allSections = [
        themeChoose,
        themeButtons,
        gameBoard,
        gameControls,
        winMsg
    ];
    allSections.forEach(elements => (elements.style.display = "none"));

    const layout = {
        themes: [[themeChoose, "block"], [themeButtons, "flex"]],
        game: [[gameBoard, "grid"], [gameControls, "block"]],
        win: [[winMsg, "block"]],
    };
    layout[view].forEach(([element, display]) => (element.style.display = display));
}

async function getImagesByTheme(theme) {
    if (theme === "Harry Potter") {
        try {
            const res = await fetch(`${API_URLS.HARRY_POTTER}/characters`);
            if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch Harry Potter characters`);
            const data = await res.json();
            const dataWithImages = data.filter(character => character.image);

            return pickRandomCards(MAX_PAIRS, dataWithImages).map(character => ({
                src: character.image, alt: character.name
            }));
        } catch (error) {
            console.error("Harry Potter API error:", error);
            throw error;
        }
    }

    if (theme === "Dogs") {
        try {
            const res = await fetch(`${API_URLS.DOGS}/breeds/image/random/${MAX_PAIRS}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch dog images`);
            const data = await res.json();

            return data.message.map((url, i) => ({ src: url, alt: 'Dog ' + i }));
        } catch (error) {
            console.error("Dogs API error:", error);
            throw error;
        }
    }

    if (theme === "Countries") {
        try {
            const res = await fetch(
                `${API_URLS.COUNTRIES}?response_fields=names.common,flag.url_png&limit=100`,
                { headers: { 'Authorization': 'Bearer rc_live_2c3d4cb8ba0841888a8936d14d07fccb' } }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch countries`);

            const body = await res.json();
            const countries = body.data.objects;

            const safeGet = (obj, path) =>
                path in obj ? obj[path] : path.split('.').reduce((obj, key) => (
                    obj && key in obj ? obj[key] : undefined), obj
                );
            const validCountries = countries.filter(countriesValid => safeGet(countriesValid, 'flag.url_png'));
            if (validCountries.length < MAX_PAIRS) {
                throw new Error(`Not enough countries with flag data: 
                    found ${validCountries.length}, need at least ${MAX_PAIRS}.`
                );
            }

            return pickRandomCards(MAX_PAIRS, validCountries).map(country => ({
                src: safeGet(country, 'flag.url_png'),
                alt: safeGet(country, 'names.common'),
            }));
        } catch (error) {
            console.error("Countries API error:", error);
            throw error;
        }
    }
}

function pickRandomCards(max, array) {
    const shuffled = shuffle(array);
    return shuffled.slice(0, max);
}

async function startTheme(theme) {
    if (theme === "Random") {
        const notRandom = THEMES.filter(t => t !== "Random");
        theme = notRandom[Math.floor(Math.random() * notRandom.length)];
    }

    currentTheme = theme;

    try {
        const images = await getImagesByTheme(theme);
        startGame(images);
    } catch (error) {
        console.error(error);
        gameBoard.innerHTML = `<p class="error">Failed to load game. Please try again.</p>`;
    }
}

function startGame(images) {
    lockedBoard = false;
    hasFlippedOver = false;
    matchedCards = 0;
    [firstCard, secondCard] = [null, null];

    gameBoard.innerHTML = "";
    showView("game");

    const deck = [];
    images.forEach((image, index) => {
        deck.push(createCard(image, index));
        deck.push(createCard(image, index));
    });

    shuffle(deck).forEach(card => gameBoard.appendChild(card));
}

function handleCardFlip(e) {
    const clickedCard = e.target.closest('.card');

    if (clickedCard === firstCard || lockedBoard) return;

    clickedCard.classList.add("flip");

    if (!hasFlippedOver) {
        hasFlippedOver = true;
        firstCard = clickedCard;
        return;
    }

    secondCard = clickedCard;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener("click", handleCardFlip);
    secondCard.removeEventListener("click", handleCardFlip);
    matchedCards++;
    if (matchedCards === MAX_PAIRS) {
        handleWin();
    }
    resetBoard();
}

function unflipCards() {
    lockedBoard = true;
    setTimeout(() => {
        firstCard.classList.remove("flip");
        secondCard.classList.remove("flip");
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [hasFlippedOver, lockedBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function handleWin() {
    showView("win");
}

function restartGame() {
    startTheme(currentTheme);
}

function goBackToThemes() {
    showView("themes");
    matchedCards = 0;
}

function shuffle(array) {
    const copiedArray = [...array];
    for (let i = copiedArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
    }
    return copiedArray;
}

function createCard(image, index) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.card = index;
    card.innerHTML = `<img src="${image.src}" alt="${image.alt}" />`;
    card.addEventListener("click", handleCardFlip);
    return card;
}