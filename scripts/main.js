// Legendary Sheet Theme — restyles the hero and challenge sheets of the official
// Legend in the Mist system (mist-engine-fvtt) as theme cards on parchment, in
// the spirit of the original "Legend in the Mist: Demo" sheets.
//
// It only adds classes / small labels to the system's own sheets: every button,
// tag and field keeps working exactly as in the system. Art is referenced from
// the installed system (never copied into this module).

const MODULE_ID = "legendary-sheet-theme-litm";
const SYSTEM_ID = "mist-engine-fvtt";

const SETTINGS = {
  CHARACTERS: "characters",
  CHALLENGES: "challenges",
  TILT: "tilt",
  BACKDROP: "backdrop",
};

const TYPE_LABEL = {
  "litm-origin": "Origin",
  "litm-adventure": "Adventure",
  "litm-greatness": "Greatness",
  "litm-variable": "Variable",
};

function setup() {
  if (game.system.id !== SYSTEM_ID) return;
  const rerender = () => {
    for (const app of foundry.applications.instances.values()) {
      if (app.document?.documentName === "Actor" && app.rendered) app.render();
    }
  };
  const reg = (key, data) => game.settings.register(MODULE_ID, key, {
    name: `LEGENDARY.settings.${key}.name`, hint: `LEGENDARY.settings.${key}.hint`,
    scope: "client", config: true, onChange: rerender, ...data,
  });
  reg(SETTINGS.CHARACTERS, { type: Boolean, default: true });
  reg(SETTINGS.CHALLENGES, { type: Boolean, default: true });
  reg(SETTINGS.TILT, { type: Boolean, default: true });
  reg(SETTINGS.BACKDROP, {
    type: String, default: "art",
    choices: {
      art: "LEGENDARY.settings.backdrop.art",
      parchment: "LEGENDARY.settings.backdrop.parchment",
      none: "LEGENDARY.settings.backdrop.none",
    },
  });
}

// (also works when loaded after "init", e.g. a test copy)
if (globalThis.game?.ready) setup(); else Hooks.once("init", setup);

/** Which theme applies to this sheet, if any. */
function themeFor(app) {
  const actor = app.document;
  if (actor?.documentName !== "Actor") return null;
  if (actor.type === "litm-character" && game.settings.get(MODULE_ID, SETTINGS.CHARACTERS)) return "character";
  if (actor.type === "litm-npc" && game.settings.get(MODULE_ID, SETTINGS.CHALLENGES)) return "challenge";
  return null;
}

const loc = (key) => game.i18n.localize(`LEGENDARY.${key}`);

function decorateCharacter(app, root) {
  const editMode = !!app.document.system.editMode;
  root.classList.toggle("legendary-edit", editMode);

  // Theme cards: the type in the top band ("Origin theme"), a legend line
  // ("Power tags · Weakness tag") and the title tag.
  for (const card of root.querySelectorAll(".themebook-style")) {
    const type = [...card.classList].find(c => TYPE_LABEL[c]);
    const h2 = card.querySelector(":scope > .themebook-item > h2.theme-name, :scope > h2.theme-name");
    if (h2 && !h2.dataset.legendaryType) {
      let label = "";
      if (type) label = loc(`type.${TYPE_LABEL[type]}`);
      else if (card.classList.contains("litm-backpack")) label = loc("type.ItemTags");
      else if (card.classList.contains("litm-fellowship-themecard")) label = loc("type.Fellowship");
      h2.dataset.legendaryType = label;
    }
    const tags = card.querySelector(".powertags-container");
    if (tags && type && !editMode && !tags.querySelector(".legendary-legend")) {
      const legend = document.createElement("div");
      legend.className = "legendary-legend";
      legend.innerHTML = `<span>${loc("legend.power")}</span><span class="sep">·</span><span class="weak">${loc("legend.weakness")}</span>`;
      tags.prepend(legend);
    }
    // development tracks: put the label (a bare text node) in its own element
    for (const dev of card.querySelectorAll(".development-partial-container")) {
      for (const node of [...dev.childNodes]) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const span = document.createElement("span");
          span.className = "legendary-dev-label";
          span.textContent = node.textContent.trim();
          node.replaceWith(span);
        }
      }
    }
    // long titles get a smaller size
    const title = card.querySelector(".powertag-name.first");
    if (title) title.classList.toggle("legendary-long", title.textContent.trim().length > 14);
    // the quest: quote marks like a book epigraph
    const quest = card.querySelector(".quest-text");
    if (quest && !quest.dataset.legendary) {
      quest.dataset.legendary = "1";
      const t = quest.textContent.trim().replace(/^["“«]+|["”»]+$/g, "");
      quest.textContent = t ? `«${t}»` : "";
    }
  }

  // Header: the roll buttons become a "Roll Dice" scroll
  const rolls = root.querySelector(".sheet-header .col-main");
  if (rolls && !rolls.querySelector(".legendary-roll-title")) {
    const title = document.createElement("div");
    title.className = "legendary-roll-title";
    title.textContent = loc("rollDice");
    rolls.prepend(title);
  }
}

function decorateChallenge(app, root) {
  root.classList.toggle("legendary-edit", !!app.document.system.editMode);
  // A narrow, card-shaped window the first time it opens
  if (!app._legendarySized) {
    app._legendarySized = true;
    if (!app.document.system.editMode) app.setPosition({ width: 430, height: Math.min(860, window.innerHeight - 40) });
  }
}

Hooks.on("renderActorSheetV2", (app, element) => {
  if (game.system.id !== SYSTEM_ID) return;
  const theme = themeFor(app);
  const root = app.element ?? element;
  root.classList.toggle("legendary-theme", !!theme);
  root.classList.toggle("legendary-character", theme === "character");
  root.classList.toggle("legendary-challenge", theme === "challenge");
  if (!theme) return;
  root.classList.toggle("legendary-tilt", game.settings.get(MODULE_ID, SETTINGS.TILT));
  root.dataset.legendaryBackdrop = game.settings.get(MODULE_ID, SETTINGS.BACKDROP);
  if (theme === "character") decorateCharacter(app, root);
  else decorateChallenge(app, root);
});
