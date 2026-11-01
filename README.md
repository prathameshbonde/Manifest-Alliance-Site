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

- `powerCap` + `powerCapIsPlaceholder`: real cap for the next event

## Running locally

Open `index.html` in a browser. That's it.

## Deploying

Hosted on Cloudflare Pages, connected to this GitHub repo:
build command empty, output directory `/`. Every commit to `main` redeploys.

## Join applications → Discord

The join form posts to `/api/apply` (a Vercel function in `api/apply.js`), which
posts each application into the private Discord applications channel.

The Discord webhook link is a secret and must **never** be committed to this repo.
Set it in Vercel: **Project → Settings → Environment Variables**

| Name | Value |
|---|---|
| `DISCORD_WEBHOOK_URL` | the webhook link from Discord (channel settings → Integrations → Webhooks) |
| `DISCORD_PING_ROLE_ID` | optional: a role ID to ping on each application |

After adding or changing a variable, redeploy (Deployments → ⋯ → Redeploy).
If the webhook link ever leaks, delete it in Discord, create a new one, and update the variable.

Built-in protection: hidden spam-trap field, 3 applications per connection per 10 minutes,
and no @everyone/@here pings from applicant text.

