# Memory Game

A card-matching game I built. Pick a theme, flip cards two at a time, and find all the pairs. The images come from public APIs, so you get a different set every time you play.

## Themes

- Harry Potter
- Dogs
- Countries (flags)
- Surprise Me, which just picks one of the above at random

The images come from three free APIs: the HP API (hp-api.onrender.com), Dog CEO (dog.ceo), and REST Countries (restcountries.com).

## Playing

Click a card to flip it, then click another. If they match they stay up; if not, they flip back after a second. Clear the board to win. There's a restart button and a way back to the theme menu.

## Running it locally

You can't just double-click the HTML file. The Countries theme talks to an API that checks where the request is coming from, and a `file://` page doesn't count as a real origin, so it fails. You need to serve the page over http. The easiest way is the Live Server extension in VS Code, which gives you a URL like `http://127.0.0.1:5500`.

1. Grab the files: `memorygame.html`, `gamescript.js`, `gamestyle.css`, `config.example.js`.
2. Copy `config.example.js` to `config.js` and drop your own REST Countries key in where the placeholder is. If you skip this you'll get a `CONFIG is not defined` error, which just means config.js doesn't exist yet.
3. Open it with Live Server (or whatever local server you like).

Harry Potter and Dogs work right away with no key. Countries needs one, and you also have to add your hostname (`127.0.0.1`, `localhost`, or wherever you host it) to the key's allowed list on the REST Countries site. Hostname only there, no `http://` or port.

One thing worth saying: don't commit `config.js` with your real key in it. It's in `.gitignore` already for that reason. This is a frontend-only app so the key is technically visible to anyone who pokes around anyway, which is why the allowed-hostname list is what actually protects it. If it ever leaks, rotate it and move on.

## Settings

Anything you'd want to tweak lives in `config.js`:

| Setting | What it does |

 `MAX_PAIRS` | how many pairs (cards = pairs × 2) |
 `GRID_COLUMNS` | columns in the board |
 `UNFLIP_DELAY_MS` | how long a wrong pair stays up before flipping back |
 `COUNTRIES_LIMIT` | how many countries to pull before picking |
 `API_URLS` | the API base URLs |
 `THEMES` | the theme names |
 `COUNTRIES_API_KEY` | your REST Countries key |

If you change the number of pairs, change `GRID_COLUMNS` to match or the board looks off. Six pairs with four columns gives you 12 cards in a clean grid, for example.

## Files

memorygame.html     the page
gamescript.js       game logic and API calls
gamestyle.css       styling and the flip animation
config.example.js   template, copy this to config.js
config.js           your real settings and key (gitignored, you make this)
.gitignore          keeps config.js out of git

## Author

Idan Magen — https://github.com/Idanm003
