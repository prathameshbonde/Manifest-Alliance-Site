// Vercel serverless function: POST /api/apply
// Receives a join application from the site and posts it to the private
// Discord applications channel.
//
// The Discord webhook link is a secret. It is NOT stored in this repo.
// Set it in Vercel: Project > Settings > Environment Variables
//   DISCORD_WEBHOOK_URL      = https://discord.com/api/webhooks/...
//   DISCORD_PING_ROLE_ID     = (optional) role ID to ping on each application

const FIELDS = [
  // [key, label, required, max length]
  ["governor", "Governor", true, 40],
  ["governorId", "Governor ID", true, 20],
  ["server", "Current server", true, 10],
  ["townCenter", "Town Center level", true, 10],
  ["power", "Total power", true, 20],
  ["coords", "City coordinates", true, 30],
  ["discord", "Discord", false, 40]
];

// Best-effort limit per IP (resets when the function instance restarts).
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

// Keep text plain: no line breaks, no markdown links or mass mentions.
function clean(value, max) {
  return String(value == null ? "" : value)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[`*_~|>\[\]()]/g, "")
    .replace(/@/g, "@​")
    .trim()
    .slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Use POST." });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook || !/^https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\//.test(webhook)) {
    return res.status(500).json({ ok: false, error: "Applications are not set up yet." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "Send the form as JSON." });
  }

  // Spam trap: real people never see or fill the "website" field.
  if (body.website) return res.status(200).json({ ok: true });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (tooMany(ip)) {
    return res.status(429).json({ ok: false, error: "Too many applications from this connection. Try again later." });
  }

  const data = {};
  const missing = [];
  for (const [key, label, required, max] of FIELDS) {
    data[key] = clean(body[key], max);
    if (required && !data[key]) missing.push(label);
  }
  if (missing.length) {
    return res.status(400).json({ ok: false, error: "Missing: " + missing.join(", ") });
  }

  const roleId = /^\d{5,25}$/.test(process.env.DISCORD_PING_ROLE_ID || "") ? process.env.DISCORD_PING_ROLE_ID : "";
  const payload = {
    username: "[MAN]ifest Ticket Booth",
    content: roleId ? `<@&${roleId}> new application` : "",
    allowed_mentions: { parse: [], roles: roleId ? [roleId] : [] },
    embeds: [{
      title: `🎟️ New application: ${data.governor}`,
      color: 0xf2c25a,
      fields: FIELDS.filter(([key]) => key !== "governor" && data[key])
        .map(([key, label]) => ({ name: label, value: data[key], inline: key !== "coords" })),
      footer: { text: "Sent from the [MAN]ifest website" },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const r = await fetch(webhook + (webhook.includes("?") ? "&" : "?") + "wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      console.error("Discord webhook failed", r.status, await r.text().catch(() => ""));
      return res.status(502).json({ ok: false, error: "Discord didn't accept the application." });
    }
  } catch (e) {
    console.error("Discord webhook error", e);
    return res.status(502).json({ ok: false, error: "Couldn't reach Discord." });
  }

  return res.status(200).json({ ok: true });
};
