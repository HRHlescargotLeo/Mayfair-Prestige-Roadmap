# Mayfair Prestige website prototypes – requirements

Each requirement maps to the numbered ideas on the internal Opportunities page (phase 1). Section comments in the HTML carry these IDs, e.g. `<!-- Latest arrivals (R10) -->`.

## Global

| ID | Requirement | Ideas |
|---|---|---|
| R01 | Prototype navigator replaces Mayfair Prestige's own header, navigation and breadcrumbs: pack name, Overview, prototypes 1–5, Notes switch | – |
| R02 | Notes switch, off by default and remembered for the session; shows the "What we're proposing / Why" panel and the numbered annotations | – |
| R03 | Previous / next pager replaces the site footer | – |
| R04 | One set of facts used everywhere (hours, phone, address, years trading) | 42 |
| R05 | Phone and WhatsApp shown as text and as links on every prototype, WhatsApp prefilled with the page | 24, 25 |
| R06 | Sample data clearly labelled; real names, prices and mileages from the live site, invented specifics marked as sample | – |
| R07 | Every page works at 390px with no horizontal scroll | 6 |
| R08 | Two tabs in the navigator and on the landing pages: Big improvements (prototypes 1–5) and Quick wins (QW1–QW29); each tab has its own overview, and the pager stays within the tab | – |

## Prototype 1 – The showroom online

| ID | Requirement | Ideas |
|---|---|---|
| R10 | Homepage: latest arrivals row and one featured car with a one-line hook | 1 |
| R11 | Collections (Rolls-Royce, Ferrari, G-Class, Classics, Electric, SUVs) with counts, opening a filtered inventory | 5 |
| R12 | Sort by price (both ways), newest arrival, mileage and year | 2 |
| R13 | Min and max budget in bands that reach every car, with counts | 3 |
| R14 | Mileage bands, era, body, fuel, colour and gearbox filters; options with no cars hidden | 4 |
| R15 | At mobile width a single "Filter and sort" button opens a sheet; first car visible on the first screen | 6 |
| R16 | Status labels: New arrival, Reserved, Under offer | 7 |
| R17 | Cards show colour and photo count instead of top speed; titles wrap | 8, 9 |
| R18 | Cars without photography show "Photography in progress" | 9 |
| R19 | Save to shortlist and compare up to three cars | 10 |

## Prototype 2 – Every car, properly presented

| ID | Requirement | Ideas |
|---|---|---|
| R20 | Key facts panel beside the gallery: price, finance from, mileage, year, colour and interior, gearbox, owners | 13 |
| R21 | Key information list (owners, history, last service, warranty, UK supplied, notable options) and a description about this car | 14 |
| R22 | Gallery with count, grouped thumbnails and full-screen view | 18 |
| R23 | Video walkaround and video-call viewing request | 15 |
| R24 | Three distinct actions: book a viewing, reserve, call or WhatsApp with the car named | 16 |
| R25 | Finance example with link to a prefilled calculator | 17 |
| R26 | Save and share (WhatsApp, email, copy link) | 19 |
| R27 | More like this: same make plus same price band and body style | 20 |
| R28 | Unique page title, description, canonical and structured data (shown as an annotation) | 11, 12 |
| R29 | Delivery offered on every car | 38 |

## Prototype 3 – Book a viewing, reserve with confidence

| ID | Requirement | Ideas |
|---|---|---|
| R30 | Viewing request in steps: showroom or video call, day and time, details, confirmation with a reference | 22 |
| R31 | Reserve page shows the car and explains what reserving means before the form | 21 |
| R32 | Contact page with phone, WhatsApp, email, address, hours and directions at the top, then four routes | 23 |
| R33 | Short forms with visible labels, the car prefilled, optional message and optional finance interest | 26 |
| R34 | Confirmation on screen says who will be in touch and when | 21, 22 |
| R35 | Links pass a stock ID, never the registration | 46 |
| R36 | The people you'll deal with and how to find the showroom | 30, 31 |

## Prototype 4 – By invitation

| ID | Requirement | Ideas |
|---|---|---|
| R40 | Alerts by marque, body style and budget, with consent; shows how many current cars match | 35 |
| R41 | Find me a car brief, prefilled from a sold car or an empty search | 34 |
| R42 | AutoTrader rating and recent reviews, linking to the source | 27, 28 |
| R43 | Previously sold as a grid with filter and search, "Find me one like this" on every car | 29 |
| R44 | Selling: what happens after a valuation, and a route for collections | 33 |

## Prototype 5 – Private services

| ID | Requirement | Ideas |
|---|---|---|
| R50 | Services page with in-page navigation | 37–41 |
| R51 | Armoured vehicles: what can be sourced, how discretion is handled, private enquiry | 39 |
| R52 | Bespoke and conversions: kinds of work and an enquiry | 40 |
| R53 | Storage: what's included, cost calculator from the published price, enquiry | 37 |
| R54 | Delivery and transport quote request | 38 |
| R55 | Finance page: products explained, indicative calculator, representative example placeholder | 36 |
| R56 | Buying from abroad: viewing remotely, export, shipping and payment | 41 |


## Quick wins tab

One standalone demo per quick win (src/pages/qw-01.html to qw-29.html, generated by tools/quick_wins.py). Each shows only that change, with Today and Proposed side by side where a comparison helps. No estimates, prices or effort labels appear in the model.

| ID | Requirement | Ideas |
|---|---|---|
| QW1 | Cars on the homepage: A row of the latest arrivals under the search, so the homepage shows the cars. | 1 |
| QW2 | Let buyers sort the inventory: Sort by price either way, newest arrival, lowest mileage or year. | 2 |
| QW3 | A budget filter that reaches every car: Price bands that match the stock, including the cars under £50,000. | 3 |
| QW4 | Fewer, more useful filter options: Mileage bands, era, body and gearbox, with counts, and no empty options. | 4 |
| QW5 | Cars sooner on phones: A slim header and one "Filter and sort" button, so the first car shows on the first screen. | 6 |
| QW6 | Colour and photo count on cards: Show the car's colour instead of its top speed, and how many photos there are. | 8 |
| QW7 | Clean card details: No "Image coming soon", proper fuel types, titles that wrap and every derivative shown. | 9 |
| QW8 | Each car its own title and address: A page title, description and address for every car, so search engines see 40 cars. | 11 |
| QW9 | Car structured data: Tell search engines the price, mileage and availability of every car. | 12 |
| QW10 | Key facts beside the photos: Price, mileage and the three next steps beside the gallery, not under the description. | 13 |
| QW11 | A gallery that does the photography justice: Photos grouped into exterior, interior and details, with a count, thumbnails, full screen and swipe. | 18 |
| QW12 | Share a car: Share to WhatsApp or email, or copy the link, with the car's photo in the preview. | 19 |
| QW13 | More like this: Similar cars by marque, price and body style, not marque alone. | 20 |
| QW14 | A contact page with the details on it: Phone, WhatsApp, email, address and hours at the top, then four short routes. | 23 |
| QW15 | Tappable phone numbers: Every phone number a link, written the same way, and in the header of every page. | 24 |
| QW16 | WhatsApp that knows the car: WhatsApp on desktop as well as phones, with the car already named in the message. | 25 |
| QW17 | Lighter forms: Ask only what's needed, fill in the car, add a message box and make finance optional. | 26 |
| QW18 | Bring the AutoTrader reviews home: The 5.0 rating and three recent reviews on the homepage and car pages. | 27 |
| QW19 | Testimonials with the car and the date: Each testimonial with the car bought, the month, a photo and a link to the review. | 28 |
| QW20 | The people buyers will meet: Sales and finance on Meet the Team, with a line about each and a direct number. | 30 |
| QW21 | Say what happens after a valuation: A short panel beside the valuation form: the ways to sell and what happens next. | 33 |
| QW22 | Storage worth enquiring about: Photos, what's included, a cost calculator from the published price and an enquiry. | 37 |
| QW23 | Delivery offered on every car: A "Delivery to your door, UK and worldwide" line on car pages, with a quote request. | 38 |
| QW24 | One set of facts: Years trading, hours, phone number and showroom size agreed once and used everywhere. | 42 |
| QW25 | Rewrite the homepage copy: Homepage text rewritten in the voice of the newer About and Location pages. | 43 |
| QW26 | Homepage title and description: A page title and description that say what Mayfair Prestige is, not "affordable second hand cars". | 44 |
| QW27 | Fix the sitemaps: Serve the real sitemap at /sitemap.xml and stop listing 84 pages that no longer exist. | 45 |
| QW28 | Keep registrations out of links: Pass a stock number in links instead of the car's registration. | 46 |
| QW29 | One typeface for headings: Set car titles in Montserrat like every other heading, and stop loading Lato. | 47 |
