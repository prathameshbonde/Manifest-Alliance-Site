/* ==========================================================================
   [MAN]ifest Alliance site settings
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit for day-to-day updates.
   Change a value, save, and the whole site updates.
   Anything marked PLACEHOLDER still needs the real value from leadership.
   ========================================================================== */

window.MANIFEST_CONFIG = {
  // Kingdom (server / state) number we recruit into.
  kingdom: "1526",

  // Discord invite link.
  discordInvite: "https://discord.gg/E5yGZFuyKU",

  // Target kingdom's total power cap for the current transfer event.
  // Write the full number, no commas: 45 million = 45000000.
  powerCap: 45000000,
  // Set to false once the number above is the real, announced cap.
  powerCapIsPlaceholder: true,

  // Hour (0-23, UTC) when the in-game daily reset happens.
  // The power snapshot locks at the daily reset when the event starts.
  dailyResetUtcHour: 0,

  // Snapshot / event start for the next transfer event, in UTC.
  // Format: "2026-11-15T00:00:00Z". Leave "" if not announced yet;
  // the countdown then shows the time to the next daily reset.
  transferSnapshotUtc: "",

  // Alliance leadership shown on the Join section.
  leadership: [
    { role: "R5", name: "Buzz" },
    { role: "R4", name: "Jezuz" },
    { role: "R4", name: "Badshah" },
    { role: "R4", name: "Red Reddington" },
    { role: "R4", name: "Nergal" },
    { role: "Recruiter", name: "Badshah" }
  ],

  // Alliance event times, in UTC, 24-hour "HH:MM".
  // Each event can have one or more times. Add a label to a time if needed.
  // The site sorts them and shows each visitor their own local time too.
  events: [
    { name: "Vikings", times: [{ utc: "13:00" }] },
    { name: "Swordland / Tri-Clash", times: [{ utc: "14:00" }, { utc: "19:00" }] },
    { name: "Trap", times: [{ label: "Trap 1", utc: "14:00" }, { label: "Trap 2", utc: "19:30" }] },
    { name: "Caesar Boss", times: [{ utc: "20:00" }] }
  ],

  // Optional: a form service URL (for example a Formspree endpoint like
  // "https://formspree.io/f/abcdwxyz") so applications are emailed to you.
  // Leave "" and applicants copy their ticket into Discord instead.
  formEndpoint: ""
};
