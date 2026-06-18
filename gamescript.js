const MAX_PAIRS = 8;
const API_URLS = {
    HARRY_POTTER: "https://hp-api.onrender.com/api",
    DOGS: "https://dog.ceo/api",
    COUNTRIES: "https://api.restcountries.com/countries/v5",
};
const THEMES = ["Harry Potter", "Dogs", "Countries", "Random"];

const gameBoard = document.getElementById("game-board");
const gameControls = document.getElementById("game-controls");
const themeButtons = document.querySelector(".theme-buttons");

let lockedBoard = false;
let hasFlippedOver = false;
let currentTheme = '';
let firstCard, secondCard;
let matchedCards = 0;

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
            const res = await fetch(`${API_URLS.COUNTRIES}?limit=100`);
            if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch countries`);
            const data = await res.json();
            
            return pickRandomCards(MAX_PAIRS, data).map(country => ({
                src: country['flag.url_png'], 
                alt: country['name.common'],
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
    gameBoard.style.display = "grid";
    gameControls.style.display = "block";
    themeButtons.style.display = "none";
    document.querySelector(".winMsg").style.display = "none";

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
    gameBoard.style.display = "none";
    gameControls.style.display = "none";
    document.querySelector(".winMsg").style.display = "block";
}

function restartGame() {
    startTheme(currentTheme);
}

function goBackToThemes() {
    gameBoard.style.display = "none";
    gameControls.style.display = "none";
    document.querySelector(".winMsg").style.display = "none";
    themeButtons.style.display = "flex";
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