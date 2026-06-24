const MAX_PAIRS = CONFIG.MAX_PAIRS;
const GRID_COLUMNS = CONFIG.GRID_COLUMNS;
const UNFLIP_DELAY_MS = CONFIG.UNFLIP_DELAY_MS;
const COUNTRIES_LIMIT = CONFIG.COUNTRIES_LIMIT;
const API_URLS = CONFIG.API_URLS;
const THEMES = CONFIG.THEMES;

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
    themeChoose.style.display = "none";
    themeButtons.style.display = "none";
    gameBoard.style.display = "none";
    gameControls.style.display = "none";
    winMsg.style.display = "none";

    if (view === "themes") {
        themeChoose.style.display = "block";
        themeButtons.style.display = "flex";
    } else if (view === "game") {
        gameBoard.style.display = "grid";
        gameControls.style.display = "block";
    } else if (view === "win") {
        winMsg.style.display = "block";
    }
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
                `${API_URLS.COUNTRIES}?response_fields=names.common,flag.url_png&limit=${COUNTRIES_LIMIT}`,
                { headers: { 'Authorization': `Bearer ${CONFIG.COUNTRIES_API_KEY}` } }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch countries`);

            const body = await res.json();
            const countries = body.data.objects;

            const validCountries = countries.filter(country => getCountryFlag(country));
            if (validCountries.length < MAX_PAIRS) {
                throw new Error(`Not enough countries with flag data: found ${validCountries.length}, need at least ${MAX_PAIRS}.`);
            }

            return pickRandomCards(MAX_PAIRS, validCountries).map(country => ({
                src: getCountryFlag(country),
                alt: getCountryName(country),
            }));
        } catch (error) {
            console.error("Countries API error:", error);
            throw error;
        }
    }
}

function getCountryFlag(country) {
    if (!country.flag) return undefined;
    return country.flag.url_png;
}

function getCountryName(country) {
    if (!country.names) return undefined;
    return country.names.common;
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
    gameBoard.style.gridTemplateColumns = `repeat(${GRID_COLUMNS}, 1fr)`;
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
    }, UNFLIP_DELAY_MS);
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