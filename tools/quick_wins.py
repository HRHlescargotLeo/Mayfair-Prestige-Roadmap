#!/usr/bin/env python3
"""quick_wins.py: writes the Quick wins tab into src/.

    python3 tools/quick_wins.py && node build-includes.js && node validate.js

Generates src/quick-wins.html (the tab's overview), src/pages/qw-01.html to
qw-29.html (one demo per quick win) and src/includes/qw-links.html (the
navigator and pager sequence). Edit the content here, not in the generated
pages. Behaviour lives in src/js/quickwins.js; styling in components.css
(greyscale) and theme.css (design).
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

THEMES = [
    ("find", "Finding the right car"),
    ("car", "The car page"),
    ("ask", "Getting in touch"),
    ("trust", "Proof and people"),
    ("serv", "Selling and services"),
    ("fix", "Facts, search and housekeeping"),
]


def cmp(today, proposed, stack=False, labels=("Today", "Proposed")):
    cls = "qw-compare stack" if stack else "qw-compare"
    return (f'<div class="{cls}">'
            f'<section class="qw-pane qw-today" aria-label="{labels[0]}"><p class="qw-label">{labels[0]}</p>{today}</section>'
            f'<section class="qw-pane qw-proposed" aria-label="{labels[1]}"><p class="qw-label">{labels[1]}</p>{proposed}</section>'
            '</div>')


def picker(default, label="Show it with"):
    return (f'<div class="field qw-picker"><label for="qw-car">{label}</label>'
            f'<select id="qw-car" data-qw-car data-default="{default}"></select></div>')


def note(n, text, query=False):
    kind = "Open question" if query else "Behaviour"
    cls = "wf-note query" if query else "wf-note"
    return f'<p class="{cls}" data-note="{n}"><span class="wf-note-label">{kind}</span>{text}</p>'


def sel(label, *opts, dis=True):
    o = "".join(f"<option>{x}</option>" for x in (opts or [label]))
    return f'<div class="field"><label>{label}</label><select{" disabled" if dis else ""}>{o}</select></div>'


SEARCH6 = "".join(sel(x) for x in ["Make", "Model", "Max Price", "Max Mileage", "Fuel", "Body"])

QWS = []


def qw(**k):
    QWS.append(k)


# --------------------------------------------------------------------------
# Finding the right car
# --------------------------------------------------------------------------
qw(idea=1, theme="find", nav="Cars on the homepage", title="Cars on the homepage",
   line="A row of the latest arrivals under the search, so the homepage shows the cars.",
   try_="Compare the two homepages and see where the first car appears.",
   propose="Add a \"Latest arrivals\" row under the search band: eight cars, newest first, each with its photo, price, mileage and colour, and a link to the full inventory. It fills itself from the stock, so nobody has to maintain it.",
   why="The homepage has a search band, three service tiles and several paragraphs of text. None of the 40 cars in stock appears on it, so a visitor has to search before they see anything for sale.",
   demo=cmp(
       '<div class="qw-site"><div class="wf-placeholder qw-hero">Showroom photograph 1600 × 540</div>'
       f'<div class="search-band qw-search"><div class="search-row">{SEARCH6}</div></div>'
       '<div class="qw-tiles"><div class="wf-placeholder">Storage</div><div class="wf-placeholder">Armoured Vehicles</div><div class="wf-placeholder">Finance</div></div>'
       '<div class="qw-text"><p>[Several paragraphs about the business, its history and its services]</p></div>'
       '<p class="qw-marker">No cars on the page</p></div>',
       '<div class="qw-site" data-qw="latest"><div class="wf-placeholder qw-hero slim">Showroom photograph 1600 × 540</div>'
       f'<div class="search-band qw-search"><div class="search-row">{SEARCH6}</div></div>'
       '<div class="row between qw-sec-head"><h2>Latest arrivals</h2><a href="inventory.html">View all 40 cars</a></div>'
       '<div class="car-grid" data-latest></div>'
       '<div class="qw-tiles"><div class="wf-placeholder">Storage</div><div class="wf-placeholder">Armoured Vehicles</div><div class="wf-placeholder">Finance</div></div></div>',
       stack=True),
   notes=[note(1, "Newest first, using the date each car was added to stock. Reserved and under-offer cars stay in the row with their label, so the row never looks empty."),
          note(2, "Is the order cars are added to the site the same as the order they arrive? If not, we'd need an arrival date in the stock feed.", True)])

qw(idea=2, theme="find", nav="Sort the inventory", title="Let buyers sort the inventory",
   line="Sort by price either way, newest arrival, lowest mileage or year.",
   try_="Sort by lowest mileage, then by newest arrival.",
   propose="A sort control above the results: price high to low (today's order), price low to high, newest arrivals, lowest mileage and newest year. The choice is remembered as the buyer pages through.",
   why="Inventory lists 40 cars, twelve a page, always from most to least expensive, with no way to change the order. A buyer looking for a low-mileage car, or for what came in this week, has to read every page.",
   demo=cmp(
       '<p class="small muted">Always most expensive first. No sort control.</p><ol class="qw-list" data-today-order></ol><p class="small muted">and 34 more, over four pages</p>',
       '<div data-qw="sort"><div class="results-bar"><div class="field"><label for="qw-sort">Sort by</label><select id="qw-sort">'
       '<option value="price-desc">Price, highest first</option><option value="price-asc">Price, lowest first</option><option value="newest">Newest arrivals</option><option value="miles">Lowest mileage</option><option value="year">Newest year</option></select></div></div>'
       '<div class="car-grid" data-sorted></div><p class="small muted">Showing 8 of 40</p></div>',
       stack=True),
   notes=[note(1, "The sort is remembered for the session, so going back from a car returns to the same order.")])

qw(idea=3, theme="find", nav="Budget bands", title="A budget filter that reaches every car",
   line="Price bands that match the stock, including the cars under £50,000.",
   try_="Pick \"Under £50,000\", then try the other bands.",
   propose="Replace the single \"Max Price\" list with five bands that match the stock, each showing how many cars it holds: under £50,000, £50,000 to £100,000, £100,000 to £200,000, £200,000 to £300,000, and £300,000 and over.",
   why="Price is a single \"Max Price\" list of 66 options from £50,000 to £450,000. Five cars cost less than £50,000, from the Fiat 500C at £10,950 to the Mercedes 500 at £39,950, and there's no way to pick them out by budget.",
   demo=cmp(
       '<div class="field"><label>Max Price</label><select disabled><option>£50,000 (the lowest choice)</option></select></div>'
       '<p class="small">Cars in stock under £50,000: <b data-under-count>5</b>. None can be picked out by budget.</p><ul class="qw-list" data-under></ul>',
       '<div><fieldset class="qw-group"><legend>Budget</legend><div class="chip-set" data-bands></div></fieldset>'
       '<p class="result-count" aria-live="polite"><strong data-band-count></strong></p><div class="qw-minis" data-band-cars></div></div>'),
   wrap="budget",
   notes=[note(1, "Bands with no cars in them are hidden. The counts come from the stock, so they change as cars arrive and sell.")])

qw(idea=4, theme="find", nav="Better filters", title="Fewer, more useful filter options",
   line="Mileage bands, era, body and gearbox, with counts, and no empty options.",
   try_="Pick \"Classic, before 1990\", then \"Manual\", and watch the other counts change.",
   propose="Swap the long mileage list for five bands, and add era, body style and gearbox. Each option shows how many cars it would return, and options that would return nothing are hidden.",
   why="Max Mileage has 85 options in 1,000-mile steps up to 83,000. There's no filter for year or era, colour or gearbox, though the stock runs from 1960s Mustangs to cars delivered this year.",
   demo=cmp(
       '<div class="field"><label for="mile-today">Max Mileage</label><select id="mile-today" data-mile-today></select></div><p class="small muted">In 1,000-mile steps. No year, era or gearbox filter.</p>',
       '<div><div data-filter-groups></div><div class="row between"><p class="result-count" aria-live="polite"><strong data-filter-count></strong></p><button type="button" class="btn btn-secondary btn-sm" data-filter-clear>Clear</button></div><div class="qw-minis" data-filter-cars></div></div>'),
   wrap="filters",
   notes=[note(1, "Choosing an option updates every other count, so a buyer never picks a combination with no cars.")])

qw(idea=6, theme="find", nav="Cars sooner on phones", title="Cars sooner on phones",
   line="A slim header and one \"Filter and sort\" button, so the first car shows on the first screen.",
   try_="Scroll the two phones, then tap \"Filter and sort\" on the proposed one.",
   propose="On phones, use a slim photo strip and a single \"Filter and sort\" button that opens a sheet with all the filters. The first car then appears on the first screen.",
   why="At phone width the hero photo and six stacked dropdowns come first. The first car card on the Inventory page starts about 1,178 pixels down, more than a full screen of scrolling before anything for sale.",
   demo='<div class="qw-phones" data-qw="phone">'
        '<figure class="qw-phone"><figcaption class="qw-label">Today</figcaption><div class="qw-screen">'
        f'<div class="wf-placeholder qw-phone-hero">Showroom photograph 1600 × 540</div><div class="search-band qw-search">{SEARCH6}<button type="button" class="btn btn-block" disabled>Search</button></div>'
        '<p class="qw-fold">First car, about 1,178px down</p><div class="car-grid" data-phone-cars></div></div></figure>'
        '<figure class="qw-phone"><figcaption class="qw-label">Proposed</figcaption><div class="qw-screen">'
        '<div class="wf-placeholder qw-phone-hero slim">Showroom photograph 1600 × 540</div>'
        '<div class="qw-phone-bar"><b>40 cars</b><button type="button" class="btn btn-sm" data-sheet-open>Filter and sort</button></div>'
        '<div class="car-grid" data-phone-cars></div>'
        f'<div class="qw-sheet" data-sheet hidden role="dialog" aria-label="Filter and sort"><div class="row between"><b>Filter and sort</b><button type="button" class="btn btn-secondary btn-sm" data-sheet-close>Close</button></div>{SEARCH6.replace(" disabled", "")}<button type="button" class="btn btn-block" data-sheet-close>Show 40 cars</button></div>'
        '</div></figure></div>',
   notes=[note(1, "The sheet closes with the button or by showing results. Filters chosen in it show as removable tags above the cars.")])

qw(idea=8, theme="find", nav="Colour on cards", title="Colour and photo count on cards",
   line="Show the car's colour instead of its top speed, and how many photos there are.",
   try_="Switch to the 1968 Ford Mustang and compare the two cards.",
   propose="Replace \"Speed\" on stock cards with the colour, and show how many photos the car has. Colour is one of the first things a buyer filters on in their head, and a photo count tells them how much there is to see.",
   why="Cards show miles, gearbox, year, fuel and top speed. Colour isn't shown anywhere on the card, and top speed is the least useful of the five for this stock: on the classics it reads \"-\".",
   demo='<div data-qw="colour">' + picker("1968-ford-mustang") + cmp('<div class="qw-one" data-today-card></div>', '<div class="qw-one" data-new-card></div>') + '</div>',
   foot="Colours are sample data until the stock feed includes them.",
   notes=[note(1, "Does the stock feed hold the exterior and interior colour? If not, it's a field to add where cars are entered.", True)])

qw(idea=9, theme="find", nav="Clean card details", title="Clean card details",
   line="No \"Image coming soon\", proper fuel types, titles that wrap and every derivative shown.",
   try_="Compare the four cards in each row.",
   propose="Show a styled \"Photography in progress\" card until a car's photos are ready (or hold it back), map fuel types properly, show every car's derivative, and let long titles wrap onto a second line.",
   why="Three of the 40 cars show \"Image coming soon\", including the £499,950 2016 Phantom. The G63 cards read \"Petrol..\". The £279,950 2013 Phantom has no derivative line, and long titles are cut short with an ellipsis.",
   demo='<div data-qw="cleancards">' + cmp('<div class="car-grid qw-cards4" data-today-cards></div>', '<div class="car-grid qw-cards4" data-new-cards></div>', stack=True) + '</div>',
   notes=[note(1, "Should cars without photos be listed at all? Some dealers hold them back until they're photographed.", True)])

# --------------------------------------------------------------------------
# The car page
# --------------------------------------------------------------------------
qw(idea=11, theme="car", nav="Car page titles", title="Each car its own title and address",
   line="A page title, description and address for every car, so search engines see 40 cars.",
   try_="Change the car and watch the proposed search result and link preview change with it.",
   propose="Give every car page its own title (\"2014 Ferrari 458 Speciale, 6,500 miles | Mayfair Prestige\"), a written description, its own address as the canonical, and a share image. All of it comes from the stock data, so it costs nothing per car.",
   why="All 40 car pages have the title and description \"Vehicle Detail | Mayfair Prestige\" and tell search engines that their real address is /vehicle-detail/. That says the 40 pages are one page, so someone searching for a used Phantom in London is unlikely to find the five Mayfair Prestige has.",
   demo='<div data-qw="seo">' + picker("2014-ferrari-458") + cmp(
       '<p class="small muted">In search, for every car</p><div class="serp"><div class="u">www.mayfairprestigeuk.co.uk › vehicle-detail</div><div class="t">Vehicle Detail | Mayfair Prestige</div><p>Vehicle Detail | Mayfair Prestige</p></div>'
       '<p class="small muted">Pasted into WhatsApp</p><div class="qw-linkcard bare"><div><b>Vehicle Detail | Mayfair Prestige</b><span>mayfairprestigeuk.co.uk</span></div></div>',
       '<p class="small muted">In search</p><div class="serp" data-serp-new></div>'
       '<p class="small muted">Pasted into WhatsApp</p><div class="qw-linkcard" data-link-new></div>') + '</div>',
   notes=[note(1, "Titles, descriptions and share images are built from the stock fields, so a new car is ready for search the moment it's published."),
          note(2, "The 84 old /previously-sold/ addresses are covered separately in QW27.")])

qw(idea=12, theme="car", nav="Structured data", title="Car structured data",
   line="Tell search engines the price, mileage and availability of every car.",
   try_="Change the car and read the data that would sit behind its page.",
   propose="Add schema.org Car and Offer data to every car page: price, availability, mileage, year, fuel, gearbox and the dealer's address. Search engines can then show price and stock details in results.",
   why="We found no structured data on any car page, so search engines have to guess what the page is about.",
   demo='<div data-qw="schema">' + picker("2020-rolls-royce-cullinan") + cmp(
       '<div class="qw-empty">No structured data on the page</div>',
       '<p class="small muted">How a result can look</p><div class="serp" data-rich></div><details class="qw-code"><summary>The data behind it</summary><pre data-jsonld></pre></details>') + '</div>',
   notes=[note(1, "Generated from the stock feed. Availability changes to \"limited\" when a car is reserved or under offer. How search engines display it is up to them.")])

qw(idea=13, theme="car", nav="Key facts by the photos", title="Key facts beside the photos",
   line="Price, mileage and the three next steps beside the gallery, not under the description.",
   try_="Compare where the price and mileage appear on each version.",
   propose="A panel beside the gallery with the price, mileage, year, colour, interior, gearbox and owners, then the three next steps: book a viewing, reserve, and call or WhatsApp. On a phone, a bar with the price and \"Book a viewing\" stays at the bottom of the screen.",
   why="On the 458 page the price comes after a long general description and a tabbed specification. Mileage isn't in the Car Details panel at all; it's mentioned in the description.",
   demo='<div data-qw="keyfacts">' + picker("2014-ferrari-458") + cmp(
       '<div class="qw-site"><h3 data-kf="name"></h3><div class="qw-g" data-kf="photo"></div>'
       '<div class="qw-text"><p>[General description, several paragraphs]</p></div>'
       '<div class="tabs qw-faux-tabs"><span>Car Details</span><span>Features</span></div><div class="qw-text"><p>[Specification list, no mileage]</p></div>'
       '<p class="qw-price-late">Price: <b data-kf="price"></b></p><div class="row"><span class="btn btn-secondary btn-sm">Arrange a Viewing</span><span class="btn btn-secondary btn-sm">Reserve Now</span></div></div>',
       '<div class="qw-kf"><div><h3 data-kf="name"></h3><p class="muted small" data-kf="der"></p><div class="qw-g" data-kf="photo"></div></div>'
       '<aside class="facts panel"><p class="price" data-kf="price"></p><dl class="kv" data-kf="facts"></dl><div class="actions">'
       '<a class="btn btn-block" data-kf="view" href="viewing.html">Book a viewing</a><a class="btn btn-secondary btn-block" data-kf="reserve" href="reserve.html">Reserve this car</a>'
       '<div class="two"><a class="btn btn-secondary" data-fact="phone-link" href="tel:+442077232860">020 7723 2860</a><a class="btn btn-secondary" data-kf="wa" href="https://wa.me/447791777777" target="_blank" rel="noopener">WhatsApp</a></div></div></aside></div>'
       '<div class="qw-stickybar"><div><b data-kf="price"></b><span class="small" data-kf="miles"></span></div><span class="btn btn-sm">Book a viewing</span><span class="small muted">On phones</span></div>',
       stack=True) + '</div>',
   foot="Interior and owners are sample data.",
   notes=[note(1, "The panel stays in view as the buyer scrolls the photos on a desktop. On phones it sits under the gallery and the price bar takes over.")])

qw(idea=18, theme="car", nav="A better gallery", title="A gallery that does the photography justice",
   line="Photos grouped into exterior, interior and details, with a count, thumbnails, full screen and swipe.",
   try_="Open Interior, step through with the arrows, then go full screen.",
   propose="Group each car's photos into Exterior, Interior and Details, show a count (\"12 of 43\"), thumbnails to jump around, a full-screen view that works with the arrow keys, and swipe on phones.",
   why="The 458 Speciale has more than 40 photographs, which are some of the best things on the site. Today they sit in a carousel with arrow buttons and nothing else: no count, no thumbnails and no way to go straight to the interior.",
   demo='<div data-qw="gallery">' + picker("2014-ferrari-458") + cmp(
       '<div class="gallery-main"><div class="wf-placeholder" data-g-today data-photo-n="0">Photo 1</div><span class="g-arrow g-prev" aria-hidden="true">‹</span><span class="g-arrow g-next" aria-hidden="true">›</span></div><p class="small muted">Arrows only. No count, groups or thumbnails.</p>',
       '<div class="gallery-main"><div class="wf-placeholder" data-g-main data-photo-n="0">Photo 1</div>'
       '<button type="button" class="g-arrow g-prev" data-g-step="-1" aria-label="Previous photo">‹</button><button type="button" class="g-arrow g-next" data-g-step="1" aria-label="Next photo">›</button>'
       '<button type="button" class="btn btn-secondary btn-sm g-full" data-modal-open="qw-full">Full screen</button><span class="g-count" data-g-count></span></div>'
       '<div class="g-groups chip-set" data-g-groups role="group" aria-label="Photo groups"></div><div class="thumbs" data-g-thumbs></div>'
       '<div class="wf-modal fullscreen" id="qw-full" role="dialog" aria-modal="true" aria-label="Full screen photos"><div class="wf-modal-panel"><button type="button" class="wf-modal-close" aria-label="Close">×</button>'
       '<div class="wf-placeholder" data-g-full>Photo 1</div><div class="row between"><button type="button" class="btn btn-secondary" data-g-step="-1">Previous</button><button type="button" class="btn btn-secondary" data-g-step="1">Next</button></div></div></div>',
       stack=False) + '</div>',
   notes=[note(1, "Groups come from the names the photographer already gives the files (front-right, steering-wheel, wheel), so nobody has to sort photos by hand.")])

qw(idea=19, theme="car", nav="Share a car", title="Share a car",
   line="Share to WhatsApp or email, or copy the link, with the car's photo in the preview.",
   try_="Change the car, then compare the two messages.",
   propose="Share buttons on every car: WhatsApp, email and copy link. With the page titles and share image from QW8, the message shows the car's photo, name and price rather than a bare link.",
   why="There's no share option on car pages. A link pasted into WhatsApp shows no picture or useful title, because the pages have no share image and all share one title.",
   demo='<div data-qw="share">' + picker("2020-rolls-royce-cullinan") + cmp(
       '<div class="qw-chat"><div class="qw-bubble" data-chat-today></div></div><p class="small muted">No share buttons on the page.</p>',
       '<div class="share-row"><a class="btn" data-share-wa href="https://wa.me/" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-secondary" data-share-email href="mailto:">Email</a></div>'
       '<div class="copy-field"><input type="text" data-share-link readonly aria-label="Link to this car"><button type="button" class="btn btn-secondary" data-share-copy>Copy</button></div>'
       '<div class="qw-chat"><div class="qw-bubble" data-chat-new></div></div>') + '</div>',
   notes=[note(1, "WhatsApp and email open with the car's name and link filled in. Copy uses the clipboard where the browser allows it.")])

qw(idea=20, theme="car", nav="More like this", title="More like this",
   line="Similar cars by marque, price and body style, not marque alone.",
   try_="Switch to the Rolls-Royce Spectre, then the Porsche 911.",
   propose="Mix two cars of the same marque with two at a similar price and body style from other marques, and link to the full list for that marque.",
   why="Similar Stock on the 458 Speciale shows two cars of the same make, a 2012 458 and a 1996 F355. A buyer at that price might just as well be interested in another marque.",
   demo='<div data-qw="similar">' + picker("2014-ferrari-458") + cmp(
       '<p class="small muted">Similar Stock</p><div class="qw-minis" data-sim-today></div>',
       '<p class="small muted">More like this</p><div class="qw-minis" data-sim-new></div><p><a href="inventory.html" data-sim-all>See all in stock</a></p>') + '</div>',
   notes=[note(1, "Same marque first, then the closest price, preferring the same body style. Sold cars are never shown here.")])

# --------------------------------------------------------------------------
# Getting in touch
# --------------------------------------------------------------------------
qw(idea=23, theme="ask", nav="Contact page details", title="A contact page with the details on it",
   line="Phone, WhatsApp, email, address and hours at the top, then four short routes.",
   try_="Choose \"Selling a car\" and send the short form.",
   propose="Put the phone number, WhatsApp, email, address, hours and a map link at the top of Contact us, then offer four routes (buying, selling, finance, storage), each opening a short form that asks only what's needed.",
   why="Contact us is a form and nothing else. The address is only in the footer and there's no phone number. The form asks for a \"Nature of Enquiry\" from 13 options, then make, model and registration as free text.",
   demo=cmp(
       '<div class="qw-form-today"><div class="field"><label>Name</label><input type="text" disabled></div><div class="field"><label>Email</label><input type="text" disabled></div>'
       '<div class="field"><label>Nature of Enquiry</label><select disabled><option>Choose one of 13 options</option></select></div>'
       '<div class="field"><label>Make</label><input type="text" disabled></div><div class="field"><label>Model</label><input type="text" disabled></div><div class="field"><label>Registration</label><input type="text" disabled></div>'
       '<p class="small muted">No phone number, address, hours or map.</p></div>',
       '<div class="qw-contact"><div class="panel"><span class="small muted">Call</span><a class="big" data-fact="phone-link" href="tel:+442077232860">020 7723 2860</a></div>'
       '<div class="panel"><span class="small muted">WhatsApp</span><a class="big" data-fact="wa-link" href="https://wa.me/447791777777">+44 7791 777777</a></div>'
       '<div class="panel"><span class="small muted">Email</span><a data-fact="email-link" href="mailto:info@mayfairprestigeuk.co.uk">info@mayfairprestigeuk.co.uk</a></div>'
       '<div class="panel"><span class="small muted">Showroom</span><span data-fact="address">91 Crawford Street</span> <a href="https://www.google.com/maps/search/?api=1&amp;query=91+Crawford+Street+London+W1H+2HD" target="_blank" rel="noopener">Map</a><dl class="hours" data-fact="hours"></dl></div></div>'
       '<div class="tabs route-tabs" aria-label="Enquiry type"><button type="button" class="tab active" data-tab="qr-buy">Buying</button><button type="button" class="tab" data-tab="qr-sell">Selling</button><button type="button" class="tab" data-tab="qr-fin">Finance</button><button type="button" class="tab" data-tab="qr-st">Storage</button></div>'
       '<div><div class="tab-panel active" id="qr-buy">' + "{FORM:buy:Which car? (optional)}" + '</div><div class="tab-panel" id="qr-sell">' + "{FORM:sell:Your car and its mileage}" + '</div>'
       '<div class="tab-panel" id="qr-fin">' + "{FORM:fin:Which car, and how you'd like to pay (optional)}" + '</div><div class="tab-panel" id="qr-st">' + "{FORM:st:Your car and when you'd like storage to start}" + '</div></div>'),
   notes=[note(1, "Each route sends to the right person, so finance questions reach the finance specialist directly."),
          note(2, "Which phone number should the site use: 020 7723 2860 (the site) or (020) 8022 2494 (AutoTrader)?", True)])

qw(idea=24, theme="ask", nav="Tappable numbers", title="Tappable phone numbers",
   line="Every phone number a link, written the same way, and in the header of every page.",
   try_="On a phone, tap the numbers on each side.",
   propose="Make every phone number a tap-to-call link, write it the same way everywhere (020 7723 2860), and put it in the header of every page.",
   why="We found no tap-to-call links anywhere on the site. The homepage shows \"020 77232860\" as plain text, and the Finance page shows the finance specialist's mobile as text after a telephone emoji.",
   demo=cmp(
       '<div class="qw-site"><p>Call us on 020 77232860</p><p>Finance: 📞 +44 7515 356434</p><p class="small muted">Plain text. Nothing happens when you tap.</p></div>',
       '<div class="qw-site"><div class="qw-header-strip"><span>mayfair<b>prestige</b></span><a data-fact="phone-link" href="tel:+442077232860">020 7723 2860</a></div>'
       '<p>Call us on <a data-fact="phone-link" href="tel:+442077232860">020 7723 2860</a></p>'
       '<p>Finance: Tristan Bryant, <a href="tel:+447515356434">07515 356434</a></p>'
       '<a class="btn" data-fact="phone-link" href="tel:+442077232860">020 7723 2860</a></div>'),
   notes=[note(1, "On a desktop the links still work with calling apps; the number is always readable as text too.")])

qw(idea=25, theme="ask", nav="WhatsApp with the car", title="WhatsApp that knows the car",
   line="WhatsApp on desktop as well as phones, with the car already named in the message.",
   try_="Pick a car and open WhatsApp from the proposed side.",
   propose="Show WhatsApp on desktop as well as phones, and fill in the message with the page the buyer was on: the car's name, stock number and price.",
   why="WhatsApp is a floating button on phones and an icon in the footer. Both open a chat with no message, so the buyer has to explain which car they mean, and the sales team has to ask.",
   demo='<div data-qw="whatsapp">' + picker("2026-mercedes-benz-g-class") + cmp(
       '<div class="qw-chat"><div class="qw-compose"><span class="muted">Type a message</span></div></div><p class="small muted">Opens an empty chat. Phones only.</p>',
       '<div class="qw-chat"><div class="qw-compose"><span data-wa-msg></span></div></div><a class="btn" data-wa-new href="https://wa.me/447791777777" target="_blank" rel="noopener">Open WhatsApp</a>') + '</div>',
   notes=[note(1, "On pages with no car, the message names the page instead, such as \"Hello, I'd like to ask about storage\".")])

qw(idea=26, theme="ask", nav="Lighter forms", title="Lighter forms",
   line="Ask only what's needed, fill in the car, add a message box and make finance optional.",
   try_="Send the proposed form without a message.",
   propose="Fill in the car the buyer came from, ask only for a name and a way to reply, add an optional message, and make finance an optional tick (\"I'd like to talk about finance\").",
   why="The reserve form requires a yes or no answer about finance and has no message box. Contact asks for the make, model and registration as typed text even when you've come from a car.",
   demo='<div data-qw="lightform">' + picker("2021-rolls-royce-ghost") + cmp(
       '<div class="qw-form-today"><div class="field"><label>First name *</label><input type="text" disabled></div><div class="field"><label>Last name *</label><input type="text" disabled></div>'
       '<div class="field"><label>Email *</label><input type="text" disabled></div><div class="field"><label>Phone *</label><input type="text" disabled></div>'
       '<fieldset><legend>Finance *</legend><label class="check"><input type="radio" disabled> Yes</label><label class="check"><input type="radio" disabled> No</label></fieldset>'
       '<p class="small muted">Make <b data-lf-today></b> and model <b data-lf-today-model></b> travel as hidden fields; the form doesn\'t show which car. No message box.</p></div>',
       '<div class="qw-lf-car" data-lf-car></div><form data-confirm="lf-done" id="lf-form"><div class="form-grid">'
       '<div class="field full"><label for="lf-name">Name <span class="req">*</span></label><input type="text" id="lf-name" autocomplete="name" required data-error="Please tell us your name."></div>'
       '<div class="field full"><label for="lf-reply">Phone or email <span class="req">*</span></label><input type="text" id="lf-reply" required data-error="Please give a phone number or email address."></div>'
       '<div class="field full"><label for="lf-msg">Message (optional)</label><textarea id="lf-msg" rows="3"></textarea></div>'
       '<label class="check full"><input type="checkbox"> I\'d like to talk about finance</label></div><button type="submit" class="btn">Send</button></form>'
       '<div class="confirm" id="lf-done" hidden><h2>Thank you</h2><p>Your reference is <span class="ref" data-ref="MPE">MPE-0000</span>. We\'ll reply [the same working day].</p></div>') + '</div>',
   notes=[note(1, "Two required fields instead of five. The car comes with the enquiry, so the reply can start with an answer rather than a question.")])

# --------------------------------------------------------------------------
# Proof and people
# --------------------------------------------------------------------------
REVIEWS = ('<div class="rating"><span class="score">5.0</span><div><div class="stars" aria-hidden="true">★★★★★</div><span class="small muted">From 10 reviews on AutoTrader</span></div>'
           '<a class="btn btn-secondary btn-sm" href="https://www.autotrader.co.uk/dealers/london/city-of-westminster/mayfair-prestige-uk-ltd-66450" target="_blank" rel="noopener">Read the reviews</a></div>'
           '<div class="reviews"><blockquote class="review"><p>"Amir was exceptionally helpful and made the whole process effortless."</p><footer>Alex S · Purchase of a Ferrari F12 · May 2026</footer></blockquote>'
           '<blockquote class="review"><p>"Nothing was too much trouble and Daniel kept me informed throughout."</p><footer>Anthony Pask · November 2025</footer></blockquote>'
           '<blockquote class="review"><p>"No nonsense, straight talking approach to selling cars."</p><footer>Scott Inman · July 2025</footer></blockquote></div>')

qw(idea=27, theme="trust", nav="AutoTrader reviews", title="Bring the AutoTrader reviews home",
   line="The 5.0 rating and three recent reviews on the homepage and car pages.",
   try_="Follow \"Read the reviews\" to the full list.",
   propose="Show the AutoTrader rating and three recent reviews on the homepage and car pages, linking to the full list on AutoTrader.",
   why="AutoTrader shows Mayfair Prestige at 5.0 from 10 reviews, the latest from May 2026, naming Amir and Daniel. Nothing on the site mentions them.",
   demo=cmp('<div class="qw-empty">No reviews or rating anywhere on the site</div>', REVIEWS),
   notes=[note(1, "These are short extracts from real AutoTrader reviews. Is Mayfair Prestige happy to show them, or would AutoTrader's own review widget be preferred?", True)])

qw(idea=28, theme="trust", nav="Better testimonials", title="Testimonials with the car and the date",
   line="Each testimonial with the car bought, the month, a photo and a link to the review.",
   try_="Compare what a reader learns from each testimonial.",
   propose="Add the car bought and the month to each testimonial, link it to the review where one exists, and pair it with a photo of the car, with the client's permission.",
   why="The Testimonials page has eight quotes with no dates or sources. One is signed only \"Devon\". A quote a reader can't place carries less weight than one they can check.",
   demo=cmp(
       '<blockquote class="review"><p>[Testimonial as on the site]</p><footer>Devon</footer></blockquote><blockquote class="review"><p>[Testimonial as on the site]</p><footer>[First name and surname]</footer></blockquote>',
       '<div class="qw-testi"><div class="wf-placeholder" data-photo="2013-ferrari-f12-berlinetta" data-photo-n="0">Photo of the car</div><blockquote class="review"><p>[Client quote]</p><footer>[Name] · Ferrari F12 Berlinetta · [Month and year] · <a href="https://www.autotrader.co.uk/dealers/london/city-of-westminster/mayfair-prestige-uk-ltd-66450" target="_blank" rel="noopener">Read on AutoTrader</a></footer></blockquote></div>'
       '<div class="qw-testi"><div class="wf-placeholder" data-photo="2020-rolls-royce-cullinan" data-photo-n="0">Photo of the car</div><blockquote class="review"><p>[Client quote]</p><footer>[Name] · Rolls-Royce Cullinan · [Month and year]</footer></blockquote></div>'),
   foot="Quotes are placeholders; we haven't reused the existing testimonials here.",
   notes=[note(1, "Are the eight testimonials current, and have the clients agreed to their names being used?", True)])

qw(idea=30, theme="trust", nav="Meet the team", title="The people buyers will meet",
   line="Sales and finance on Meet the Team, with a line about each and a direct number.",
   try_="Compare the two teams.",
   propose="Add the sales and finance people to Meet the Team, each with a photo, a line about what they do and a direct number, so the person a buyer reads about in the reviews is the person they can call.",
   why="Meet the Team lists the founder, a photographer, a head detailer and a valeter. Daniel, who is named in six of the eight testimonials and in AutoTrader reviews, isn't there, and nor is the finance specialist named on the Finance page.",
   demo=cmp(
       '<div class="team qw-team"><div class="person"><div class="wf-placeholder">Portrait</div><b>Amir Jabir</b><p class="muted">Founder</p></div><div class="person"><div class="wf-placeholder">Portrait</div><b>Peter Baker</b><p class="muted">Photographer and social media</p></div>'
       '<div class="person"><div class="wf-placeholder">Portrait</div><b>Stuart Seymour</b><p class="muted">Head detailer</p></div><div class="person"><div class="wf-placeholder">Portrait</div><b>[Name]</b><p class="muted">Valeter</p></div></div>',
       '<div class="team qw-team"><div class="person"><div class="wf-placeholder">Portrait</div><b>Amir Jabir</b><p class="muted">Founder</p><p class="small">[A line about Amir]</p></div>'
       '<div class="person"><div class="wf-placeholder">Portrait</div><b>Daniel [surname]</b><p class="muted">Sales</p><p class="small">[A line about Daniel]</p><a class="small" href="tel:+442077232860">[Direct line]</a></div>'
       '<div class="person"><div class="wf-placeholder">Portrait</div><b>Tristan Bryant</b><p class="muted">Finance specialist</p><p class="small">[A line about Tristan]</p><a class="small" href="tel:+447515356434">07515 356434</a></div>'
       '<div class="person"><div class="wf-placeholder">Portrait</div><b>Peter Baker</b><p class="muted">Photographer and social media</p></div></div>'),
   notes=[note(1, "Is Daniel happy to appear, and what are his surname and role? Is Tristan Bryant part of the team or a finance partner?", True)])

# --------------------------------------------------------------------------
# Selling and services
# --------------------------------------------------------------------------
qw(idea=33, theme="serv", nav="After a valuation", title="Say what happens after a valuation",
   line="A short panel beside the valuation form: the ways to sell and what happens next.",
   try_="Read the panel, then send the short form.",
   propose="Keep the three-step valuation form, and put a short panel beside it: the ways Mayfair Prestige can buy or sell a car, how quickly they'll come back, and a separate, private route for anyone selling a collection.",
   why="Sell your car is a clear three-step form. What it doesn't say is what happens next, how fast, or whether they buy outright, take a part exchange or sell on commission. The homepage mentions experience in \"acquiring or selling collections\", but there's no route for it.",
   demo=cmp(
       '<div class="qw-form-today"><ol class="stepper"><li aria-current="step">Your car</li><li>Details</li><li>Contact</li></ol><div class="field"><label>Registration</label><input type="text" disabled></div><div class="field"><label>Mileage</label><input type="text" disabled></div><p class="small muted">Nothing about what happens next.</p></div>',
       '<div class="qw-val"><div><form data-confirm="val-done" id="val-form"><div class="form-grid">'
       '<div class="field"><label for="val-reg">Registration <span class="req">*</span></label><input type="text" id="val-reg" required data-error="Please enter the registration."></div>'
       '<div class="field"><label for="val-miles">Mileage <span class="req">*</span></label><input type="text" id="val-miles" inputmode="numeric" required data-error="Please enter the mileage."></div>'
       '<div class="field full"><label for="val-contact">Phone or email <span class="req">*</span></label><input type="text" id="val-contact" required data-error="Please give a phone number or email address."></div></div>'
       '<button type="submit" class="btn">Ask for a valuation</button></form><div class="confirm" id="val-done" hidden><h2>Thank you</h2><p>Your reference is <span class="ref" data-ref="MPV">MPV-0000</span>. We\'ll come back to you with a figure [within one working day].</p></div></div>'
       '<aside class="panel surface"><h3 class="h4">How selling works</h3><ul class="sell-ways"><li><b>We buy it.</b> [A figure, and payment on collection]</li><li><b>Part exchange.</b> [Against a car from our stock]</li><li><b>We sell it for you.</b> [On commission, from our showroom]</li></ul>'
       '<p class="small"><b>Selling a collection?</b> Call [name] on <a data-fact="phone-link" href="tel:+442077232860">020 7723 2860</a> and we\'ll arrange to see the cars privately.</p></aside></div>'),
   foot="Timings and terms in brackets are for Mayfair Prestige to confirm.",
   notes=[note(1, "Which of the three ways does Mayfair Prestige offer, and how quickly does a valuation usually come back?", True)])

qw(idea=37, theme="serv", nav="Storage", title="Storage worth enquiring about",
   line="Photos, what's included, a cost calculator from the published price and an enquiry.",
   try_="Work out six months' storage, then send the enquiry.",
   propose="Show photos of the storage, list what's included, work out the cost from the published price, and ask for the start date and the car in the enquiry.",
   why="The Storage page states the price (£950 a month, twelve weeks minimum) and the access hours, which is more than most sites manage. It has no photos of the facility and no list of what the price includes.",
   demo=cmp(
       '<div class="qw-site"><p>£950 per month, 12 weeks minimum.</p><p>Access 09:00 to 18:00, or 24 hours on pre-booking.</p><span class="btn btn-secondary btn-sm">Enquire now</span><p class="small muted">No photos, no list of what\'s included.</p></div>',
       '<div data-qw="storage"><div class="wf-placeholder ratio-16-9">Photo · storage facility</div>'
       '<ul class="keyinfo qw-incl"><li>Secure, indoor storage <span>[to confirm]</span></li><li>Battery conditioning <span>[to confirm]</span></li><li>Detailing before collection <span>[to confirm]</span></li><li>Collection and delivery <span>[to confirm]</span></li></ul>'
       '<div class="calc-out"><label for="st-months">How long? <b data-st-months></b></label><input type="range" id="st-months" min="3" max="24" value="6">'
       '<p class="big" data-st-total></p><p class="small">At £950 a month. Minimum twelve weeks.</p></div>'
       '<form data-confirm="st-done" id="st-form" style="margin-top:1rem"><div class="form-grid"><div class="field"><label for="st-start">Start date <span class="req">*</span></label><input type="date" id="st-start" required data-error="Please choose a start date."></div>'
       '<div class="field"><label for="st-car">Your car <span class="req">*</span></label><input type="text" id="st-car" required data-error="Please tell us the car."></div>'
       '<div class="field full"><label for="st-contact">Phone or email <span class="req">*</span></label><input type="text" id="st-contact" required data-error="Please give a phone number or email address."></div></div><button type="submit" class="btn">Ask about storage</button></form>'
       '<div class="confirm" id="st-done" hidden><h2>Thank you</h2><p>Your reference is <span class="ref" data-ref="MPS">MPS-0000</span>. We\'ll confirm space and arrange a visit.</p></div></div>'),
   notes=[note(1, "What does the monthly price include, and can we photograph the space?", True)])

qw(idea=38, theme="serv", nav="Delivery on every car", title="Delivery offered on every car",
   line="A \"Delivery to your door, UK and worldwide\" line on car pages, with a quote request.",
   try_="Ask for a delivery quote for the Cullinan.",
   propose="Add one line to every car page, \"Delivery to your door, UK and worldwide\", opening a short transport quote: the car, where it's going, road, sea or air, and when.",
   why="Transport \"in the UK and Europe… worldwide… via air, sea, or road\" is mentioned only on the Storage page. A buyer outside London looking at a car has no reason to know it's offered.",
   demo='<div data-qw="delivery">' + picker("2020-rolls-royce-cullinan") + cmp(
       '<div class="qw-site"><b data-dl="name"></b><p data-dl="price"></p><div class="row"><span class="btn btn-secondary btn-sm">Arrange a Viewing</span><span class="btn btn-secondary btn-sm">Reserve Now</span></div><p class="small muted">No mention of delivery on the car page.</p></div>',
       '<div class="qw-site"><b data-dl="name"></b><p data-dl="price"></p><p class="qw-deliver"><b>Delivery to your door, UK and worldwide.</b> <a href="#dl-form">Get a delivery quote</a></p>'
       '<form data-confirm="dl-done" id="dl-form"><div class="form-grid"><div class="field full"><label for="dl-car">Car</label><input type="text" id="dl-car" readonly></div>'
       '<div class="field"><label for="dl-to">Delivering to <span class="req">*</span></label><input type="text" id="dl-to" placeholder="Town and country" required data-error="Please tell us where the car is going."></div>'
       '<div class="field"><label for="dl-by">By</label><select id="dl-by"><option>Whatever suits</option><option>Road</option><option>Sea</option><option>Air</option></select></div>'
       '<div class="field full"><label for="dl-contact">Phone or email <span class="req">*</span></label><input type="text" id="dl-contact" required data-error="Please give a phone number or email address."></div></div>'
       '<button type="submit" class="btn">Ask for a quote</button></form><div class="confirm" id="dl-done" hidden><h2>Thank you</h2><p>Your reference is <span class="ref" data-ref="MPT">MPT-0000</span>. We\'ll send a delivery quote for the car.</p></div></div>') + '</div>',
   notes=[note(1, "Is delivery arranged for every car, or only for some destinations?", True)])

# --------------------------------------------------------------------------
# Facts, search and housekeeping
# --------------------------------------------------------------------------
qw(idea=42, theme="fix", nav="One set of facts", title="One set of facts",
   line="Years trading, hours, phone number and showroom size agreed once and used everywhere.",
   try_="Change the opening hours on the right and see every page update.",
   propose="Agree each fact once and store it in one place in Umbraco, so the header, footer, contact page and car pages all show the same thing. Changing the hours then means changing them once.",
   why="The site gives three different lengths of time trading, three versions of the opening hours (plus AutoTrader's), two phone numbers and two figures for the showroom. Each one is small, but a buyer comparing pages notices.",
   demo=cmp(
       '<table class="qw-table"><thead><tr><th>Fact</th><th>What the site says</th></tr></thead><tbody>'
       '<tr><th>Years trading</th><td>"more than a decade" and "over twenty years" (About), "approximately quarter century" (homepage)</td></tr>'
       '<tr><th>Opening hours</th><td>Mon to Fri 08:30 to 19:00, Sat 08:30 to 18:00 (Location); viewings Mon to Sat (footer); different hours on AutoTrader</td></tr>'
       '<tr><th>Phone</th><td>020 7723 2860 (site); (020) 8022 2494 (AutoTrader)</td></tr>'
       '<tr><th>Showroom</th><td>"approximately 50 automobiles"; 40 listed</td></tr></tbody></table>',
       '<div data-qw="facts"><div class="form-grid"><div class="field"><label for="f-years">Years trading</label><input type="text" id="f-years" data-fact-in="years" value="[Agreed figure]"></div>'
       '<div class="field"><label for="f-hours">Weekday hours</label><input type="text" id="f-hours" data-fact-in="hours" value="08:30 to 19:00"></div>'
       '<div class="field"><label for="f-phone">Phone</label><input type="text" id="f-phone" data-fact-in="phone" value="020 7723 2860"></div></div>'
       '<div class="qw-places"><div class="panel"><span class="small muted">Header</span><p><b data-fact-out="phone"></b></p></div>'
       '<div class="panel"><span class="small muted">Homepage</span><p>Trading for <span data-fact-out="years"></span></p></div>'
       '<div class="panel"><span class="small muted">Contact us</span><p>Monday to Friday, <span data-fact-out="hours"></span><br><span data-fact-out="phone"></span></p></div>'
       '<div class="panel"><span class="small muted">Footer</span><p>Monday to Friday, <span data-fact-out="hours"></span> · <span data-fact-out="phone"></span></p></div></div></div>'),
   notes=[note(1, "Which figures are right? We need one answer each for years trading, hours (including Sundays), phone number and how many cars the showroom holds.", True)])

qw(idea=43, theme="fix", nav="Homepage copy", title="Rewrite the homepage copy",
   line="Homepage text rewritten in the voice of the newer About and Location pages.",
   try_="Tick \"Show what changes\" to see the phrases that would go.",
   propose="Rewrite the homepage text in the plainer, more confident voice of the newer About and Location pages, and proofread it.",
   why="The homepage has phrases such as \"all prepare to our exacting standards\", \"We are independent company\", \"from barbs conversions\" and \"Oldtimer and Youngtimer\". The About and Location pages read much better, so the homepage is the odd one out, and it's the page most people see first.",
   demo='<div data-qw="copy"><label class="check"><input type="checkbox" data-copy-mark> Show what changes</label>' + cmp(
       '<div class="qw-text-live"><p>Phrases on the homepage today:</p><ul>'
       '<li><mark>"all prepare to our exacting standards"</mark></li><li><mark>"a viewing by an appointment policy"</mark></li><li><mark>"We are independent company"</mark></li>'
       '<li><mark>"ultimate best manufactures of bulletproofing vehicles"</mark></li><li><mark>"from barbs conversions"</mark></li><li><mark>"all leading motor way within 10 minutes"</mark></li><li><mark>"Oldtimer and Youngtimer"</mark></li></ul></div>',
       '<div class="qw-text-live"><p>Mayfair Prestige is an independent specialist in luxury, performance and classic cars, from our showroom on Crawford Street in Marylebone. Every car is inspected and <ins>prepared to our own standards</ins> before it goes on sale.</p>'
       '<p><ins>Viewings are by appointment</ins>, so you have the car and our time to yourself. We\'re a few minutes from Marylebone and Baker Street stations, and <ins>close to the A40</ins>.</p>'
       '<p>We also find cars to order, arrange finance, store and deliver cars, and supply armoured vehicles and <ins>Brabus and other conversions</ins> for private and diplomatic clients.</p></div>',
       stack=False) + '</div>',
   foot="Suggested wording, to be checked against what Mayfair Prestige wants to say.",
   notes=[note(1, "Should the homepage keep the long-form text at all, or move most of it to About and keep the homepage for cars and services?", True)])

qw(idea=44, theme="fix", nav="Homepage search listing", title="Homepage title and description",
   line="A page title and description that say what Mayfair Prestige is, not \"affordable second hand cars\".",
   try_="Edit the proposed title and watch the character count.",
   propose="Change the homepage title to \"Mayfair Prestige | Luxury and supercar specialist, Marylebone\" and write a description that names the marques and the private services.",
   why="The homepage title is \"Mayfair Prestige | Mayfair Prestige\". The description talks about \"a wide range of second hand cars at great prices\" and \"affordable second hand cars in Borough Of Westminster\", which isn't how the business describes itself anywhere else.",
   demo=cmp(
       '<div class="serp"><div class="u">www.mayfairprestigeuk.co.uk</div><div class="t">Mayfair Prestige | Mayfair Prestige</div><p>…stocking a wide range of second hand cars at great prices… affordable second hand cars in Borough Of Westminster</p></div>',
       '<div data-qw="meta"><div class="serp"><div class="u">www.mayfairprestigeuk.co.uk</div><div class="t" data-mt-t></div><p data-mt-d></p></div>'
       '<div class="field"><label for="mt-title">Title</label><input type="text" id="mt-title" value="Mayfair Prestige | Luxury and supercar specialist, Marylebone"><p class="field-hint" data-mt-tc></p></div>'
       '<div class="field"><label for="mt-desc">Description</label><textarea id="mt-desc" rows="3">Independent specialist in Rolls-Royce, Ferrari, Mercedes-AMG G-Class and classic cars, by appointment in Marylebone, London. Sourcing, finance, storage and delivery.</textarea><p class="field-hint" data-mt-dc></p></div></div>'),
   notes=[note(1, "Search engines don't always use the description as written, but a good one is used far more often than a poor one.")])

qw(idea=45, theme="fix", nav="Fix the sitemaps", title="Fix the sitemaps",
   line="Serve the real sitemap at /sitemap.xml and stop listing 84 pages that no longer exist.",
   try_="Switch between Today and Proposed and read the status of each address.",
   propose="Serve Mayfair Prestige's own sitemap at /sitemap.xml, restore or redirect the 84 Previously Sold addresses, and submit the sitemap in Google Search Console.",
   why="The address search engines check first, /sitemap.xml, returns the sitemap for a different website (www.mfpservices.co.uk). The real one, at /xmlsitemap, lists 137 addresses, and 84 of them, every Previously Sold page, return \"page not found\".",
   demo='<div data-qw="sitemap"><div class="seg" data-sm-seg role="group" aria-label="Show"><button type="button" data-mode="today" aria-pressed="true">Today</button><button type="button" data-mode="proposed" aria-pressed="false">Proposed</button></div>'
        '<p class="small" data-sm-note aria-live="polite"></p><div class="qw-tablewrap"><table class="qw-table"><thead><tr><th>Address</th><th>Page</th><th>Status</th></tr></thead><tbody data-sm-rows></tbody></table></div></div>',
   notes=[note(1, "A sample of the 137 addresses. The Previously Sold addresses can either point to a proper archive (big improvement 4) or redirect to the Previously Sold page."),
          note(2, "Is mfpservices.co.uk a sister business that should be linked, or a leftover from an earlier site?", True)])

qw(idea=46, theme="fix", nav="Registrations out of links", title="Keep registrations out of links",
   line="Pass a stock number in links instead of the car's registration.",
   try_="Compare the two addresses.",
   propose="Pass a stock number in the reserve and enquiry links instead of the registration, and show the plate only where Mayfair Prestige chooses to.",
   why="Reserve links carry the registration in the address, for example /reserve-now?make=Ferrari&model=458&registration=GV64XDZ. Addresses end up in browser histories, analytics and shared links.",
   demo=cmp(
       '<div class="qw-address"><span>mayfairprestigeuk.co.uk/reserve-now?make=Ferrari&amp;model=458&amp;<mark>registration=GV64XDZ</mark></span></div>',
       '<div class="qw-address"><span>mayfairprestigeuk.co.uk/reserve-now?<ins>car=MP2101</ins></span></div><p class="small">The form looks the car up from its stock number.</p>'),
   notes=[note(1, "A small change in how the links are built; the reserve form itself doesn't change.")])

qw(idea=47, theme="fix", nav="One heading typeface", title="One typeface for headings",
   line="Set car titles in Montserrat like every other heading, and stop loading Lato.",
   try_="Compare the two titles.",
   propose="Set car page titles in Montserrat, like every other heading on the site, and remove the Lato font files.",
   why="Car page titles are set in Lato at 48px; every other heading is Montserrat. The site loads Lato in five weights, upright and italic, for that one use.",
   demo=cmp(
       '<p class="qw-title-lato">2014 Ferrari 458</p><p class="small muted">Lato, loaded only for this heading</p>',
       '<p class="qw-title-mont">2014 Ferrari 458</p><p class="small muted">Montserrat, as everywhere else</p>'),
   head_extra='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400&amp;display=swap">',
   notes=[note(1, "Fewer font files also makes car pages a little quicker to load.")])


# --------------------------------------------------------------------------
# Forms used in the contact demo
# --------------------------------------------------------------------------
def route_form(key, first):
    return (f'<form data-confirm="qr-{key}-done" id="qr-{key}-form"><div class="form-grid">'
            f'<div class="field full"><label for="qr-{key}-what">{first}</label><input type="text" id="qr-{key}-what"></div>'
            f'<div class="field"><label for="qr-{key}-name">Name <span class="req">*</span></label><input type="text" id="qr-{key}-name" autocomplete="name" required data-error="Please tell us your name."></div>'
            f'<div class="field"><label for="qr-{key}-reply">Phone or email <span class="req">*</span></label><input type="text" id="qr-{key}-reply" required data-error="Please give a phone number or email address."></div>'
            '</div><button type="submit" class="btn">Send</button></form>'
            f'<div class="confirm" id="qr-{key}-done" hidden><h2>Thank you</h2><p>Your reference is <span class="ref" data-ref="MPC">MPC-0000</span>. We\'ll be in touch [today].</p></div>')


def fill_forms(html):
    import re
    return re.sub(r"\{FORM:(\w+):([^}]+)\}", lambda m: route_form(m.group(1), m.group(2)), html)


# --------------------------------------------------------------------------
# Writers
# --------------------------------------------------------------------------
PAGE = """<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QW{n} {title} – Mayfair Prestige quick win</title>
  <link rel="stylesheet" href="~/css/base.css">
  <link rel="stylesheet" href="~/css/components.css">
  <link rel="stylesheet" href="~/css/theme.css">{head_extra}
</head>
<body class="qw-page">
  <!-- @@include header.html -->

  <main id="main">
    <aside class="proposal" aria-label="About this quick win">
      <div class="container">
        <p class="proposal-eyebrow">Quick win {n} of {total} · {title}</p>
        <div class="proposal-grid">
          <div><h2>What we're proposing</h2><p>{propose}</p></div>
          <div><h2>Why</h2><p>{why}</p></div>
        </div>{foot}
      </div>
    </aside>

    <div class="container">
      <!-- QW{n}, idea {idea} -->
      <div class="page-head qw-head"><span class="eyebrow">Quick win {n}</span><h1>{title}</h1><p>{line}</p></div>
      <p class="qw-try"><strong>Try:</strong> {try_}</p>
      {demo}
      {notes}
    </div>
  </main>

  <!-- @@include footer.html -->
  <script src="~/js/data.js"></script>
  <script src="~/js/wireframe.js"></script>
  <script src="~/js/quickwins.js"></script>
  <script src="~/js/photos.js"></script>
</body>
</html>
"""


def main():
    total = len(QWS)
    links = []
    for i, q in enumerate(QWS, 1):
        q["n"] = i
        f = f"qw-{i:02d}"
        q["file"] = f
        demo = fill_forms(q["demo"])
        if q.get("wrap"):
            demo = f'<div data-qw="{q["wrap"]}">{demo}</div>'
        html = PAGE.format(
            n=i, total=total, title=q["title"], idea=q["idea"], line=q["line"], try_=q["try_"],
            propose=q["propose"], why=q["why"], demo=demo, notes="\n      ".join(q.get("notes", [])),
            foot=(f'\n        <p class="proposal-foot">{q["foot"]}</p>' if q.get("foot") else ""),
            head_extra=("\n  " + q["head_extra"] if q.get("head_extra") else ""))
        (SRC / "pages" / f"{f}.html").write_text(html, encoding="utf-8")
        links.append(f'          <li><a href="~/pages/{f}.html" data-proto="{f}">QW{i} {q["nav"]}</a></li>')
    (SRC / "includes" / "qw-links.html").write_text("\n".join(links) + "\n", encoding="utf-8")

    # Overview page for the tab
    groups = []
    for key, label in THEMES:
        cards = []
        for q in [x for x in QWS if x["theme"] == key]:
            cards.append(
                f'<li class="qw-card"><span class="qw-num">QW{q["n"]}</span>'
                f'<h3><a href="~/pages/{q["file"]}.html">{q["title"]}</a></h3><p>{q["line"]}</p>'
                f'<p class="proto-try"><strong>Try:</strong> {q["try_"]}</p>'
                f'<a class="btn btn-secondary btn-sm" href="~/pages/{q["file"]}.html">Open</a></li>')
        groups.append(f'<section class="qw-theme" aria-labelledby="t-{key}"><h2 class="hub-h2" id="t-{key}">{label}</h2><ol class="qw-cards">{"".join(cards)}</ol></section>')
    overview = f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mayfair Prestige prototypes – quick wins</title>
  <link rel="stylesheet" href="~/css/base.css">
  <link rel="stylesheet" href="~/css/components.css">
  <link rel="stylesheet" href="~/css/theme.css">
</head>
<body class="hub">
  <!-- @@include header.html -->

  <!-- Quick wins overview (R08) -->
  <div class="hub-hero">
    <div class="container">
      <div class="hub-brand"><span class="hub-logo">mayfair<b>prestige</b></span></div>
      <h1>{total} quick wins for the Mayfair Prestige website</h1>
      <p class="lead">Smaller changes that can each be made on their own, without any of the five big improvements. Each one has its own page showing just that change, with today's version beside the proposed one where a comparison helps.</p>
    </div>
  </div>

  <main id="main">
    <div class="container">
      {"".join(groups)}
      <section class="hub-notes" aria-labelledby="review-title">
        <div>
          <h2 class="hub-h2" id="review-title">How to review</h2>
          <ul>
            <li>"Today" is rebuilt from what we saw on the live site; "Proposed" is the change. Everything else on the page is kept the same, so the difference is the change itself.</li>
            <li>Use <strong>Quick win</strong> in the bar at the top to jump to any of them, or the previous and next links at the foot of each page.</li>
            <li>Switch <strong>Notes on</strong> to see what each quick win proposes and why, with notes on behaviour (yellow) and open questions for Mayfair Prestige (red).</li>
            <li>Several quick wins also appear inside the five <a href="~/index.html">big improvements</a>. Here each one stands alone, so they can be chosen separately.</li>
          </ul>
        </div>
      </section>
    </div>
  </main>

  <!-- @@include footer.html -->
  <script src="~/js/data.js"></script>
  <script src="~/js/wireframe.js"></script>
  <script src="~/js/photos.js"></script>
</body>
</html>
"""
    (SRC / "quick-wins.html").write_text(overview, encoding="utf-8")
    print(f"Wrote {total} quick wins")


if __name__ == "__main__":
    main()
