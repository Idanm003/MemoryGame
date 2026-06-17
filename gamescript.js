const MAX_PAIRS = 8;
const API_URLS = {
    HARRY_POTTER: "https://hp-api.onrender.com/api",
    DOGS: "https://dog.ceo/api",
    COUNTRIES: "https://restcountries.com/v3.1",
};
const THEMES =
    [
        "Harry Potter",
        "Dogs",
        "Countries",
        "Random"
    ];

let lockedBoard = false;
let hasFlippedOver = false;
let [firstCard, secondCard] = [null, null];

async function startTheme(theme) {
    if (theme === "Random") {
        const notRandom = THEMES.filter(t => t !== "Random");
        theme = notRandom[Math.floor(Math.random() * notRandom.length)];
    }

    currentTheme = theme;
    const images = getImagesByTheme(theme);
    startGame(images);
};

async function getImagesByTheme(theme) {
    if (theme === "Harry Potter") {
        const res = await fetch(`${API_URLS.HARRY_POTTER}/characters`);
        const data = await res.json();
        const withImages = data.filter(character => character.image);

        return pickRandomCards(MAX_PAIRS, withImages).map(character => ({ 
            src: character.image, alt: character.name
        }));
    }

    if (theme === "Dogs") {
        const res = await fetch(`${API_URLS.DOGS}/breeds/image/random/${MAX_PAIRS}`);
        const data = await res.json();

        return data.message.map((url, i) => ({ src: url, alt: 'Dog ' + i }));
    }

    if (theme === "Countries") {
        const res = await fetch(`${API_URLS.COUNTRIES}/all`);
        const data = await res.json();

        return pickRandomCards(MAX_PAIRS, data).map(country => ({
            src: country.flags.png, alt: country.name.common,
        }));
    }
}

function startGame(images) {
    
}