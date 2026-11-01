(function () {
  "use strict";
  var C = window.MANIFEST_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  /* ---------- fill in config values ---------- */
  $$("[data-cfg]").forEach(function (el) {
    var v = C[el.getAttribute("data-cfg")];
    if (v != null && v !== "") el.textContent = v;
  });
  $$("[data-cfg-href]").forEach(function (el) {
    var v = C[el.getAttribute("data-cfg-href")];
    if (v) el.href = v;
  });

  var crew = $("#leadership");
  if (crew && Array.isArray(C.leadership)) {
    C.leadership.forEach(function (p) {
      var li = document.createElement("li");
      var role = document.createElement("span");
      role.className = "role"; role.textContent = p.role;
      var name = document.createElement("span");
      name.textContent = p.name;
      if (/^\[.*\]$/.test(p.name)) name.className = "is-placeholder";
      li.appendChild(role); li.appendChild(name);
      crew.appendChild(li);
    });
  }

  /* ---------- power helpers ---------- */
  // Accepts "48,500,000", "48 500 000", "48.5M", "950k", "1.2B"
  function parsePower(str) {
    if (str == null) return NaN;
    var s = String(str).trim().toLowerCase().replace(/[\s,_]/g, "");
    if (!s) return NaN;
    var m = s.match(/^(\d+(?:\.\d+)?)([kmb])?$/);
    if (!m) return NaN;
    var mult = { k: 1e3, m: 1e6, b: 1e9 }[m[2]] || 1;
    return Math.round(parseFloat(m[1]) * mult);
  }
  function short(n) {
    var a = Math.abs(n);
    if (a >= 1e9) return trim(n / 1e9) + "B";
    if (a >= 1e6) return trim(n / 1e6) + "M";
    if (a >= 1e3) return trim(n / 1e3) + "K";
    return String(n);
  }
  function trim(x) { return (Math.round(x * 100) / 100).toString(); }
  function full(n) { return n.toLocaleString("en-US"); }

  /* ---------- power check ---------- */
  var powerIn = $("#power-input"), capIn = $("#cap-input");
  if (powerIn && capIn) {
    if (C.powerCap) capIn.value = full(C.powerCap);
    var capHint = $("#cap-hint");
    if (C.powerCapIsPlaceholder) {
      capHint.textContent = "Placeholder number. The real cap hasn't been posted yet; ask in Discord or type it in.";
      capHint.classList.add("is-placeholder");
    }
    var saved = store("manifest-power");
    if (saved) powerIn.value = saved;

    var result = $("#power-result"), verdict = $("#verdict"), sub = $("#verdict-sub");
    var fill = $("#meter-fill"), capMark = $(".meter-cap"), meter = $("#power-meter-label");

    var update = function () {
      var p = parsePower(powerIn.value), cap = parsePower(capIn.value);
      if (!(p > 0) || !(cap > 0)) {
        result.dataset.state = "empty";
        verdict.textContent = !(cap > 0) ? "Enter the power cap" : "Enter your total power";
        sub.textContent = "Use digits, with or without commas, or a short form like 48.5M.";
        fill.style.width = "0";
        return;
      }
      var scale = Math.max(p, cap) * 1.15;
      fill.style.width = (p / scale * 100).toFixed(2) + "%";
      capMark.style.left = (cap / scale * 100).toFixed(2) + "%";
      meter.setAttribute("aria-label", "Your power " + full(p) + ", cap " + full(cap));
      var diff = cap - p;
      if (diff > 0) {
        result.dataset.state = "under";
        verdict.textContent = "You're under the cap. Admit one!";
        sub.textContent = "You have " + short(diff) + " (" + full(diff) + ") of room. Keep it that way until the snapshot locks at the daily reset.";
      } else if (diff === 0) {
        result.dataset.state = "over";
        verdict.textContent = "You're exactly at the cap.";
        sub.textContent = "Drop a little more to be safe. Start with the Pre-Show Checklist below.";
      } else {
        result.dataset.state = "over";
        verdict.textContent = "You're " + short(-diff) + " over the cap.";
        sub.textContent = "You need to shed " + full(-diff) + " power. Start with resetting heroes and gear in the Pre-Show Checklist; dismiss low-tier troops only if that's not enough.";
      }
      if (/[\d]/.test(powerIn.value)) store("manifest-power", powerIn.value);
    };
    powerIn.addEventListener("input", update);
    capIn.addEventListener("input", update);
    $("#power-form").addEventListener("submit", function (e) { e.preventDefault(); });
    update();
  }

  /* ---------- checklist ---------- */
  var boxes = $$("[data-check]");
  var ticks = store("manifest-checklist") || {};
  var progFill = $("#progress-fill"), progText = $("#progress-text"), cleared = $("#cleared");
  function renderProgress() {
    var done = boxes.filter(function (b) { return b.checked; }).length;
    progFill.style.width = (boxes.length ? done / boxes.length * 100 : 0) + "%";
    progText.textContent = done + " of " + boxes.length + " done";
    cleared.hidden = done !== boxes.length;
  }
  boxes.forEach(function (b) {
    b.checked = !!ticks[b.id];
    b.addEventListener("change", function () {
      ticks[b.id] = b.checked;
      store("manifest-checklist", ticks);
      renderProgress();
    });
  });
  $("#reset-checklist").addEventListener("click", function () {
    ticks = {};
    boxes.forEach(function (b) { b.checked = false; });
    store("manifest-checklist", ticks);
    renderProgress();
  });
  renderProgress();

  /* ---------- countdown ---------- */
  var cdLabel = $("#countdown-label"), cdTime = $("#countdown-time");
  var snapshot = C.transferSnapshotUtc ? Date.parse(C.transferSnapshotUtc) : NaN;
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function nextReset(now) {
    var h = Number(C.dailyResetUtcHour) || 0;
    var d = new Date(now);
    var t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, 0, 0);
    return t > now ? t : t + 864e5;
  }
  function tick() {
    var now = Date.now(), target, label;
    if (snapshot > now) { target = snapshot; label = "Transfer snapshot locks in"; }
    else { target = nextReset(now); label = "Next daily reset in"; }
    var s = Math.max(0, Math.floor((target - now) / 1000));
    var d = Math.floor(s / 86400); s %= 86400;
    var txt = (d ? d + "d " : "") + pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60);
    cdLabel.textContent = label;
    cdTime.textContent = txt;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- join form → ticket ---------- */
  var form = $("#join-form"), msg = $("#form-msg"), ticket = $("#ticket"), ticketText = $("#ticket-text");
  var draft = store("manifest-join") || {};
  $$("input", form).forEach(function (i) {
    if (draft[i.name]) i.value = draft[i.name];
    i.addEventListener("input", function () { draft[i.name] = i.value; store("manifest-join", draft); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.classList.remove("is-error");
    var missing = $$("input[required]", form).filter(function (i) { return !i.value.trim(); });
    if (missing.length) {
      msg.textContent = "Fill in " + missing.map(function (i) { return $("label[for='" + i.id + "']").textContent.toLowerCase(); }).join(", ") + ".";
      msg.classList.add("is-error");
      missing[0].focus();
      return;
    }
    var f = {}; $$("input", form).forEach(function (i) { f[i.name] = i.value.trim(); });
    var pw = parsePower(f.power);
    var lines = [
      "🎟️ [MAN]ifest application",
      "Governor: " + f.governor + " (ID " + f.governorId + ")",
      "Server: " + f.server + "  ·  Town Center: " + f.townCenter,
      "Total power: " + (pw > 0 ? full(pw) : f.power),
      "Coordinates: " + f.coords
    ];
    if (f.discord) lines.push("Discord: " + f.discord);
    ticketText.textContent = lines.join("\n");
    ticket.hidden = false;
    msg.textContent = "Ticket printed. Copy it and post it in our Discord.";

    if (C.formEndpoint) {
      fetch(C.formEndpoint, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(f) })
        .then(function (r) { msg.textContent = r.ok ? "Ticket printed and sent to our recruiters. Posting it in Discord gets you a faster reply." : msg.textContent; })
        .catch(function () {});
    }
    ticket.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  $("#copy-ticket").addEventListener("click", function () {
    var btn = this, text = ticketText.textContent;
    var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy ticket"; }, 1800); };
    var fallback = function () {
      var r = document.createRange(); r.selectNodeContents(ticketText);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Selected. Press copy";
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  });
})();
