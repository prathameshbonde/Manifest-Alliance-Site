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

  // Discord invite link. PLACEHOLDER: paste the real invite here.
  discordInvite: "https://discord.gg/YOUR-INVITE-CODE",

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

  // Alliance leadership shown on the Join section. PLACEHOLDERS.
  leadership: [
    { role: "R5", name: "[R5 name]" },
    { role: "R4", name: "[R4 name]" },
    { role: "R4", name: "[R4 name]" },
    { role: "Recruiter", name: "[Recruiter name]" }
  ],

  // Optional: a form service URL (for example a Formspree endpoint like
  // "https://formspree.io/f/abcdwxyz") so applications are emailed to you.
  // Leave "" and applicants copy their ticket into Discord instead.
  formEndpoint: ""
};
