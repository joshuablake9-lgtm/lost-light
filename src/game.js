(() => {
  "use strict";

  const WIDTH = 160;
  const HEIGHT = 144;
  const TILE = 16;\n  const MAP_WIDTH = 20 * TILE;\n  const MAP_HEIGHT = 15 * TILE;
  const SAVE_KEY = "lost-light-save-v1";

  const COLORS = {
    ink: 0x182847,
    deep: 0x26334d,
    cream: 0xffefc1,
    gold: 0xe6b85c,
    timber: 0x8b4f3d,
    floorA: 0xc99157,
    floorB: 0xb97845,
    green: 0x5f8b62,
    blue: 0x477b9d,
    red: 0xa84b4b,
    purple: 0x76558f,
    white: 0xfff7d6
  };

  const MENTORS = [
    {
      id: "fighter", name: "Captain Brann", className: "Fighter",
      x: 4, y: 6, color: COLORS.red,
      intro: ["BRANN: Eighteen at last.", "You have a steady guard and a brave heart.", "Train with me today and carry Dunmere's shield."],
      boon: "Longsword · Guard Stance · 14 HP"
    },
    {
      id: "ranger", name: "Mira Vale", className: "Ranger",
      x: 15, y: 5, color: COLORS.green,
      intro: ["MIRA: The gulls were restless before dawn.", "You notice what others miss.", "Walk the wild paths with me and learn the hunter's craft."],
      boon: "Hunting Bow · Mark Quarry · 12 HP"
    },
    {
      id: "rogue", name: "Tess Quick", className: "Rogue",
      x: 16, y: 10, color: COLORS.purple,
      intro: ["TESS: Adulthood? Sounds expensive.", "You're quick, quiet, and clever when you need to be.", "I could teach you which locks deserve opening."],
      boon: "Twin Knives · Quickstep · 11 HP"
    },
    {
      id: "cleric", name: "Sister Elowen", className: "Cleric",
      x: 6, y: 11, color: COLORS.gold,
      intro: ["ELOWEN: The Lost Light has watched over you.", "Compassion can be stronger than steel.", "Serve beside me and learn to mend what darkness breaks."],
      boon: "Mace · Healing Light · 13 HP"
    },
    {
      id: "wizard", name: "Orin Fen", className: "Wizard",
      x: 12, y: 8, color: COLORS.blue,
      intro: ["ORIN: Your heirloom stirred last night.", "There is an unanswered question in you.", "Study with me and give that question a voice."],
      boon: "Oak Wand · Ember Bolt · 9 HP"
    }
  ];

  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
    catch (_) { return {}; }
  }

  function saveGame(data) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  class LostLightScene extends Phaser.Scene {
    constructor() {
      super("LostLight");
      this.mode = "title";
      this.dialogue = null;
      this.dialogueIndex = 0;
      this.dialogueDone = null;
      this.busy = false;
      this.facing = { x: 0, y: 1 };
      this.heroTile = { x: 9, y: 12 };
      this.blocked = new Set();
      this.npcs = [];
      this.save = loadSave();
    }

    create() {
      this.cameras.main.setBackgroundColor(COLORS.ink);
      this.makeTextures();
      this.keys = this.input.keyboard.addKeys({
        up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT",
        w: "W", a: "A", s: "S", d: "D",
        z: "Z", enter: "ENTER", space: "SPACE",
        x: "X", esc: "ESC", r: "R"
      });
      this.showTitle();
    }

    makeTextures() {
      const makePerson = (key, coat, hair = COLORS.ink) => {
        const g = this.make.graphics({ add: false });
        // 16x24 GBC-style figure: strong outline, readable hair, face, coat and boots.
        g.fillStyle(COLORS.ink);
        g.fillRect(4, 1, 8, 2).fillRect(3, 3, 10, 6);
        g.fillStyle(hair);
        g.fillRect(4, 2, 8, 3).fillRect(3, 5, 3, 4).fillRect(10, 5, 3, 4);
        g.fillStyle(COLORS.cream);
        g.fillRect(5, 5, 6, 5);
        g.fillStyle(COLORS.ink);
        g.fillRect(6, 7, 1, 1).fillRect(9, 7, 1, 1);
        g.fillRect(3, 11, 10, 10);
        g.fillStyle(coat);
        g.fillRect(4, 11, 8, 8).fillRect(2, 12, 2, 6).fillRect(12, 12, 2, 6);
        g.fillStyle(COLORS.cream);
        g.fillRect(2, 18, 3, 2).fillRect(11, 18, 3, 2);
        g.fillStyle(COLORS.ink);
        g.fillRect(4, 19, 3, 5).fillRect(9, 19, 3, 5);
        g.fillStyle(0x384968);
        g.fillRect(4, 19, 3, 2).fillRect(9, 19, 3, 2);
        g.generateTexture(key, 16, 24);
        g.destroy();
      };
      makePerson("hero", 0x3f6380, 0x5b352d);
      MENTORS.forEach(m => makePerson(m.id, m.color));
      const flame = this.make.graphics({ add: false });
      flame.fillStyle(COLORS.red).fillRect(4, 7, 8, 8);
      flame.fillStyle(COLORS.gold).fillRect(6, 3, 5, 10);
      flame.fillStyle(COLORS.white).fillRect(7, 7, 3, 6);
      flame.generateTexture("flame", 16, 16);
      flame.destroy();
    }

