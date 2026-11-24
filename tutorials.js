// ═══════════════════════════════════════════════════════════════════════════
// ORL101 — TUTORIALS DATA
// Two tutorials only: Throat and Nose. Content is authored from Dr Al-Bar's
// own slide decks; nothing here is invented. Each tutorial has:
//   slides[]     — every teaching point and image from the deck, in deck order
//   activities[] — mixed game formats generated from those same slides
// Activity `type` must be one of the keys registered in tutorial.js (TUT_GAMES).
// ═══════════════════════════════════════════════════════════════════════════

window.ORL_TUTORIALS = [
  {
    id: 1,
    slug: "throat",
    title: "Throat",
    title_ar: "الحنجرة والبلعوم",
    icon: "🗣️",
    colour: "#B23A48",
    blurb: "Pharynx, tonsils, larynx & the paediatric airway",
    source_deck: "",          // filled when the deck is received
    slides: [],               // [{n, title, title_ar, bullets:[], image, image_caption, note}]
    activities: []            // [{type, title, ...type-specific fields}]
  },
  {
    id: 2,
    slug: "nose",
    title: "Nose",
    title_ar: "الأنف والجيوب",
    icon: "👃",
    colour: "#0D7377",
    blurb: "Nasal cavity, sinuses, epistaxis & rhinosinusitis",
    source_deck: "",
    slides: [],
    activities: []
  }
];

// Attach to ORL_DATA so the static API can serve it like every other section.
if (typeof ORL_DATA !== 'undefined') { ORL_DATA.tutorials = window.ORL_TUTORIALS; }
