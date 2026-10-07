# Mayfair Prestige roadmap prototypes

Clickable prototypes of five improvements to [mayfairprestigeuk.co.uk](https://www.mayfairprestigeuk.co.uk/), prepared by ClerksWell.

- **Live:** https://hrhlescargotleo.github.io/Mayfair-Prestige-Roadmap/
- **Phase:** 3 of 3 – designed prototypes (version 2, 7 October 2026). The design lives entirely in `src/css/theme.css`; empty that file and the pack returns to the greyscale version 1.
- **Photography:** `src/js/photos.js` loads Mayfair Prestige's own photos from mayfairprestigeuk.co.uk and applies each one only once it has loaded; anywhere they can't be reached, a drawn placeholder stays. Photography © Mayfair Prestige.

## The prototypes

1. **The showroom online** – `pages/home.html`, `pages/inventory.html`
2. **Every car, properly presented** – `pages/car.html?car=<id>`
3. **Book a viewing, reserve with confidence** – `pages/viewing.html`, `pages/reserve.html`, `pages/contact.html`
4. **By invitation** – `pages/by-invitation.html`, `pages/sold.html`
5. **Private services** – `pages/services.html`, `pages/finance.html`

`index.html` is the landing page for reviewers. `modules/library.html` shows each new component once. Requirements (R01–R56, mapped to the phase 1 idea numbers) are in `requirements/requirements.md`.

## Data

`src/js/data.js` holds the 40 cars in stock and the 84 previously sold names from the live site on 7 October 2026 (prices, mileages, derivatives, photo counts and image paths). Colour, interior, owners, status and days in stock are sample data. Finance figures use an illustrative 9.9% APR and are not quotes.

## Build

```
node build-includes.js && node validate.js
```

`build-includes.js` resolves `<!-- @@include -->` and `~/` paths from `src/` into `docs/`, and writes `docs/.nojekyll`. `validate.js` checks tag balance, inline handlers and internal links.

## GitHub Pages

Settings → Pages → Build and deployment: **Deploy from a branch**, branch **main**, folder **/docs**.

The repository and the Pages site are public.
