# [MAN]ifest Alliance site

Recruitment and transfer-guide site for the [MAN]ifest Kingshot alliance (Kingdom 1526).
Plain HTML, CSS and JavaScript. No build step.

## Files

| File | What it is |
|---|---|
| `config.js` | **The only file you edit for updates**: Discord link, power cap, snapshot date, leadership names |
| `index.html` | All page text (checklist steps, rules, Transfer 101) |
| `styles.css` | Look and feel |
| `app.js` | Power check, checklist saving, countdown, join ticket |
| `assets/` | Logo, cat stamp, poster (used as the Discord link preview image) |

## Updating for a new transfer event

1. Open `config.js` (on GitHub: click the file, then the pencil icon).
2. Set `powerCap` to the announced cap (full number, no commas) and set `powerCapIsPlaceholder: false`.
3. Set `transferSnapshotUtc`, for example `"2026-11-15T00:00:00Z"`.
4. Commit. The live site updates in about a minute.

## Placeholders still to fill

- `discordInvite`: real Discord invite link
- `powerCap` + `powerCapIsPlaceholder`: real cap for the next event
- `leadership`: R5 / R4 / recruiter names
- `formEndpoint` (optional): Formspree endpoint if applications should also be emailed

## Running locally

Open `index.html` in a browser. That's it.

## Deploying

Hosted on Cloudflare Pages, connected to this GitHub repo:
build command empty, output directory `/`. Every commit to `main` redeploys.
