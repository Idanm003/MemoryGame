# Memory Game

A browser-based memory card game with multiple image themes pulled live from public APIs. 
Flip cards two at a time, find all the matching pairs, and win.

## Features

* Four Themes Available: "Harry Potter", "Dogs", "Countries" or a random "Suprise Me" (picks one of three at random)
* Card images loaded from public APIs, so each is different every time
* Flip animations, match detection, and a win screen
* The ability to restart the game (reloads with different cards), and the ability to go back to "Main Menu"

## API Usage

Harry Potter - https://hp-api.onrender.com/
Dogs - https://dog.ceo/dog-api/
Countries - https://restcountries.com/ (Needs authentication / API key)

## How To Play

1. Pick a theme
2. Click a card to flip over, then click on secondary card
3. If two cards match, the pair stay face-up. If not they flip over
4. Match all pairs to win

## Setup

1. Get the files

Clone or download the project so you have index.html, gamescript.js, and gamestyle.css in the same folder.

2. Serve it over HTTP (don't just double-click)

The Countries theme makes an authenticated request, and the API checks the page's origin. 
A file:// page has no real origin, so it will fail. 
Run a local server instead — for example, the Live Server extension in VS Code, which serves the page at something like http://127.0.0.1:5500.

3. Configure the Countries API key

The Countries theme needs your own REST Countries key:
Sign up at restcountries.com for a free key.
On the API Keys page, allow-list the hostname you run the game from (e.g. 127.0.0.1 and localhost for local dev, or your deployed domain). 
Enter the hostname only — no http://, no port, no path.
Put your key in gamescript.js where the Authorization header is set.

Do not commit your real API key to a public repo. Treat it as a secret, and rotate it if it ever leaks. 
(For a frontend-only app the key is visible to users anyway, which is exactly why the hostname allow-list matters — it stops a copied key from working elsewhere.)

The Harry Potter and Dogs themes need no setup and work immediately.

## How It Works

startTheme() picks the theme (excluding "Random"), fetches images, and starts the game.
getImagesByTheme() calls the right API and normalizes each result into { src, alt }.
showView() controls which screen is visible (themes / game / win) by hiding everything, then showing only the sections that screen needs.
Cards are created as a shuffled deck of pairs; clicks are handled by handleCardFlip(), with matches confirmed in checkForMatch().

## Author

Idan Magen | Github: https://github.com/Idanm003
