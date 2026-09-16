(() => {
  "use strict";

  const WIDTH = 480;
  const HEIGHT = 432;
  const TITLE_WIDTH = 960;
  const TITLE_HEIGHT = 864;
  const TILE = 48;
  const MAP_WIDTH = 20 * TILE;
  const MAP_HEIGHT = 15 * TILE;
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
      boon: "Longsword · Second Wind · 18 HP"
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
      boon: "Twin Knives · Sneak Attack · 14 HP"
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
      boon: "Oak Wand · Magic Missile · 12 HP"
    }
  ];


  const ITEMS = {
    watch_blade: { name:"Watchman's Blade", slot:"weapon", damage:1, description:"+1 damage. A serviceable sword recovered from the gatehouse." },
    quilted_jack: { name:"Quilted Jack", slot:"armor", hp:2, description:"+2 maximum HP. Patched but sturdy barracks armor." },
    saint_token: { name:"Silver Saint Token", slot:"trinket", hp:1, description:"+1 maximum HP. A small emblem from the ruined chapel." },
    marsh_boots: { name:"Marshwalker Boots", slot:"armor", hp:1, description:"+1 maximum HP. Keeps steady footing in flooded stonework." },
    jailer_ring: { name:"Jailer's Iron Ring", slot:"trinket", armor:1, description:"+1 armor. Heavy iron engraved with Greywatch's crest." },
    tempered_hatchet: { name:"Tempered Hatchet", slot:"weapon", damage:1, description:"+1 damage. The finest surviving weapon in the armory." },
    hearth_charm: { name:"Hearthkeeper Charm", slot:"trinket", healing:1, description:"+1 healing from draughts and healing abilities." },
    scribe_lens: { name:"Runed Scribe Lens", slot:"trinket", mp:1, description:"+1 maximum MP. The glass still holds a trace of old magic." },
    captain_mantle: { name:"Captain's Mantle", slot:"armor", hp:2, description:"+2 maximum HP. A weathered cloak from the war room." },
    greywatch_buckler: { name:"Greywatch Buckler", slot:"armor", className:"Fighter", armor:1, hp:1, unique:true, description:"Fighter only. +1 armor and +1 maximum HP." },
    hawk_quiver: { name:"Hawkfeather Quiver", slot:"trinket", className:"Ranger", damage:1, unique:true, description:"Ranger only. +1 damage with every attack." },
    nightglass_dirk: { name:"Nightglass Dirk", slot:"weapon", className:"Rogue", damage:1, unique:true, description:"Rogue only. +1 damage, including Sneak Attack scaling." },
    dawn_reliquary: { name:"Reliquary of Dawn", slot:"trinket", className:"Cleric", mp:2, healing:1, unique:true, description:"Cleric only. +2 maximum MP and +1 healing." },
    violet_spellshard: { name:"Violet Spellshard", slot:"trinket", className:"Wizard", mp:2, magic:1, unique:true, description:"Wizard only. +2 maximum MP and +1 Magic Missile damage." }
  };

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
      this.enemies = [];
      this.loot = [];
      this.inventoryUi = [];
      this.inventoryIndex = 0;
      this.inventoryScroll = 0;
      this.area = "";
      this.objective = "";
      this.playerHp = 0;
      this.playerMaxHp = 0;
      this.battleTarget = null;
      this.battleIndex = 0;
      this.battleMenu = "main";
      this.battleUi = [];
      this.save = loadSave();
    }

    create() {
      this.cameras.main.setBackgroundColor(COLORS.ink);
      this.makeTextures();
      this.keys = this.input.keyboard.addKeys({
        up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT",
        w: "W", a: "A", s: "S", d: "D",
        z: "Z", enter: "ENTER", space: "SPACE",
        x: "X", esc: "ESC", r: "R", i: "I"
      });
      this.showTitle();
    }

    makeTextures() {
      const makePerson = (key, coat, hair, role = "villager") => {
        const directions = ["down", "up", "side"];
        directions.forEach(direction => {
          const g = this.make.graphics({ add: false });
          const outline = COLORS.ink;
          const skin = 0xf0c38e;
          const leather = 0x5a382f;
          const metal = 0xa9b8b0;

          // Ground shadow.
          g.fillStyle(0x101827, 0.45).fillEllipse(12, 29, 15, 4);

          // Legs, boots and body outline.
          g.fillStyle(outline);
          g.fillRect(6, 18, 12, 9).fillRect(5, 26, 6, 5).fillRect(13, 26, 6, 5);
          g.fillRect(3, 17, 4, 9).fillRect(17, 17, 4, 9);
          g.fillStyle(coat);
          g.fillRect(7, 18, 10, 8).fillRect(4, 18, 3, 7).fillRect(17, 18, 3, 7);
          g.fillStyle(leather);
          g.fillRect(7, 24, 10, 2);
          g.fillStyle(0x384968);
          g.fillRect(6, 26, 5, 3).fillRect(13, 26, 5, 3);
          g.fillStyle(leather);
          g.fillRect(5, 29, 6, 2).fillRect(13, 29, 6, 2);

          // Head outline and ears.
          g.fillStyle(outline).fillRect(6, 6, 12, 12).fillRect(5, 10, 2, 5).fillRect(17, 10, 2, 5);
          g.fillStyle(skin).fillRect(7, 8, 10, 9).fillRect(5, 11, 2, 3).fillRect(17, 11, 2, 3);

          if (direction === "up") {
            g.fillStyle(hair).fillRect(6, 6, 12, 11);
            g.fillStyle(outline).fillRect(7, 16, 10, 2);
          } else if (direction === "side") {
            g.fillStyle(hair).fillRect(6, 6, 12, 5).fillRect(6, 9, 4, 7);
            g.fillStyle(outline).fillRect(15, 11, 2, 2).fillRect(17, 14, 2, 1);
          } else {
            g.fillStyle(hair).fillRect(6, 6, 12, 4).fillRect(6, 9, 3, 4).fillRect(15, 9, 3, 4);
            g.fillStyle(outline).fillRect(9, 12, 2, 2).fillRect(14, 12, 2, 2);
            g.fillStyle(0xd08168).fillRect(11, 15, 3, 1);
          }

          // Class-specific silhouettes and readable equipment.
          if (role === "fighter") {
            g.fillStyle(metal).fillRect(3, 17, 5, 4).fillRect(16, 17, 5, 4);
            g.fillStyle(COLORS.gold).fillRect(11, 20, 2, 2);
            g.fillStyle(metal).fillRect(20, 12, 2, 13);
            g.fillStyle(leather).fillRect(19, 22, 4, 2);
          } else if (role === "ranger") {
            g.fillStyle(0x31553c).fillTriangle(5, 10, 12, 3, 19, 10);
            g.fillStyle(leather).fillRect(18, 8, 2, 18);
            g.fillStyle(COLORS.gold).fillRect(19, 7, 1, 5).fillRect(21, 9, 1, 5);
          } else if (role === "rogue") {
            g.fillStyle(0x453555).fillTriangle(5, 10, 12, 3, 19, 10);
            g.fillStyle(0xc35d68).fillRect(7, 16, 10, 2);
            g.fillStyle(metal).fillRect(2, 22, 5, 2).fillRect(17, 22, 5, 2);
          } else if (role === "cleric") {
            g.fillStyle(0xf2ead0).fillRect(7, 18, 10, 7);
            g.fillStyle(COLORS.gold).fillRect(11, 19, 2, 5).fillRect(9, 21, 6, 2);
            g.fillStyle(COLORS.gold).fillRect(20, 12, 2, 14).fillCircle(21, 10, 4);
          } else if (role === "wizard") {
            g.fillStyle(0x334b85).fillTriangle(3, 8, 13, 0, 20, 8).fillRect(3, 7, 18, 3);
            g.fillStyle(COLORS.gold).fillRect(10, 3, 2, 2).fillRect(15, 6, 2, 2);
            g.fillStyle(0x6b432f).fillRect(20, 12, 2, 15);
            g.fillStyle(0x65b9c7).fillCircle(21, 10, 3);
          } else if (role === "innkeeper") {
            g.fillStyle(0xf2ead0).fillRect(8, 19, 8, 7);
            g.fillStyle(COLORS.gold).fillRect(11, 21, 2, 2);
          } else {
            g.fillStyle(COLORS.gold).fillRect(11, 20, 2, 2);
          }

          if (key.startsWith("hero-") || ["fighter","ranger","rogue","cleric","wizard"].includes(role)) {
            if (role === "fighter") {
              // Steel breastplate, shield boss, helmet rim and longsword.
              g.fillStyle(0x667586).fillRect(7,18,10,6);
              g.fillStyle(0xb8c1b7).fillRect(8,18,8,2).fillRect(11,19,2,5);
              g.fillStyle(0xe6b85c).fillRect(10,21,4,3);
              g.fillStyle(0x303b49).fillRect(5,6,14,3).fillRect(6,5,12,2);
              g.fillStyle(0xa9b8b0).fillCircle(3,21,6);
              g.fillStyle(0xe6b85c).fillCircle(3,21,2);
              g.fillStyle(0xd8ded4).fillRect(20,9,2,16);
              g.fillStyle(0x704536).fillRect(18,23,6,2);
            } else if (role === "ranger") {
              // Layered forest cloak, hood, bow and visible arrow fletching.
              g.fillStyle(0x294b39).fillTriangle(5,17,12,10,19,17).fillTriangle(5,17,12,30,19,17);
              g.fillStyle(0x6f9258).fillRect(8,18,8,3);
              g.fillStyle(0x704536).fillRect(19,7,2,20);
              g.lineStyle(2,0xd1b06e).strokeCircle(20,17,8);
              g.fillStyle(0xe6b85c).fillTriangle(17,6,20,2,21,8).fillTriangle(20,7,23,3,23,9);
            } else if (role === "rogue") {
              // Deep hood, half mask, crossed belt and paired daggers.
              g.fillStyle(0x262634).fillTriangle(4,10,12,2,20,10).fillRect(5,8,14,6);
              if (direction !== "up") g.fillStyle(0x30303b).fillRect(7,13,10,4);
              g.fillStyle(0x9b4f61).fillRect(7,19,11,2);
              g.fillStyle(0x704536).fillRect(8,17,2,9).fillRect(15,17,2,9);
              g.fillStyle(0xc5ccc3).fillTriangle(2,19,7,20,2,24).fillTriangle(22,19,17,20,22,24);
            } else if (role === "cleric") {
              // Ivory tabard, sunburst holy symbol, mantle and war mace.
              g.fillStyle(0xf1e6c5).fillRect(7,17,10,10);
              g.fillStyle(0xc89b4d).fillRect(11,18,2,8).fillRect(8,21,8,2);
              g.fillStyle(0xffd166).fillCircle(12,21,3);
              g.fillStyle(0x8b5f45).fillRect(6,16,12,3);
              g.fillStyle(0x707d82).fillRect(20,11,3,16);
              g.fillStyle(0xb9c2b9).fillCircle(21,9,5);
              g.fillStyle(0xe6b85c).fillCircle(21,9,2);
            } else if (role === "wizard") {
              // Starred robe, broad pointed hat, satchel and crystal staff.
              g.fillStyle(0x293d75).fillTriangle(5,17,12,30,19,17);
              g.fillStyle(0x76558f).fillRect(6,17,12,3);
              g.fillStyle(0xffd166).fillRect(9,22,2,2).fillRect(15,25,2,2).fillRect(12,18,2,2);
              g.fillStyle(0x2c3768).fillTriangle(3,8,13,0,20,8).fillRect(2,7,20,3);
              g.fillStyle(0xffd166).fillRect(11,3,2,2).fillRect(16,6,2,2);
              g.fillStyle(0x6b432f).fillRect(20,10,2,18);
              g.fillStyle(0x9ad8e1).fillTriangle(18,10,21,3,24,10);
              g.fillStyle(0x704536).fillRect(3,19,4,6);
            }
          }

          // Named NPC silhouettes, professions and personal props.
          if (key === "mara") {
            g.fillStyle(0xf3e6c8).fillRect(7,18,10,9);
            g.fillStyle(0xc99157).fillRect(11,19,2,7).fillRect(8,22,8,2);
            g.fillStyle(0x704536).fillRect(4,17,3,10);
            g.fillStyle(0xe6b85c).fillCircle(5,24,2);
            if (direction !== "up") {
              g.fillStyle(0xb7bdad).fillEllipse(20,22,7,4);
              g.fillStyle(0xffefc1).fillRect(18,20,4,2);
            }
          } else if (key === "villager-a") {
            g.fillStyle(0xb28d6d).fillRect(4,16,16,4);
            g.fillStyle(0x76558f).fillTriangle(5,19,12,29,19,19);
            g.fillStyle(0x704536).fillRect(18,20,5,7);
            g.fillStyle(0xd6b16d).fillRect(19,18,3,2).fillRect(19,23,3,2);
          } else if (key === "villager-b") {
            g.fillStyle(0x37475b).fillRect(5,5,14,3).fillRect(8,3,8,3);
            g.fillStyle(0x477b9d).fillRect(6,18,12,4);
            g.fillStyle(0x8b5a3d).fillRect(2,17,3,12);
            g.fillStyle(0xb8c1b3).fillRect(1,15,5,4);
            g.fillStyle(0xe6b85c).fillRect(8,23,8,2);
          } else if (key === "villager-c") {
            g.fillStyle(0xc99157).fillRect(6,16,12,3);
            g.fillStyle(0x426748).fillTriangle(5,19,12,29,19,19);
            if (direction !== "up") {
              g.fillStyle(0xb89b62).fillRect(18,18,5,8);
              g.fillStyle(0xffefc1).fillRect(19,19,3,6);
            }
          }
          // Subtle facial highlights and garment seams at native pixel scale.
          if (direction !== "up") {
            g.fillStyle(0xf7d7a8,0.7).fillRect(direction==="side"?15:8,10,2,1);
            g.fillStyle(0x2a3140,0.55).fillRect(8,25,8,1);
          }

          g.generateTexture(key + "-" + direction, 24, 32);
          g.destroy();
        });
      };

      makePerson("hero", 0x3f6380, 0x5b352d, "hero");
      makePerson("hero-fighter", 0x8f3f43, 0x5b352d, "fighter");
      makePerson("hero-ranger", 0x3f7049, 0x704536, "ranger");
      makePerson("hero-rogue", 0x503d68, 0x24242c, "rogue");
      makePerson("hero-cleric", 0xd8c58f, 0x8b6244, "cleric");
      makePerson("hero-wizard", 0x3b548d, 0x4c354f, "wizard");
      MENTORS.forEach(m => makePerson(m.id, m.color, 0x2c2730, m.id));
      makePerson("mara", 0x9b6647, 0x6b3e32, "innkeeper");
      makePerson("villager-a", 0x7c5b8f, 0x4b302a, "villager");
      makePerson("villager-b", 0x477b9d, 0xb88755, "villager");
      makePerson("villager-c", 0x5f8b62, 0x372d2c, "villager");
      const makeMonster = (key, kind) => {
        ["down", "up", "side"].forEach(direction => {
          const g = this.make.graphics({ add: false });
          const outline = 0x172234;
          const skin = kind === "goblin" ? 0x73964e : (kind === "orc" ? 0x71805a : 0x9c6047);
          const skinLight = kind === "goblin" ? 0x9fbd63 : (kind === "orc" ? 0x93a66b : 0xc17a55);
          const cloth = kind === "goblin" ? 0x6d4937 : (kind === "orc" ? 0x4e3c35 : 0x8f343c);
          const armor = kind === "hobgoblin" ? 0x596675 : 0x4b443e;
          const broad = kind !== "goblin";

          g.fillStyle(0x101827, 0.45).fillEllipse(12, 29, broad ? 19 : 16, 4);
          // Bent legs and oversized clawed feet.
          g.fillStyle(outline).fillRect(broad ? 4 : 6, 23, 7, 7).fillRect(13, 23, 7, 7);
          g.fillStyle(0x342d2b).fillRect(broad ? 2 : 4, 28, 9, 3).fillRect(13, 28, 9, 3);
          // Ragged body or plated hobgoblin cuirass.
          g.fillStyle(outline).fillRect(broad ? 3 : 5, 14, broad ? 18 : 14, 12);
          g.fillStyle(cloth).fillRect(broad ? 4 : 6, 16, broad ? 16 : 12, 9);
          g.fillStyle(armor).fillRect(broad ? 5 : 7, 15, broad ? 14 : 10, kind === "hobgoblin" ? 7 : 3);
          if (kind === "hobgoblin") {
            g.fillStyle(0xb7bdad).fillRect(6, 16, 12, 2).fillRect(11, 14, 2, 10);
            g.fillStyle(0xe6b85c).fillRect(10, 19, 4, 4);
          }
          // Long arms, crude weapon and buckler.
          g.fillStyle(outline).fillRect(1, 15, 5, 10).fillRect(18, 15, 5, 10);
          g.fillStyle(skin).fillRect(2, 16, 4, 7).fillRect(18, 16, 4, 7);
          if (direction !== "up") {
            g.fillStyle(0xb8c1b3).fillTriangle(22, 13, 19, 23, 23, 21);
            g.fillStyle(0x5a392f).fillRect(20, 21, 2, 9);
            if (kind !== "goblin") {
              g.fillStyle(0x303943).fillCircle(3, 21, 6);
              g.fillStyle(0x89948d).fillCircle(3, 21, 3);
            }
          }
          // Distinct head: huge goblin ears/nose; tusked orc; crested hobgoblin.
          g.fillStyle(outline).fillEllipse(12, 9, broad ? 17 : 15, 14);
          if (kind === "goblin") {
            g.fillStyle(outline).fillTriangle(5, 7, 0, 2, 3, 13).fillTriangle(19, 7, 24, 2, 21, 13);
            g.fillStyle(skin).fillTriangle(6, 7, 1, 4, 4, 12).fillTriangle(18, 7, 23, 4, 20, 12);
          } else {
            g.fillStyle(outline).fillRect(2, 5, 4, 9).fillRect(18, 5, 4, 9);
            g.fillStyle(skin).fillRect(3, 6, 3, 7).fillRect(18, 6, 3, 7);
          }
          g.fillStyle(skin).fillEllipse(12, 9, broad ? 14 : 12, 12);
          g.fillStyle(skinLight).fillRect(7, 6, broad ? 10 : 8, 3);
          if (direction === "down" || direction === "side") {
            g.fillStyle(0xf4d66d).fillRect(direction === "side" ? 14 : 7, 8, 3, 3);
            if (direction === "down") g.fillRect(14, 8, 3, 3);
            g.fillStyle(0x182847).fillRect(direction === "side" ? 15 : 8, 9, 2, 2);
            if (direction === "down") g.fillRect(15, 9, 2, 2);
            if (kind === "goblin") {
              g.fillStyle(skinLight).fillTriangle(10, 10, 12, 17, 15, 11);
              g.fillStyle(0x35282a).fillRect(9, 14, 7, 2);
            } else {
              g.fillStyle(0xf3e1b0).fillTriangle(7, 13, 9, 17, 11, 13).fillTriangle(14, 13, 16, 17, 18, 13);
            }
          }
          // Layered monster detail: scars, ear interiors, straps, pouches and armor wear.
          if (kind === "goblin") {
            g.fillStyle(0xb57a70).fillTriangle(3,7,2,5,4,10).fillTriangle(21,7,22,5,20,10);
            g.fillStyle(0x3d2f2a).fillRect(5,19,14,2);
            g.fillStyle(0x9b6c3f).fillRect(6,20,4,5);
            g.fillStyle(0xd7c69a).fillRect(13,14,2,2);
            g.fillStyle(0x88464b).fillRect(7,17,3,2).fillRect(15,22,3,2);
            if(direction!=="up") g.fillStyle(0x3e4934).fillRect(6,11,3,1);
          } else if (kind === "orc") {
            g.fillStyle(0x59654a).fillRect(4,16,16,3);
            g.fillStyle(0x79877b).fillRect(3,16,6,5);
            g.fillStyle(0x313840).fillRect(10,19,4,3);
            g.fillStyle(0x925446).fillRect(15,6,3,1).fillRect(6,12,4,1);
            g.fillStyle(0x6e4934).fillRect(5,24,14,2);
          }
          if (kind === "hobgoblin") {
            g.fillStyle(0x222837).fillRect(7,1,10,3);
            g.fillStyle(0xb83f42).fillRect(10,0,4,5);
            g.fillStyle(0x7f8c92).fillRect(4,15,4,9).fillRect(16,15,4,9);
            g.fillStyle(0xd5b35e).fillRect(5,17,2,2).fillRect(17,17,2,2);
            g.fillStyle(0x282f3b).fillRect(5,23,14,3);
            g.fillStyle(0x8f343c).fillRect(8,24,8,2);
            if(direction!=="up") g.fillStyle(0xe6b85c).fillRect(11,7,2,2);
          }
          g.generateTexture(key + "-" + direction, 24, 32);
          g.destroy();
        });
      };
      makeMonster("goblin", "goblin");
      makeMonster("orc", "orc");
      makeMonster("hobgoblin", "hobgoblin");

      const chest = this.make.graphics({ add: false });
      chest.fillStyle(0x182847).fillRect(1,6,22,17);
      chest.fillStyle(0x704536).fillRect(3,8,18,13);
      chest.fillStyle(0xb97845).fillRect(4,5,16,7);
      chest.fillStyle(0x4d302a).fillRect(4,13,16,2);
      chest.fillStyle(0xe6b85c).fillRect(10,9,5,8);
      chest.fillStyle(0xffd166).fillRect(11,10,3,4);
      chest.fillStyle(0xa9b8b0).fillRect(4,9,2,10).fillRect(18,9,2,10);
      chest.fillStyle(0xd9a45a).fillRect(6,7,12,2);
      chest.lineStyle(2,0x2b2730).strokeRect(3,7,18,15);
      chest.generateTexture("treasure-chest",24,24);
      chest.destroy();

      const flame = this.make.graphics({ add: false });
      flame.fillStyle(0x7d3340,0.45).fillCircle(8,9,8);
      flame.fillStyle(COLORS.red).fillTriangle(2,14,7,5,9,14).fillTriangle(7,14,11,1,14,14);
      flame.fillStyle(0xf08b45).fillTriangle(4,14,8,4,12,14);
      flame.fillStyle(COLORS.gold).fillTriangle(6,14,9,7,11,14);
      flame.fillStyle(COLORS.white).fillRect(8,10,2,4);
      flame.generateTexture("flame", 16, 16);
      flame.destroy();
    }

    getHeroTexture(direction="down") {
      const classKey=(this.save.className || "").toLowerCase();
      return classKey ? "hero-"+classKey+"-"+direction : "hero-"+direction;
    }

    clearScene() {
      this.children.removeAll(true);
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0);
      this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
      this.dialogue = null;
      this.busy = false;
      this.npcs = [];
      this.enemies = [];
      this.loot = [];
      this.inventoryUi = [];
      this.hudText = null;
    }

    text(x, y, value, size = 7, color = "#ffefc1", origin = 0) {
      const renderScale = 3;
      return this.add.text(x * renderScale, y * renderScale, value, {

        fontFamily: 'Silkscreen, monospace',
        fontSize: (size * renderScale) + "px",
        fontStyle: "bold",
        color,
        resolution: 2,
        lineSpacing: 1
      }).setOrigin(origin).setDepth(20).setScrollFactor(0);
    }

    showTitle() {
      this.clearScene();
      this.scale.resize(TITLE_WIDTH, TITLE_HEIGHT);
      this.cameras.main.setSize(TITLE_WIDTH, TITLE_HEIGHT);
      this.cameras.main.setViewport(0, 0, TITLE_WIDTH, TITLE_HEIGHT);
      this.cameras.main.setBounds(0, 0, TITLE_WIDTH, TITLE_HEIGHT);
      this.mode = "title";

      const bg = this.add.graphics();
      bg.fillGradientStyle(0x101827, 0x101827, 0x243b59, 0x243b59, 1);
      bg.fillRect(0, 0, TITLE_WIDTH / 3, TITLE_HEIGHT / 3);

      // Moonlit Lantern Coast: layered silhouettes in a normalized 320×288 design grid.
      bg.fillStyle(0xf7e6ad).fillCircle(250, 44, 20);
      bg.fillStyle(0x243b59).fillCircle(257, 39, 19);
      bg.fillStyle(0x31566a);
      bg.fillTriangle(0, 198, 66, 108, 136, 198);
      bg.fillTriangle(76, 198, 190, 82, 302, 198);
      bg.fillTriangle(210, 198, 274, 126, 340, 198);
      bg.fillStyle(0x1d344c);
      bg.fillTriangle(-30, 220, 72, 142, 164, 220);
      bg.fillTriangle(122, 220, 224, 128, 350, 220);

      bg.fillStyle(0x17263b).fillRect(0, 200, TITLE_WIDTH / 3, 88);
      bg.fillStyle(0x284c63).fillRect(0, 221, TITLE_WIDTH / 3, 67);
      for (let x = 0; x < TITLE_WIDTH / 3; x += 24) {
        bg.fillStyle(x % 48 ? 0x3c7181 : 0x315f75);
        bg.fillRect(x, 230 + (x % 3) * 5, 18, 2);
        bg.fillRect(x + 7, 250 + (x % 4) * 4, 26, 2);
      }

      // Coastal village lights.
      for (const house of [[28,205],[52,198],[79,210],[104,194],[130,205]]) {
        bg.fillStyle(0x162238).fillRect(house[0], house[1], 19, 15);
        bg.fillTriangle(house[0]-3, house[1], house[0]+10, house[1]-10, house[0]+22, house[1]);
        bg.fillStyle(0xf4bd5f).fillRect(house[0]+5, house[1]+5, 4, 5);
      }

      // Large inn lantern focal point.
      bg.fillStyle(0x4c2d2d).fillRect(258, 66, 8, 84);
      bg.fillStyle(0x6f4536).fillRect(228, 65, 38, 8);
      bg.fillStyle(0x182847).fillRect(231, 78, 31, 48);
      bg.fillStyle(0xe6b85c).fillRect(235, 82, 23, 39);
      bg.fillStyle(0xffefc1).fillRect(241, 87, 11, 27);
      bg.fillStyle(0xd96b43).fillRect(245, 93, 5, 18);
      bg.lineStyle(4, 0x182847).strokeRect(231, 78, 31, 48);
      bg.lineBetween(246, 78, 246, 126);
      bg.lineBetween(231, 101, 262, 101);

      bg.setScale(3);

      // Stars.
      bg.fillStyle(0xffefc1);
      [[24,32],[55,54],[91,25],[214,23],[282,31],[302,68],[184,53]].forEach(([x,y]) => {
        bg.fillRect(x-2,y,5,1).fillRect(x,y-2,1,5);
      });

      this.text(26, 32, "LOST", 27, "#ffefc1")
        .setShadow(3, 3, "#8b3a3a", 0, false, true);
      this.text(26, 62, "LIGHT", 27, "#ffefc1")
        .setShadow(3, 3, "#8b3a3a", 0, false, true);
      this.text(28, 98, "A TALE OF THE LANTERN COAST", 8, "#b7d1b0");
      this.text(160, 221, this.save.className ? "CONTINUE" : "NEW JOURNEY", 13, "#fff7d6", 0.5);
      const prompt = this.text(160, 246, "PRESS Z OR ENTER", 9, "#e6b85c", 0.5);
      if (this.save.className) {
        this.text(160, 266, "R: ERASE SAVE", 7, "#89a39a", 0.5);
      }
      this.tweens.add({
        targets: prompt,
        alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1
      });
    }

    startGame() {
      this.migrateLeveling();
      this.scale.resize(WIDTH, HEIGHT);
      this.cameras.main.setSize(WIDTH, HEIGHT);
      this.cameras.main.setViewport(0, 0, WIDTH, HEIGHT);
      this.cameras.main.setScroll(0, 0);
      this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
      if (this.save.className) {
        if (this.save.gameComplete) {
          this.showEnding();
          return;
        }
        if (this.save.chapterStage === "castle") {
          this.buildCastle();
          return;
        }
        if (this.save.chapterStage === "road") {
          this.buildRoad();
          return;
        }
        if (this.save.chapterStage === "raid") {
          this.buildRaid();
          return;
        }
        this.buildInn();
        this.openDialogue([
          "Morning light spills through the shutters.",
          "Today begins your first day as a " + this.save.className + ".",
          "Objective: Speak with the people of the Lost Light Inn."
        ]);
        return;
      }
      this.mode = "intro";
      this.clearScene();
      const g = this.add.graphics();
      g.fillStyle(COLORS.ink).fillRect(0, 0, WIDTH, HEIGHT);
      g.fillStyle(COLORS.gold).fillCircle(80, 33, 10);
      g.fillStyle(COLORS.cream).fillCircle(80, 33, 5);
      this.text(80, 55, "THE LANTERN COAST", 8, "#ffd166", 0.5);
      this.openDialogue([
        "Dunmere is a small village at the edge of a wide and dangerous world.",
        "You arrived there eighteen years ago with no parents and one strange heirloom.",
        "The village raised you. The Lost Light Inn became your home.",
        "Today, you come of age."
      ], () => this.buildInn());
    }

    buildInn() {
      this.clearScene();
      this.mode = "world";
      this.area = "inn";
      this.heroTile = { x: 9, y: 12 };
      this.blocked = new Set();

      const g = this.add.graphics();
      g.fillStyle(COLORS.deep).fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
      // Hand-detailed plank floor with seams, highlights and deterministic knots.
      for (let y = 2; y < 15; y++) {
        for (let x = 1; x < 19; x++) {
          const px = x * TILE;
          const py = y * TILE;
          const plank = (x + y) % 3 === 0 ? 0xb87949 : ((x + y) % 2 ? COLORS.floorA : COLORS.floorB);
          g.fillStyle(plank).fillRect(px, py, TILE, TILE);
          g.fillStyle(0x8d593d).fillRect(px, py + TILE - 3, TILE, 3);
          g.fillStyle(0xd9a566, 0.65).fillRect(px + 4, py + 5, TILE - 8, 2);
          g.fillStyle(0x9b623f, 0.7).fillRect(px + 10, py + 19, TILE - 16, 2);
          if ((x * 7 + y * 11) % 5 === 0) {
            g.fillStyle(0x704536).fillEllipse(px + 31, py + 29, 7, 4);
            g.fillStyle(0xc38751).fillEllipse(px + 31, py + 29, 3, 2);
          }
          if (x % 2 === 0) g.fillStyle(0x865239).fillRect(px, py + 23, 4, 2);
        }
      }

      // Heavy timber frame with inset stone and carved braces.
      g.fillStyle(0x392b32).fillRect(TILE, 2 * TILE - 10, 18 * TILE, 18);
      g.fillStyle(COLORS.timber);
      g.fillRect(TILE, 2 * TILE, 18 * TILE, 8);
      g.fillRect(TILE, 15 * TILE - 8, 18 * TILE, 8);
      g.fillRect(TILE, 2 * TILE, 8, 13 * TILE);
      g.fillRect(19 * TILE - 8, 2 * TILE, 8, 13 * TILE);
      for (let x = 1; x < 19; x += 3) {
        g.fillStyle(0x5e372f).fillRect(x * TILE, 2 * TILE - 10, 7, 24);
        g.fillStyle(0xb07146).fillRect(x * TILE + 7, 2 * TILE - 8, 3, 21);
      }

      // Leaded windows throwing cool morning light.
      [4, 14].forEach(x => {
        const px = x * TILE;
        g.fillStyle(0x2a2530).fillRect(px, 2 * TILE + 7, TILE, 31);
        g.fillStyle(0x79a9ad).fillRect(px + 5, 2 * TILE + 11, TILE - 10, 22);
        g.fillStyle(0xc5ddd0, 0.55).fillRect(px + 9, 2 * TILE + 13, 7, 18);
        g.fillStyle(0x2a2530).fillRect(px + 23, 2 * TILE + 10, 3, 24);
        g.fillStyle(0x2a2530).fillRect(px + 5, 2 * TILE + 21, TILE - 10, 3);
        g.fillStyle(0xe5d290, 0.12).fillTriangle(px + 5, 2 * TILE + 34, px + TILE - 5, 2 * TILE + 34, px + TILE + 28, 5 * TILE);
      });

      // Carved rafters, limewash panels, iron nails and pools of window light.
      for(let x=2;x<19;x+=2) {
        g.fillStyle(0x3b2b2d,0.55).fillRect(x*T+18,2*T+5,7,12*T-12);
        g.fillStyle(0xd0a064).fillRect(x*T+20,2*T+8,2,12*T-18);
        for(let y=3;y<14;y+=3) g.fillStyle(0x242631).fillCircle(x*T+21,y*T+13,3);
      }
      for(let x=2;x<18;x+=3) {
        g.fillStyle(0xe7c58a,0.08).fillTriangle(x*T,3*T,(x+2)*T,3*T,(x+1)*T,10*T);
      }
      [[6,5],[12,4],[16,9],[4,13]].forEach(([x,y])=>{
        g.fillStyle(0x6c4434).fillEllipse(x*T+19,y*T+31,13,7);
        g.fillStyle(0xc58a52).fillRect(x*T+15,y*T+28,9,2);
      });
      for(let x=2;x<18;x++) {
        g.fillStyle(0x2b2730,0.22).fillRect(x*T,14*T+31,T,9);
        if(x%3===0) g.fillStyle(0xb97845).fillRect(x*T+9,14*T+24,27,3);
      }

      g.fillStyle(COLORS.timber);
      g.fillRect(TILE, 2 * TILE, 18 * TILE, 6);
      g.fillRect(TILE, 15 * TILE - 6, 18 * TILE, 6);
      g.fillRect(TILE, 2 * TILE, 6, 13 * TILE);
      g.fillRect(19 * TILE - 6, 2 * TILE, 6, 13 * TILE);

      for (let x = 1; x < 19; x++) {
        this.blocked.add(x + ",2");
        this.blocked.add(x + ",14");
      }
      for (let y = 2; y <= 14; y++) {
        this.blocked.add("1," + y);
        this.blocked.add("18," + y);
      }

      // South doorway to Dunmere. Stepping onto the threshold changes areas.
      g.fillStyle(0x2a2530).fillRect(9 * TILE + 7, 14 * TILE + 15, TILE - 14, TILE - 15);
      g.fillStyle(0x5e372f).fillRect(9 * TILE + 3, 14 * TILE + 8, 6, TILE - 8);
      g.fillStyle(0xb07146).fillRect(10 * TILE - 9, 14 * TILE + 8, 6, TILE - 8);
      g.fillStyle(0xd8b66f).fillRect(9 * TILE + 12, 13 * TILE + 35, TILE - 24, 8);
      this.blocked.delete("9,14");

      this.drawFurniture(g);
      this.text(80, 4, "LOST LIGHT INN · MORNING", 6, "#ffefc1", 0.5);

      this.hero = this.add.sprite(this.heroTile.x * TILE + 24, this.heroTile.y * TILE + 12, this.getHeroTexture("down"))
        .setDepth(10).setScale(2);

      this.npcs = MENTORS.map(m => {
        const sprite = this.add.sprite(m.x * TILE + 24, m.y * TILE + 12, m.id + "-down").setDepth(9).setScale(2);
        this.blocked.add(m.x + "," + m.y);
        return { ...m, sprite };
      });

      const innkeeper = {
        id: "innkeeper", name: "Mara", x: 9, y: 4, color: COLORS.timber,
        intro: this.save.className
          ? ["MARA: There you are, birthday boy.", "Your breakfast is getting cold.", "Go on. Everyone has something to say before the celebration."]
          : ["MARA: Happy birthday.", "Everyone who helped raise you came early.", "Speak with them. Today you decide what path you'll walk."],
        sprite: this.add.sprite(9 * TILE + 24, 4 * TILE + 12, "mara-down").setDepth(9).setScale(2)
      };
      this.npcs.push(innkeeper);
      this.blocked.add("9,4");

      this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
      this.cameras.main.startFollow(this.hero, true, 0.18, 0.18);
      this.cameras.main.setDeadzone(120, 96);

      this.text(4, 127, this.save.className ? "CLASS: " + this.save.className.toUpperCase() : "CHOOSE YOUR PATH", 5, "#ffd166");
      this.text(156, 127, "Z: TALK", 5, "#d7dfc4", 1);

      if (!this.save.seenWelcome) {
        this.save.seenWelcome = true;
        saveGame(this.save);
        this.openDialogue([
          "Chapter One: THE ASHFANG RAID",
          "Morning at the Lost Light Inn.",
          "Speak to Mara and the five mentors gathered for your birthday."
        ]);
      }
    }

    buildVillage() {
      this.clearScene();
      this.mode = "world";
      this.area = "village";
      this.heroTile = { x: 9, y: 5 };
      this.facing = { x: 0, y: 1 };
      this.blocked = new Set();
      const g = this.add.graphics();
      const T = TILE;
      const VW = 30;
      const VH = 22;
      const block = (x,y,w=1,h=1) => {
        for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) this.blocked.add(xx+","+yy);
      };

      // Layered grass with small deterministic details.
      for(let y=0;y<VH;y++) for(let x=0;x<VW;x++) {
        const px=x*T,py=y*T;
        g.fillStyle((x+y)%3===0?0x709c60:((x+y)%2?0x659254:0x78a566)).fillRect(px,py,T,T);
        g.fillStyle(0x4d7a49,0.65).fillRect(px+7,py+13,13,3).fillRect(px+31,py+34,9,3);
        if((x*7+y*11)%8===0) {
          g.fillStyle(0xf0d36b).fillRect(px+23,py+20,5,5);
          g.fillStyle(0xf1e5bd).fillRect(px+20,py+22,11,2);
        }
      }

      // Fine ground texture: grass blades, clover, stones and tiny wildflowers.
      for (let y = 0; y < VH; y++) {
        for (let x = 5; x < VW; x++) {
          const px = x * T, py = y * T;
          const seed = (x * 37 + y * 61) % 17;
          g.fillStyle(seed % 2 ? 0x436f45 : 0x86b66d, 0.85);
          g.fillRect(px + 8 + seed, py + 10, 3, 10);
          g.fillRect(px + 17 + (seed % 9), py + 28, 3, 7);
          if (seed === 3 || seed === 11) {
            g.fillStyle(seed === 3 ? 0xf3d875 : 0xd99aa2);
            g.fillRect(px + 29, py + 17, 5, 5);
            g.fillStyle(0xf4edca).fillRect(px + 31, py + 19, 2, 2);
          }
          if (seed === 7) {
            g.fillStyle(0x77766c).fillEllipse(px + 13, py + 35, 10, 6);
            g.fillStyle(0xa9a38d).fillRect(px + 10, py + 33, 5, 2);
          }
        }
      }

      // Sea, surf, cliffs and dock.
      for(let y=0;y<VH;y++) {
        for(let x=0;x<4;x++) {
          const water = (x + y) % 3 === 0 ? 0x245d78 : ((x + y) % 2 ? 0x347f94 : 0x2b7089);
          g.fillStyle(water).fillRect(x*T,y*T,T,T);
          g.fillStyle(0x72b8b5,0.8).fillRect(x*T+5,y*T+13,28,3);
          g.fillStyle(0xb8ded2,0.55).fillRect(x*T+18,y*T+28,25,3);
          g.fillStyle(0x1e536e,0.7).fillRect(x*T+2,y*T+42,19,3);
          block(x,y);
        }
        g.fillStyle(0x4e5557).fillRect(4*T,y*T,15,T);
        g.fillStyle(0x74766c).fillRect(4*T+4,y*T,11,T);
        g.fillStyle(0xa9a18b).fillRect(4*T+15,y*T,7,T);
        g.fillStyle(0xd7d0ad,0.85).fillRect(4*T+18,y*T+4,4,T-8);
        g.fillStyle(0x313f47,0.45).fillRect(4*T+2,y*T+12,8,4);
        g.fillStyle(0x91cbc1,0.9).fillRect(3*T+31,y*T+8,17,4);
        block(4,y);
      }
      for(let x=1;x<6;x++) {
        g.fillStyle(0x4d352f).fillRect(x*T,9*T+8,T,33);
        g.fillStyle(0xa26e48).fillRect(x*T,9*T+8,T-3,7);
        this.blocked.delete(x+",9");
      }

      // Roads and village square: worn earth, ruts, stones and grassy edges.
      for(let y=0;y<VH;y++) for(const x of [8,9,10]) {
        g.fillStyle((x+y)%2?0xb99b6b:0xc8aa78).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x8a704f,0.65).fillRect(x*T+7,y*T,T-14,3);
        g.fillStyle(0xddc18a,0.7).fillRect(x*T+12,y*T+11,T-24,2);
        g.fillStyle(0x756650).fillEllipse(x*T+15,y*T+19,8,5);
        g.fillStyle(0x9b865f).fillEllipse(x*T+37,y*T+36,11,6);
      }
      for (let y=0;y<VH;y++) {
        g.fillStyle(0x4f7d49,0.75).fillRect(8*T-5,y*T,5,T);
        g.fillStyle(0x4f7d49,0.75).fillRect(11*T,y*T,5,T);
      }
      for(let y=6;y<10;y++) for(let x=5;x<VW-1;x++) {
        g.fillStyle((x+y)%2?0xc2a371:0xb49364).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x856e52).fillEllipse(x*T+35,y*T+32,7,4);
      }

      // Expanded Dunmere districts: south quay, trade road, shrine lane and east ward.
      for(let y=16;y<19;y++) for(let x=5;x<VW-1;x++) {
        g.fillStyle((x+y)%2?0xb99a6a:0xc6a878).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x806b50,0.65).fillEllipse(x*T+13,y*T+31,9,5);
        g.fillStyle(0xd8bd88,0.65).fillRect(x*T+27,y*T+12,15,3);
      }
      for(let y=9;y<18;y++) for(const x of [24,25]) {
        g.fillStyle((x+y)%2?0xb99b6b:0xc8aa78).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x8a704f,0.55).fillRect(x*T+8,y*T+21,T-16,3);
      }
      for(let x=1;x<7;x++) {
        g.fillStyle(0x4d352f).fillRect(x*T,16*T+10,T,32);
        g.fillStyle(0xa26e48).fillRect(x*T,16*T+10,T-3,7);
        g.fillStyle(0x2a2930).fillRect(x*T+6,16*T+39,7,9);
        this.blocked.delete(x+",16");
      }


      const house=(x,y,w,h,wall,roof,doorX)=>{
        const px=x*T,py=y*T,pw=w*T,ph=h*T;
        g.fillStyle(0x252631,0.35).fillRect(px+12,py+15,pw,ph);
        g.fillStyle(0x27313a,0.35).fillRect(px+10,py+T+13,pw+8,ph-T);
        g.fillStyle(wall).fillRect(px,py+T,pw,ph-T);
        g.fillStyle(roof).fillTriangle(px-13,py+T+10,px+pw/2,py-18,px+pw+13,py+T+10);
        // Layered roof shingles and bright weathered edges.
        for (let row=0; row<4; row++) {
          const inset=row*15;
          const roofY=py+8+row*12;
          g.lineStyle(4,row%2?0x51363a:0x80504b,0.9);
          g.lineBetween(px+inset,roofY,px+pw-inset,roofY);
          for(let sx=px+inset+10+(row%2)*12;sx<px+pw-inset;sx+=28) {
            g.fillStyle(0x3d3035,0.65).fillRect(sx,roofY-2,3,8);
          }
        }
        g.lineStyle(4,0xa96d55,0.8).lineBetween(px-8,py+T+7,px+pw+8,py+T+7);
        // Dark timber frame and plaster panels.
        g.fillStyle(0x382c30).fillRect(px,py+T+6,pw,8);
        g.fillRect(px+7,py+T,7,ph-T).fillRect(px+pw-14,py+T,7,ph-T);
        g.fillRect(px+pw/2-3,py+T+7,6,ph-T-7);
        g.fillStyle(0xe3c48a,0.22).fillRect(px+16,py+T+18,pw/2-22,ph-T-29);
        for(let sx=px+15;sx<px+pw-15;sx+=32) {
          g.fillStyle(0xa55f42).fillRect(sx,py+8,25,12);
          g.fillStyle(0x6d3c37).fillRect(sx+6,py+3,19,6);
        }
        g.fillStyle(0x4c342e).fillRect(doorX*T+9,py+ph-43,T-18,43);
        g.fillStyle(0xe6b85c).fillCircle(doorX*T+T-14,py+ph-21,4);
        for(const wx of [x+1,x+w-2]) {
          g.fillStyle(0x29445c).fillRect(wx*T+11,py+T+23,T-22,28);
          g.fillStyle(0xa2cec6).fillRect(wx*T+16,py+T+28,T-32,17);
        }
        block(x,y,w,h);
        this.blocked.delete(doorX+","+(y+h-1));
      };
      house(6,0,7,5,0xb77a4d,0x6e3e42,9);
      house(14,1,5,4,0xc19a68,0x4f5d48,16);
      house(14,10,5,4,0x9f7655,0x4c4140,16);
      house(5,11,3,3,0xc5a36f,0x765245,6);
      house(21,1,6,5,0xa97a54,0x4b4142,23);
      house(23,11,5,4,0xc09a69,0x515e4c,25);
      house(14,18,6,3,0xb7a06f,0x695066,17);
      house(5,17,4,4,0xa87752,0x3f5960,7);

      // Blacksmith yard: furnace, anvil, timber rack and coal.
      block(20,7); block(21,7);
      g.fillStyle(0x34313a).fillRect(20*T+5,7*T+8,T-10,T-8);
      g.fillStyle(0x77766c).fillRect(20*T+10,7*T+3,T-20,13);
      g.fillStyle(0xe1703e,0.5).fillCircle(20*T+24,7*T+30,18);
      g.fillStyle(0xffc04d).fillRect(20*T+17,7*T+25,15,13);
      g.fillStyle(0x30333b).fillRect(21*T+5,7*T+22,38,11);
      g.fillStyle(0x666a6d).fillRect(21*T+13,7*T+11,22,18);
      g.fillStyle(0x5b4032).fillRect(20*T+4,8*T+8,2*T-8,7);
      [0,1,2,3].forEach(i=>g.fillStyle(0x8e6745).fillRect(20*T+10+i*19,8*T,8,27));

      // Shrine garden and weathered lantern-stone.
      block(19,15);
      g.fillStyle(0x5b6061).fillRect(19*T+13,15*T+13,22,31);
      g.fillStyle(0xa5a38f).fillRect(19*T+8,15*T+9,32,11);
      g.fillStyle(0xd6c97f).fillCircle(19*T+24,15*T+8,8);
      for(let x=14;x<21;x++) {
        g.fillStyle(0x365c3f).fillRect(x*T+5,17*T-8,T-10,7);
        g.fillStyle(x%2?0xd995a2:0xe7c65e).fillCircle(x*T+13,17*T-12,5);
        g.fillStyle(0xf1e6bd).fillCircle(x*T+31,17*T-9,4);
      }

      // East farms, hedgerows and a small watch platform.
      for(let y=17;y<21;y++) for(let x=22;x<28;x++) {
        block(x,y);
        g.fillStyle((x+y)%2?0x947445:0xa8854c).fillRect(x*T,y*T,T,T);
        for(let stalk=0;stalk<3;stalk++) {
          const sx=x*T+9+stalk*14;
          g.fillStyle(0xd4aa50).fillRect(sx,y*T+8,4,34);
          g.fillStyle(0xf1d274).fillRect(sx-4,y*T+9,12,4);
        }
      }
      g.lineStyle(6,0x704536).strokeRect(22*T,17*T,6*T,4*T);
      block(27,5);
      g.fillStyle(0x573b31).fillRect(27*T+8,5*T+6,8,42).fillRect(27*T+32,5*T+6,8,42);
      g.fillStyle(0x91613f).fillRect(27*T+3,5*T+6,T-6,13);
      g.fillStyle(0x26334d).fillRect(27*T+10,5*T-2,T-20,8);

      // Quayside nets, barrels, lobster pots and mooring posts.
      [[1,15],[3,15],[6,15]].forEach(([x,y],i)=>{
        g.fillStyle(0x47322e).fillEllipse(x*T+24,y*T+29,31,38);
        g.fillStyle(0x9b6844).fillRect(x*T+11,y*T+15,26,25);
        g.fillStyle(0x30313a).fillRect(x*T+9,y*T+20,30,4).fillRect(x*T+9,y*T+34,30,4);
        if(i<2) block(x,y);
      });
      g.lineStyle(3,0xd6c79f,0.75).strokeCircle(7*T+24,15*T+26,19);
      g.lineBetween(7*T+7,15*T+12,7*T+41,15*T+40);
      g.lineBetween(7*T+41,15*T+12,7*T+7,15*T+40);

      // District signposts.
      [[11,15,"SHRINE"],[20,9,"SMITHY"],[26,10,"EAST"]].forEach(([x,y])=>{
        g.fillStyle(0x50352f).fillRect(x*T+21,y*T+12,7,36);
        g.fillStyle(0x9c6b45).fillRect(x*T+4,y*T+8,T-8,17);
      });

      // Village dressing: cart, cargo, lamps, shrubs and a fishing skiff.
      g.fillStyle(0x47332f).fillRect(5*T+8,8*T+13,2*T-12,24);
      g.fillStyle(0x9a6844).fillRect(5*T+14,8*T+7,2*T-26,22);
      g.fillStyle(0x292b35).fillCircle(5*T+23,8*T+39,15).fillCircle(6*T+28,8*T+39,15);
      g.fillStyle(0xb48451).fillCircle(5*T+23,8*T+39,7).fillCircle(6*T+28,8*T+39,7);
      [[7,5],[14,5],[7,10],[17,9]].forEach(([x,y]) => {
        g.fillStyle(0x3f302e).fillRect(x*T+21,y*T+8,7,39);
        g.fillStyle(0xe6b85c,0.25).fillCircle(x*T+24,y*T+8,24);
        g.fillStyle(0x273344).fillRect(x*T+14,y*T,20,19);
        g.fillStyle(0xffd166).fillRect(x*T+19,y*T+4,10,11);
        g.fillStyle(0xffefc1).fillRect(x*T+22,y*T+5,4,7);
      });
      [[13,4],[18,4],[13,10],[8,13]].forEach(([x,y]) => {
        g.fillStyle(0x365c3f).fillCircle(x*T+24,y*T+31,22);
        g.fillStyle(0x568552).fillCircle(x*T+13,y*T+28,15).fillCircle(x*T+35,y*T+25,17);
        g.fillStyle(0x8fbd6d).fillCircle(x*T+23,y*T+19,12);
        g.fillStyle(0xe8cc71).fillRect(x*T+10,y*T+26,4,4);
      });
      g.fillStyle(0x3e2f2d).fillRect(2*T,10*T+14,2*T,18);
      g.fillStyle(0xb3784d).fillTriangle(T+12,10*T+16,3*T,9*T+30,4*T+35,10*T+16);
      g.fillStyle(0xd6b16d).fillRect(2*T+8,10*T+18,2*T-16,5);
      g.fillStyle(0x253d4d).fillRect(2*T+17,10*T+24,2*T-34,9);

      // Coastal life: laundry lines, dry-stone borders, flower beds and gull shadows.
      g.lineStyle(3,0x6f4a36).lineBetween(13*T,5*T+7,18*T,5*T+7);
      [0,1,2,3].forEach(i=>{
        const colors=[0xe5d9b6,0x9e5260,0x477b9d,0xd5a85f];
        g.fillStyle(colors[i]).fillTriangle(13*T+28+i*47,5*T+9,13*T+47+i*47,5*T+9,13*T+38+i*47,5*T+37);
      });
      for(let x=5;x<19;x+=2) {
        g.fillStyle(0x77766c).fillEllipse(x*T+15,10*T-9,17,9);
        g.fillStyle(0xaaa28d).fillRect(x*T+9,10*T-12,11,3);
      }
      [[7,5],[13,5],[18,9],[7,14]].forEach(([x,y])=>{
        g.fillStyle(0x365c3f).fillRect(x*T+4,y*T+31,T-8,8);
        for(let i=0;i<4;i++) {
          g.fillStyle(i%2?0xe7c65e:0xdb91a0).fillCircle(x*T+10+i*9,y*T+30-(i%2)*5,4);
        }
      });
      [[6,4],[12,2],[17,7]].forEach(([x,y])=>{
        g.fillStyle(0x26334d,0.16).fillEllipse(x*T,y*T,37,9);
        g.lineStyle(2,0xf1e5bd,0.8).arc(x*T-7,y*T-12,8,0.2,2.9);
        g.lineStyle(2,0xf1e5bd,0.8).arc(x*T+7,y*T-12,8,0.2,2.9);
      });
      for(let y=1;y<14;y+=2) {
        g.fillStyle(0xdce8d2,0.65).fillRect(4*T-9,y*T+11,13,3);
        g.fillStyle(0x779f91,0.55).fillRect(4*T-17,y*T+29,17,3);
      }

      // Lost Light sign and lantern.
      g.fillStyle(0x372b2f).fillRect(6*T+10,4*T-17,7,47);
      g.fillStyle(0x6d4433).fillRect(6*T+15,4*T-13,64,34);
      g.lineStyle(3,0xe6b85c).strokeRect(6*T+19,4*T-9,56,26);
      g.fillStyle(0xffd166).fillRect(6*T+82,4*T-5,12,22);
      g.fillStyle(0xfff1bd).fillRect(6*T+86,4*T,4,12);

      // Central well with timber frame.
      block(11,7,2,2);
      g.fillStyle(0x33313a,0.3).fillEllipse(12*T+8,9*T-7,94,31);
      g.fillStyle(0x74756e).fillEllipse(12*T,8*T+10,88,55);
      g.fillStyle(0xaea38c).fillEllipse(12*T,8*T+2,74,39);
      g.fillStyle(0x26334d).fillEllipse(12*T,8*T+3,50,24);
      g.fillStyle(0x5c3c31).fillRect(11*T+10,7*T+2,8,65).fillRect(13*T-18,7*T+2,8,65);
      g.fillRect(11*T+10,7*T+2,2*T-20,8);

      // Market stalls with striped awnings and produce.
      [[5,6,0xa84b4b],[16,6,0x477b9d]].forEach(([x,y,color])=>{
        block(x,y,2,1);
        g.fillStyle(0x4d352f).fillRect(x*T+6,y*T+25,2*T-12,23);
        g.fillStyle(color).fillTriangle(x*T,y*T+25,(x+1)*T,y*T-8,(x+2)*T,y*T+25);
        g.fillStyle(0xeee1bb).fillTriangle(x*T+20,y*T+25,(x+1)*T,y*T-8,(x+1)*T+24,y*T+25);
        g.fillStyle(0x805038).fillRect(x*T+10,y*T+31,2*T-20,16);
        g.fillStyle(0xd0a052).fillCircle(x*T+27,y*T+35,8);
        g.fillStyle(0x5f8b62).fillCircle(x*T+51,y*T+35,9);
      });

      // Fenced wheat field.
      for(let y=10;y<14;y++) for(let x=9;x<13;x++) {
        block(x,y);
        g.fillStyle(0xd3aa50).fillRect(x*T+8,y*T+7,4,35).fillRect(x*T+25,y*T+3,4,39).fillRect(x*T+40,y*T+11,4,31);
        g.fillStyle(0xf0cf73).fillRect(x*T+3,y*T+8,13,4).fillRect(x*T+20,y*T+4,13,4);
      }
      g.lineStyle(6,0x704536).strokeRect(9*T,10*T,4*T,4*T);

      // Trees on the eastern rise.
      [[18,5],[18,8],[13,13],[5,5]].forEach(([x,y])=>{
        block(x,y);
        g.fillStyle(0x52392f).fillRect(x*T+20,y*T+24,9,24);
        g.fillStyle(0x315b42).fillCircle(x*T+24,y*T+18,31);
        g.fillStyle(0x477b4a).fillCircle(x*T+13,y*T+20,20).fillCircle(x*T+36,y*T+17,22);
        g.fillStyle(0x78aa62).fillCircle(x*T+18,y*T+9,13);
      });

      for(let x=0;x<VW;x++){block(x,0);block(x,VH-1);}
      for(let y=0;y<VH;y++) block(VW-1,y);
      this.blocked.delete("9,4");

      this.text(80,4,"DUNMERE · LANTERN COAST",6,"#ffefc1",0.5);
      this.text(4,127,"VILLAGE SQUARE",5,"#ffd166");
      this.text(156,127,"Z: TALK",5,"#d7dfc4",1);
      this.hero=this.add.sprite(9*T+24,5*T+12,this.getHeroTexture("down")).setDepth(10).setScale(2);

      const villagers=[
        {id:"village-elin",x:7,y:7,texture:"villager-a-down",intro:["ELIN: Happy birthday!","Mara has half the village preparing your supper.","Stay near the square. Something has the gulls frightened."]},
        {id:"village-tomas",x:14,y:8,texture:"villager-b-down",intro:["TOMAS: The northern road is too quiet.","No caravans have arrived since yesterday.","Captain Brann should hear about it."]},
        {id:"village-nell",x:8,y:10,texture:"villager-c-down",intro:["NELL: I found black-fletched arrows by the east field.","They weren't made in Dunmere.","Maybe goblins are ranging farther south."]},
        {id:"village-aric",x:22,y:7,texture:"villager-b-down",intro:["ARIC: The forge has not cooled since dawn.","Farmers want spearheads, not plowshares.","That tells you what fear is moving through Dunmere."]},
        {id:"village-nessa",x:6,y:16,texture:"villager-a-down",intro:["NESSA: Three fishing boats came home before sunrise.","They saw torchlight moving along the northern cliffs.","Raiders do not usually carry that many banners."]},
        {id:"village-pella",x:17,y:15,texture:"villager-c-down",intro:["PELLA: The shrine garden is full of frightened birds.","I laid out bandages beside the old lantern-stone.","I hope we will not need them."]},
        {id:"village-dain",x:27,y:8,texture:"villager-b-down",intro:["DAIN: I have watched the east road all morning.","No traders. No riders. Not even a shepherd.","Keep your weapon close beyond the gate."]},
        {id:"village-jun",x:12,y:17,texture:"villager-c-down",intro:["JUN: I can see Greywatch from the hill when the clouds break.","Last night there was a red light in its highest window.","Everyone says the castle is empty."]}
      ];
      this.npcs=villagers.map(n=>{
        block(n.x,n.y);
        return {...n,sprite:this.add.sprite(n.x*T+24,n.y*T+12,n.texture).setDepth(9).setScale(2)};
      });
      this.cameras.main.setBounds(0,0,VW*T,VH*T);
      this.cameras.main.startFollow(this.hero,true,0.18,0.18);
      this.cameras.main.setDeadzone(120,96);
      this.openDialogue([
        "Dunmere rests above the bright waters of the Lantern Coast.",
        "The village is preparing for your birthday, but something feels wrong.",
        "Objective: Speak with the villagers and investigate the missing caravans."
      ]);
    }

    drawFurniture(g) {
      const T = TILE;
      const block = (x, y, w, h) => {
        for (let yy = y; yy < y + h; yy++) {
          for (let xx = x; xx < x + w; xx++) this.blocked.add(xx + "," + yy);
        }
      };
      const woodObject = (x, y, w, h, top = 0x8f553b) => {
        const px = x * T, py = y * T, pw = w * T, ph = h * T;
        g.fillStyle(0x2b2730, 0.35).fillRect(px + 7, py + 9, pw, ph);
        g.fillStyle(0x3c2b2d).fillRect(px, py, pw, ph);
        g.fillStyle(top).fillRect(px + 4, py + 4, pw - 8, ph - 8);
        g.fillStyle(0xc18452).fillRect(px + 7, py + 7, pw - 14, 3);
        g.lineStyle(3, 0x5d382f).strokeRect(px + 4, py + 4, pw - 8, ph - 8);
        block(x, y, w, h);
      };

      // Large woven rug anchors the room without affecting collision.
      g.fillStyle(0x2c2730, 0.3).fillRect(7 * T + 8, 6 * T + 10, 6 * T, 5 * T);
      g.fillStyle(0x315b62).fillRect(7 * T, 6 * T, 6 * T, 5 * T);
      g.fillStyle(0xd2a85c).fillRect(7 * T + 8, 6 * T + 8, 6 * T - 16, 5 * T - 16);
      g.fillStyle(0x8a3f46).fillRect(7 * T + 14, 6 * T + 14, 6 * T - 28, 5 * T - 28);
      g.lineStyle(5, 0x27464e).strokeRect(7 * T + 20, 6 * T + 20, 6 * T - 40, 5 * T - 40);

      // Guest beds with quilts and pillows.
      [[3,3,0x477b9d],[13,3,0xa84b4b]].forEach(([x,y,quilt]) => {
        woodObject(x, y, 3, 1, 0x704536);
        g.fillStyle(0xeee1bb).fillRect(x*T + 8, y*T + 8, 34, T - 16);
        g.fillStyle(quilt).fillRect(x*T + 44, y*T + 8, 3*T - 54, T - 16);
        g.fillStyle(0xd5bc7e).fillRect(x*T + 48, y*T + 15, 3*T - 63, 5);
      });

      // Polished bar, mugs, bottles and shelves.
      woodObject(7, 3, 4, 1, 0x6e3e32);
      g.fillStyle(0xe0c47d).fillRect(7*T + 13, 3*T - 8, 13, 18).fillRect(7*T + 16, 3*T - 12, 7, 5);
      g.fillStyle(0x4f846c).fillRect(8*T + 13, 3*T - 16, 9, 24);
      g.fillStyle(0xa84b4b).fillRect(9*T + 18, 3*T - 12, 8, 20);
      g.fillStyle(0x6e90b2).fillRect(10*T + 9, 3*T - 19, 8, 27);

      // Dining tables with plates, bread and candles.
      woodObject(3, 8, 3, 2);
      g.fillStyle(0xeee1bb).fillEllipse(3*T + 35, 8*T + 35, 24, 13).fillEllipse(5*T + 7, 9*T + 22, 24, 13);
      g.fillStyle(0xd7a554).fillEllipse(4*T + 17, 8*T + 23, 24, 13);
      g.fillStyle(0xffd166).fillRect(4*T + 66, 8*T + 8, 7, 25);
      g.fillStyle(0xfff3c4).fillRect(4*T + 67, 8*T + 1, 5, 10);

      woodObject(14, 11, 3, 2);
      g.fillStyle(0xeee1bb).fillEllipse(14*T + 31, 11*T + 28, 22, 12).fillEllipse(16*T + 10, 12*T + 20, 22, 12);
      g.fillStyle(0x4f846c).fillRect(15*T + 11, 11*T + 11, 17, 20);

      // Stone hearth with mantle, iron grate and layered glow.
      block(8, 8, 2, 1);
      g.fillStyle(0x2b2730, 0.3).fillRect(8*T + 8, 8*T + 11, 2*T, T);
      g.fillStyle(0x6c6865).fillRect(8*T, 8*T, 2*T, T);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          g.fillStyle((row + col) % 2 ? 0x817b70 : 0x595b5b);
          g.fillRect(8*T + col*19 + (row%2)*7, 8*T + row*15, 17, 12);
        }
      }
      g.fillStyle(0x262531).fillRect(8*T + 23, 8*T + 16, 2*T - 46, T - 16);
      g.fillStyle(0xd96b43, 0.28).fillCircle(9*T, 8*T + 28, 34);
      this.add.sprite(9*T, 8*T + 24, "flame").setDepth(3).setScale(3);

      // Wall shelf, books and crockery.
      woodObject(17, 5, 1, 3, 0x684333);
      [0,1,2].forEach(row => {
        g.fillStyle(0x312b32).fillRect(17*T + 6, (5+row)*T + 12, T - 12, 5);
        g.fillStyle(row===0 ? 0x477b9d : (row===1 ? 0xa84b4b : 0x5f8b62));
        g.fillRect(17*T + 10, (5+row)*T + 20, 8, 20).fillRect(17*T + 21, (5+row)*T + 16, 7, 24);
        g.fillStyle(0xe6b85c).fillRect(17*T + 32, (5+row)*T + 23, 8, 17);
      });

      // Barrels in the darker corners.
      [[2,11],[17,12]].forEach(([x,y]) => {
        block(x,y,1,1);
        g.fillStyle(0x33282b).fillEllipse(x*T + 24, y*T + 26, 42, 46);
        g.fillStyle(0x815037).fillRect(x*T + 6, y*T + 8, T - 12, T - 14);
        g.fillStyle(0x34313a).fillRect(x*T + 5, y*T + 14, T - 10, 5).fillRect(x*T + 5, y*T + 34, T - 10, 5);
        g.fillStyle(0xb47748).fillRect(x*T + 12, y*T + 10, 3, T - 18);
      });

      // Potted herbs beside the hearth.
      g.fillStyle(0x704536).fillRect(10*T + 8, 8*T + 24, 30, 20);
      g.fillStyle(0x477044).fillCircle(10*T + 13, 8*T + 20, 10).fillCircle(10*T + 29, 8*T + 16, 12);
    }

    openDialogue(lines, done = null) {
      this.dialogue = lines;
      this.dialogueIndex = 0;
      this.dialogueDone = done;
      this.busy = true;
      this.renderDialogue();
    }

    renderDialogue() {
      if (this.dialoguePanel) this.dialoguePanel.destroy();
      if (this.dialogueText) this.dialogueText.destroy();
      if (this.dialogueHint) this.dialogueHint.destroy();

      this.dialoguePanel = this.add.graphics().setDepth(50).setScrollFactor(0).setScale(3);
      this.dialoguePanel.fillStyle(COLORS.cream).fillRect(3, 86, 154, 55);
      this.dialoguePanel.fillStyle(COLORS.ink).fillRect(6, 89, 148, 49);
      this.dialoguePanel.lineStyle(1, COLORS.gold).strokeRect(5, 88, 150, 51);
      this.dialogueText = this.text(10, 94, this.wrap(this.dialogue[this.dialogueIndex], 24), 7, "#fff7d6")
        .setDepth(51);
      this.dialogueHint = this.text(149, 130, "▼", 7, "#ffd166", 1).setDepth(51);
    }

    closeDialogue() {
      [this.dialoguePanel, this.dialogueText, this.dialogueHint].forEach(x => x && x.destroy());
      this.dialoguePanel = this.dialogueText = this.dialogueHint = null;
      this.dialogue = null;
      this.busy = false;
      const done = this.dialogueDone;
      this.dialogueDone = null;
      if (done) done();
    }

    advanceDialogue() {
      if (!this.dialogue) return;
      this.dialogueIndex++;
      if (this.dialogueIndex >= this.dialogue.length) this.closeDialogue();
      else this.renderDialogue();
    }

    wrap(value, width) {
      const words = value.split(" ");
      const lines = [];
      let line = "";
      for (const word of words) {
        if ((line + " " + word).trim().length > width) {
          lines.push(line);
          line = word;
        } else line = (line + " " + word).trim();
      }
      if (line) lines.push(line);
      return lines.join("\n");
    }

    talk() {
      const targetX = this.heroTile.x + this.facing.x;
      const targetY = this.heroTile.y + this.facing.y;
      const chest=this.loot.find(item=>item.x===targetX&&item.y===targetY);
      if(chest) {
        this.collectLoot(chest);
        return;
      }
      const npc = this.npcs.find(n => n.x === targetX && n.y === targetY);
      if (!npc) {
        const message = this.enemies && this.enemies.length
          ? "No enemy is within reach. Face a nearby foe and press Z."
          : (this.area === "village"
            ? "You hear gulls, market chatter, and the distant wash of the sea."
            : "Nothing here but old floorboards and the smell of breakfast.");
        this.openDialogue([message]);
        return;
      }

      if (npc.id === "innkeeper") {
        this.openDialogue(npc.intro);
        return;
      }

      if (npc.id.startsWith("village-")) {
        this.save.spokenVillagers = this.save.spokenVillagers || [];
        if (!this.save.spokenVillagers.includes(npc.id)) this.save.spokenVillagers.push(npc.id);
        saveGame(this.save);
        const coreVillagers = ["village-elin","village-tomas","village-nell"];
        const allSpoken = coreVillagers.every(id => this.save.spokenVillagers.includes(id)) && !this.save.raidStarted;
        this.openDialogue(npc.intro, allSpoken ? () => this.beginRaid() : null);
        return;
      }

      if (this.save.className) {
        if (this.save.className === npc.className) {
          this.openDialogue([
            npc.name.toUpperCase() + ": You've chosen your road.",
            "Starting gear: " + npc.boon,
            "Meet me outside after the birthday meal."
          ]);
        } else {
          this.openDialogue([
            npc.name.toUpperCase() + ": " + this.save.className + " suits you.",
            "No path is walked alone. I'll be here when Dunmere needs us."
          ]);
        }
        return;
      }

      this.openDialogue([...npc.intro, "Choose " + npc.className + "?  Z: YES   X: NO"], () => {
        this.pendingMentor = npc;
        this.mode = "choice";
        this.busy = true;
        this.showChoice(npc);
      });
    }

    showChoice(npc) {
      this.choicePanel = this.add.graphics().setDepth(55).setScrollFactor(0).setScale(3);
      this.choicePanel.fillStyle(COLORS.cream).fillRect(24, 45, 112, 50);
      this.choicePanel.fillStyle(COLORS.ink).fillRect(27, 48, 106, 44);
      this.text(80, 54, npc.className.toUpperCase(), 8, "#ffd166", 0.5).setData("choice", true);
      this.text(80, 68, this.wrap(npc.boon, 24), 6, "#fff7d6", 0.5).setData("choice", true);
      this.text(80, 83, "Z ACCEPT · X DECLINE", 5, "#b7d1b0", 0.5).setData("choice", true);
    }

    clearChoice() {
      if (this.choicePanel) this.choicePanel.destroy();
      this.children.list.filter(x => x.getData && x.getData("choice")).forEach(x => x.destroy());
      this.choicePanel = null;
      this.pendingMentor = null;
      this.mode = "world";
      this.busy = false;
    }

    acceptClass() {
      const npc = this.pendingMentor;
      this.save.className = npc.className;
      this.save.mentor = npc.name;
      this.save.startedAt = new Date().toISOString();
      this.save.level = 1;
      this.save.xp = 0;
      this.save.levelingVersion = 2;
      this.save.healingDraughts = 3;
      this.save.smokeBombs = 1;
      this.save.inventory = [];
      this.save.equipment = { weapon:null, armor:null, trinket:null };
      this.save.collectedLoot = [];
      saveGame(this.save);
      if (this.hero) {
        const direction=this.facing.y<0?"up":(this.facing.x!==0?"side":"down");
        this.hero.setTexture(this.getHeroTexture(direction));
      }
      this.clearChoice();
      this.openDialogue([
        npc.name.toUpperCase() + ": Then it is decided.",
        "You begin today as a " + npc.className + ".",
        npc.boon,
        "The inn erupts in cheers. Outside, unseen beyond the morning hills, smoke begins to rise."
      ]);
    }

    tryMove(dx, dy) {
      if (this.busy || this.mode !== "world") return;
      this.facing = { x: dx, y: dy };
      if (dy < 0) {
        this.hero.setTexture(this.getHeroTexture("up")).setFlipX(false);
      } else if (dy > 0) {
        this.hero.setTexture(this.getHeroTexture("down")).setFlipX(false);
      } else {
        this.hero.setTexture(this.getHeroTexture("side")).setFlipX(dx < 0);
      }
      const nx = this.heroTile.x + dx;
      const ny = this.heroTile.y + dy;
      if (this.area === "dungeon" && (nx === 9 || nx === 10) && ny === 0) {
        if (this.enemies.length) this.openDialogue(["The northern passage is blocked while enemies remain."]);
        else if (this.dungeonRoom < 9) this.buildDungeonRoom(this.dungeonRoom + 1,"south");
        return;
      }
      if (this.area === "dungeon" && (nx === 9 || nx === 10) && ny === 14) {
        if (this.dungeonRoom > 0) this.buildDungeonRoom(this.dungeonRoom - 1,"north");
        return;
      }
      if (this.area === "inn" && nx === 9 && ny === 14) {
        if (!this.save.className) this.openDialogue(["MARA: Choose your path before you head outside."]);
        else this.buildVillage();
        return;
      }
      if (this.area === "village" && nx === 9 && ny === 4) {
        this.buildInn();
        return;
      }
      if (this.blocked.has(nx + "," + ny)) return;
      this.heroTile = { x: nx, y: ny };
      this.busy = true;
      this.tweens.add({
        targets: this.hero,
        x: nx * TILE + 24,
        y: ny * TILE + 12,
        duration: 90,
        onComplete: () => {
          this.busy = false;
          if (this.enemies && this.enemies.length) this.enemyTurn();
        }
      });
    }

    getEquipmentBonuses() {
      this.ensureInventory();
      const total={hp:0,damage:0,armor:0,mp:0,healing:0,magic:0};
      Object.values(this.save.equipment).forEach(id=>{
        const item=ITEMS[id];
        if(!item) return;
        for(const stat of Object.keys(total)) total[stat]+=item[stat] || 0;
      });
      return total;
    }

    spawnLoot(itemId,x,y) {
      this.ensureInventory();
      if(this.save.collectedLoot.includes(itemId)) return;
      const item=ITEMS[itemId];
      if(!item) return;
      const sprite=this.add.sprite(x*TILE+24,y*TILE+20,"treasure-chest").setDepth(13).setScale(2);
      this.loot.push({id:"loot-"+itemId,itemId,item,x,y,sprite});
      this.blocked.add(x+","+y);
    }

    collectLoot(chest) {
      this.ensureInventory();
      if(!this.save.inventory.includes(chest.itemId)) this.save.inventory.push(chest.itemId);
      if(!this.save.collectedLoot.includes(chest.itemId)) this.save.collectedLoot.push(chest.itemId);
      this.blocked.delete(chest.x+","+chest.y);
      chest.sprite.destroy();
      this.loot=this.loot.filter(x=>x!==chest);
      saveGame(this.save);
      const restriction=chest.item.className ? "  ["+chest.item.className.toUpperCase()+" ONLY]" : "";
      this.openDialogue([
        "You found: "+chest.item.name+"."+restriction,
        chest.item.description,
        "Press I to open your inventory and equip it."
      ]);
    }

    openInventoryMenu() {
      this.ensureInventory();
      this.mode="inventory";
      this.busy=true;
      this.inventoryIndex=Math.min(this.inventoryIndex,Math.max(0,this.save.inventory.length-1));
      this.renderInventoryMenu();
    }

    closeInventoryMenu() {
      this.inventoryUi.forEach(x=>x&&x.destroy());
      this.inventoryUi=[];
      this.mode="world";
      this.busy=false;
      this.updateHud();
    }

    renderInventoryMenu(message="") {
      this.inventoryUi.forEach(x=>x&&x.destroy());
      this.inventoryUi=[];
      const panel=this.add.graphics().setDepth(100).setScrollFactor(0);
      panel.fillStyle(0x101827,0.98).fillRect(8,10,464,412);
      panel.lineStyle(5,COLORS.cream).strokeRect(8,10,464,412);
      panel.lineStyle(2,COLORS.gold).strokeRect(15,17,450,398);
      panel.fillStyle(0x26334d).fillRect(20,52,440,44);
      panel.fillStyle(0x182847).fillRect(20,326,440,78);
      this.inventoryUi.push(panel);

      const style=(size,color="#fff7d6")=>({fontFamily:"Silkscreen, monospace",fontSize:size+"px",color});
      const title=this.add.text(25,24,"INVENTORY",style(22,"#ffd166")).setDepth(101).setScrollFactor(0);
      const eq=this.save.equipment;
      const short=id=>id&&ITEMS[id]?ITEMS[id].name:"—";
      const equipped=this.add.text(29,60,
        "WEAPON: "+short(eq.weapon)+"\nARMOR:  "+short(eq.armor)+"\nTRINKET:"+short(eq.trinket),
        style(11,"#b7d1b0")).setDepth(101).setScrollFactor(0);
      this.inventoryUi.push(title,equipped);

      const inventory=this.save.inventory;
      if(!inventory.length) {
        const empty=this.add.text(30,125,"Your pack contains no equipment.",style(15,"#89a39a")).setDepth(101).setScrollFactor(0);
        this.inventoryUi.push(empty);
      } else {
        const visible=7;
        if(this.inventoryIndex<this.inventoryScroll) this.inventoryScroll=this.inventoryIndex;
        if(this.inventoryIndex>=this.inventoryScroll+visible) this.inventoryScroll=this.inventoryIndex-visible+1;
        inventory.slice(this.inventoryScroll,this.inventoryScroll+visible).forEach((id,row)=>{
          const item=ITEMS[id],index=this.inventoryScroll+row;
          const selected=index===this.inventoryIndex;
          const worn=this.save.equipment[item.slot]===id;
          const restricted=item.className&&item.className!==this.save.className;
          const label=(selected?"▶ ":"  ")+(worn?"[E] ":"")+item.name+(item.unique?" ★":"");
          const line=this.add.text(30,110+row*29,label,style(14,
            restricted?"#6f7280":(selected?"#ffd166":"#fff7d6")
          )).setDepth(101).setScrollFactor(0);
          this.inventoryUi.push(line);
        });
        const item=ITEMS[inventory[this.inventoryIndex]];
        const stats=[
          item.damage?"+ "+item.damage+" DAMAGE":"",
          item.armor?"+ "+item.armor+" ARMOR":"",
          item.hp?"+ "+item.hp+" HP":"",
          item.mp?"+ "+item.mp+" MP":"",
          item.healing?"+ "+item.healing+" HEALING":"",
          item.magic?"+ "+item.magic+" SPELL DAMAGE":""
        ].filter(Boolean).join("  ·  ");
        const detail=this.add.text(29,338,
          (message||item.description)+"\n"+stats+"\nZ: EQUIP   X/I: CLOSE",
          style(11,message?"#ffb09f":"#b7d1b0")).setDepth(101).setScrollFactor(0);
        detail.setWordWrapWidth(420);
        this.inventoryUi.push(detail);
      }
    }

    moveInventoryCursor(direction) {
      if(!this.save.inventory.length) return;
      this.inventoryIndex=(this.inventoryIndex+direction+this.save.inventory.length)%this.save.inventory.length;
      this.renderInventoryMenu();
    }

    toggleEquipment() {
      if(!this.save.inventory.length) return;
      const id=this.save.inventory[this.inventoryIndex],item=ITEMS[id];
      if(item.className && item.className!==this.save.className) {
        this.renderInventoryMenu("Only a "+item.className+" can equip "+item.name+".");
        return;
      }
      const oldStats=this.getClassStats();
      this.save.equipment[item.slot]=this.save.equipment[item.slot]===id?null:id;
      const newStats=this.getClassStats();
      this.playerMaxHp=newStats.hp;
      this.playerHp=Math.max(1,Math.min(newStats.hp,this.playerHp+(newStats.hp-oldStats.hp)));
      this.playerMaxMp=newStats.mp||0;
      this.playerMp=Math.max(0,Math.min(this.playerMaxMp,(this.playerMp||0)+(this.playerMaxMp-(oldStats.mp||0))));
      this.save.playerHp=this.playerHp;
      this.save.playerMp=this.playerMp;
      saveGame(this.save);
      this.renderInventoryMenu();
    }

    getClassStats() {
      const level=Math.max(1,this.save.level || 1);
      const rank=level-1;
      const stats = {
        Fighter: { hp: 18+rank*4, damage: 5+Math.floor(rank/2), armor: 2+Math.floor(rank/3), skill: "Second Wind" },
        Ranger: { hp: 15+rank*3, damage: 5+Math.floor(rank/2), armor: 1+Math.floor(rank/4), skill: "Hunter's Mark" },
        Rogue: { hp: 14+rank*3, damage: 6+Math.floor(rank/2), armor: 1+Math.floor(rank/4), skill: "Sneak Attack" },
        Cleric: { hp: 16+rank*3, damage: 4+Math.floor(rank/2), armor: 1+Math.floor(rank/3), skill: "Healing Light", mp: 6+rank*2, abilityCost: 3 },
        Wizard: { hp: 12+rank*2, damage: 7+Math.floor(rank/2), armor: 0+Math.floor(rank/5), skill: "Magic Missile", mp: 9+rank*3, abilityCost: 3 }
      };
      const result={...(stats[this.save.className] || stats.Fighter)};
      const gear=this.getEquipmentBonuses();
      result.hp+=gear.hp;
      result.damage+=gear.damage;
      result.armor+=gear.armor;
      if(result.mp) result.mp+=gear.mp;
      result.healing=gear.healing;
      result.magic=gear.magic;
      return result;
    }

    xpToNext(level=this.save.level || 1) {
      if(level===1) return 100;
      if(level===2) return 250;
      return 250+(level-2)*200;
    }

    migrateLeveling() {
      if(!this.save.className || this.save.levelingVersion===2) return;
      let earned=0;
      if(this.save.raidCleared) earned+=40;
      if(this.save.roadCleared) earned+=38;
      const roomRewards=[20,20,18,20,28,36,20,28,36,81];
      const cleared=Array.isArray(this.save.clearedRooms)?this.save.clearedRooms:[];
      cleared.forEach(room=>{if(roomRewards[room]) earned+=roomRewards[room];});
      let level=1, xp=earned;
      while(level<10 && xp>=this.xpToNext(level)) {
        xp-=this.xpToNext(level);
        level++;
      }
      this.save.level=level;
      this.save.xp=xp;
      this.save.levelingVersion=2;
      const stats=this.getClassStats();
      this.save.playerHp=Math.min(this.save.playerHp || stats.hp,stats.hp);
      this.save.playerMp=Math.min(this.save.playerMp || stats.mp || 0,stats.mp || 0);
      saveGame(this.save);
    }

    gainExperience(enemy) {
      if (enemy.xpAwarded) return;
      enemy.xpAwarded=true;
      const reward=enemy.id==="varkul" ? 45 : (enemy.type==="orc" || enemy.type==="hobgoblin" ? 18 : 10);
      let level=Math.max(1,this.save.level || 1);
      let xp=Math.max(0,this.save.xp || 0)+reward;
      let leveled=false;
      const oldMax=this.playerMaxHp;
      while(level<10 && xp>=this.xpToNext(level)) {
        xp-=this.xpToNext(level);
        level++;
        leveled=true;
      }
      this.save.level=level;
      this.save.xp=level>=10 ? 0 : xp;
      if (leveled) {
        const stats=this.getClassStats();
        this.playerMaxHp=stats.hp;
        this.playerHp=stats.hp;
        this.playerMaxMp=stats.mp || 0;
        this.playerMp=this.playerMaxMp;
        this.save.playerHp=this.playerHp;
        this.save.playerMp=this.playerMp;
        const notice=this.text(80,48,"LEVEL UP!  LV "+level,8,"#ffd166",0.5).setDepth(95);
        this.tweens.add({targets:notice,y:notice.y-24,alpha:0,duration:1200,delay:450,onComplete:()=>notice.destroy()});
      } else if (this.playerMaxHp !== oldMax) {
        this.playerMaxHp=this.getClassStats().hp;
      }
      saveGame(this.save);
    }

    prepareCombat(area, heroX, heroY, objective) {
      this.clearScene();
      this.mode = "world";
      this.area = area;
      this.objective = objective;
      this.heroTile = { x: heroX, y: heroY };
      this.facing = { x: 0, y: -1 };
      this.blocked = new Set();
      this.enemies = [];
      this.guarding = false;
      const stats = this.getClassStats();
      this.playerMaxHp = stats.hp;
      this.playerHp = Math.min(this.save.playerHp || stats.hp, stats.hp);
      this.playerMaxMp = stats.mp || 0;
      this.playerMp = this.playerMaxMp;
      this.save.playerMp = this.playerMp;
    }

    addBoundaries() {
      for (let x = 0; x < 20; x++) {
        this.blocked.add(x + ",0");
        this.blocked.add(x + ",14");
      }
      for (let y = 0; y < 15; y++) {
        this.blocked.add("0," + y);
        this.blocked.add("19," + y);
      }
    }

    createCombatHero() {
      this.hero = this.add.sprite(this.heroTile.x * TILE + 24, this.heroTile.y * TILE + 12, this.getHeroTexture("up"))
        .setDepth(20).setScale(2);
      this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
      this.cameras.main.startFollow(this.hero, true, 0.18, 0.18);
      this.cameras.main.setDeadzone(120, 96);
      this.updateHud();
    }

    updateHud() {
      if (this.hudText) this.hudText.destroy();
      if (!this.enemies || !this.enemies.length) return;
      const stats = this.getClassStats();
      this.hudText = this.text(
        4, 127,
        "LV"+(this.save.level||1)+" XP"+(this.save.xp||0)+"/"+this.xpToNext()+
          " HP"+this.playerHp+"/"+this.playerMaxHp+
          (this.playerMaxMp ? " MP"+this.playerMp+"/"+this.playerMaxMp : "")+
          " F"+this.enemies.length,
        5, "#ffefc1"
      ).setDepth(70);
    }

    spawnEnemy(id, type, x, y, hp, damage, name) {
      const enemy = {
        id, type, x, y, hp, maxHp: hp, damage, name,
        sprite: this.add.sprite(x * TILE + 24, y * TILE + 12, type + "-down").setDepth(14).setScale(2)
      };
      this.enemies.push(enemy);
      this.blocked.add(x + "," + y);
      return enemy;
    }

    attackEnemy(enemy) {
      const inBattle=this.mode==="battle";
      if(this.busy && !inBattle) return;
      this.busy=true;
      if(inBattle) this.battleResolving=true;
      const stats=this.getClassStats();
      let damage=stats.damage;
      if(this.save.className==="Rogue" && enemy.hp===enemy.maxHp) damage+=2;
      if(this.save.className==="Ranger" && this.enemies.length===1) damage+=1;
      if(this.save.className==="Ranger" && enemy.marked) damage+=2;
      enemy.hp-=damage;

      if(inBattle) {
        this.cameras.main.shake(80,0.006);
        this.tweens.add({
          targets:this.battleHeroSprite,x:145,duration:80,yoyo:true
        });
        this.tweens.add({
          targets:this.battleEnemySprite,alpha:0.2,duration:70,yoyo:true,
          onComplete:()=>this.finishBattleStrike(enemy,true,"You deal "+damage+" damage.")
        });
        return;
      }

      this.cameras.main.shake(80,0.006);
      this.tweens.add({
        targets:enemy.sprite,alpha:0.25,duration:55,yoyo:true,
        onComplete:()=>{
          this.busy=false;
          if(enemy.hp<=0) {
            this.removeDefeatedEnemy(enemy);
            if(!this.enemies.length) {
              this.onCombatCleared();
              return;
            }
          }
          this.enemyTurn();
        }
      });
    }

    removeDefeatedEnemy(enemy) {
      this.gainExperience(enemy);
      this.blocked.delete(enemy.x+","+enemy.y);
      enemy.sprite.destroy();
      this.enemies=this.enemies.filter(e=>e!==enemy);
      this.updateHud();
    }

    finishBattleStrike(enemy,enemyActs,message) {
      if(enemy.hp<=0) {
        this.removeDefeatedEnemy(enemy);
        this.clearBattleMenu(true);
        this.busy=false;
        if(!this.enemies.length) this.onCombatCleared();
        return;
      }
      if(enemyActs) this.battleEnemyTurn(message);
      else {
        this.busy=false;
        this.battleMenu="main";
        this.battleIndex=0;
        this.renderBattleMenu(message);
      }
    }

    battleEnemyTurn(playerMessage="") {
      this.battleResolving=true;
      const enemy=this.battleTarget;
      if(!enemy || enemy.hp<=0) return;
      let dealt=Math.max(1,enemy.damage-this.getClassStats().armor);
      if(this.guarding) {
        dealt=Math.max(1,Math.floor(dealt/3));
        this.guarding=false;
      }
      this.playerHp-=dealt;
      this.save.playerHp=this.playerHp;
      saveGame(this.save);
      this.cameras.main.flash(75,120,20,20);
      this.tweens.add({targets:this.battleEnemySprite,x:326,duration:90,yoyo:true});
      this.tweens.add({
        targets:this.battleHeroSprite,alpha:0.25,duration:85,yoyo:true,
        onComplete:()=>{
          if(this.playerHp<=0) {
            this.playerHp=0;
            this.clearBattleMenu(true);
            this.openDialogue([
              "Your strength fails and the world goes dark.",
              "Mara's voice calls you back from the edge.",
              "You return to the beginning of the battle, restored."
            ],()=>this.restartCombatArea());
            return;
          }
          this.busy=false;
          this.battleResolving=false;
          this.battleMenu="main";
          this.battleIndex=0;
          this.updateHud();
          this.renderBattleMenu((playerMessage?playerMessage+"  ":"")+enemy.name+" deals "+dealt+" damage.");
        }
      });
    }

    enemyTurn() {
      if (this.busy || !this.enemies || !this.enemies.length) return;
      let totalDamage = 0;
      for (const enemy of this.enemies) {
        const distance = Math.abs(enemy.x - this.heroTile.x) + Math.abs(enemy.y - this.heroTile.y);
        if (distance === 1) {
          totalDamage += enemy.damage;
          this.tweens.add({ targets: enemy.sprite, scaleX: 2.35, scaleY: 2.35, duration: 55, yoyo: true });
          continue;
        }
        if (distance > 6) continue;
        const choices = [];
        const dx = Math.sign(this.heroTile.x - enemy.x);
        const dy = Math.sign(this.heroTile.y - enemy.y);
        if (Math.abs(this.heroTile.x - enemy.x) >= Math.abs(this.heroTile.y - enemy.y)) {
          choices.push([dx,0],[0,dy]);
        } else choices.push([0,dy],[dx,0]);
        for (const [mx,my] of choices) {
          if (!mx && !my) continue;
          const nx=enemy.x+mx, ny=enemy.y+my, key=nx+","+ny;
          if (nx === this.heroTile.x && ny === this.heroTile.y) continue;
          if (!this.blocked.has(key)) {
            this.blocked.delete(enemy.x + "," + enemy.y);
            enemy.x=nx; enemy.y=ny; this.blocked.add(key);
            this.tweens.add({targets:enemy.sprite,x:nx*TILE+24,y:ny*TILE+12,duration:100});
            break;
          }
        }
      }
      if (totalDamage) {
        const armor = this.getClassStats().armor;
        let dealt = Math.max(1, totalDamage - armor);
        if (this.guarding) {
          dealt = Math.max(1, Math.floor(dealt / 3));
          this.guarding = false;
        }
        this.playerHp -= dealt;
        this.save.playerHp = this.playerHp;
        saveGame(this.save);
        this.cameras.main.flash(100, 120, 20, 20);
        if (this.playerHp <= 0) {
          this.playerHp = 0;
          this.updateHud();
          this.busy = true;
          this.openDialogue([
            "Your strength fails and the world goes dark.",
            "Mara's voice calls you back from the edge.",
            "You return to the beginning of the battle, restored."
          ], () => this.restartCombatArea());
          return;
        }
      }
      this.updateHud();
    }

    combatTalk() {
      const tx=this.heroTile.x+this.facing.x, ty=this.heroTile.y+this.facing.y;
      const enemy=this.enemies.find(e=>e.x===tx&&e.y===ty);
      if (enemy) {
        this.openBattleMenu(enemy);
        return true;
      }
      return false;
    }

    ensureInventory() {
      if (typeof this.save.healingDraughts !== "number") this.save.healingDraughts = 3;
      if (typeof this.save.smokeBombs !== "number") this.save.smokeBombs = 1;
      if (!Array.isArray(this.save.inventory)) this.save.inventory=[];
      if (!Array.isArray(this.save.collectedLoot)) this.save.collectedLoot=[];
      if (!this.save.equipment) this.save.equipment={weapon:null,armor:null,trinket:null};
    }

    openBattleMenu(enemy) {
      this.ensureInventory();
      this.battleTarget = enemy;
      this.battleResolving = false;
      this.abilityUses = typeof enemy.abilityUses === "number" ? enemy.abilityUses : 2;
      enemy.abilityUses = this.abilityUses;
      this.battleMenu = "main";
      this.battleIndex = 0;
      this.mode = "battle";
      this.busy = true;
      this.renderBattleMenu();
    }

    clearBattleMenu(returnToWorld = true) {
      this.battleUi.forEach(x => x && x.destroy());
      this.battleUi = [];
      if (returnToWorld) {
        this.mode = "world";
        this.busy = false;
      }
    }

    renderBattleMenu(message = "") {
      this.clearBattleMenu(false);
      const enemy = this.battleTarget;
      if (!enemy || enemy.hp <= 0) {
        this.mode = "world";
        this.busy = false;
        return;
      }

      const panel = this.add.graphics().setDepth(80).setScrollFactor(0);
      const palette = this.area === "castle"
        ? { sky: 0x303844, far: 0x46515b, ground: 0x626765, light: 0x89908a }
        : (this.area === "road"
          ? { sky: 0x8eb59a, far: 0x52765a, ground: 0x6f8b58, light: 0xa9bd79 }
          : { sky: 0xd69b68, far: 0x7b704f, ground: 0x84925b, light: 0xd5bd72 });

      // Full-screen handheld battle arena with layered depth.
      panel.fillStyle(palette.sky).fillRect(0, 0, WIDTH, 306);
      panel.fillStyle(0xffefc1, 0.16).fillRect(0, 0, WIDTH, 58);
      panel.fillStyle(palette.far).fillTriangle(0, 208, 88, 90, 174, 208);
      panel.fillTriangle(105, 208, 236, 72, 350, 208);
      panel.fillTriangle(278, 208, 395, 102, 480, 208);
      panel.fillStyle(palette.light, 0.7).fillTriangle(52, 148, 88, 90, 121, 151);
      panel.fillTriangle(185, 125, 236, 72, 282, 128);
      panel.fillStyle(palette.ground).fillRect(0, 188, WIDTH, 118);
      for (let x=0; x<WIDTH; x+=32) {
        panel.fillStyle(x%64===0 ? palette.light : palette.far, 0.38).fillRect(x, 238+(x%3)*7, 19, 4);
      }

      // Opposing combat platforms.
      panel.fillStyle(0x182847,0.3).fillEllipse(359,172,184,42);
      panel.fillStyle(palette.light).fillEllipse(359,164,174,35);
      panel.fillStyle(palette.ground).fillEllipse(359,158,146,24);
      panel.fillStyle(0x182847,0.34).fillEllipse(112,286,211,49);
      panel.fillStyle(palette.light).fillEllipse(112,278,202,41);
      panel.fillStyle(palette.ground).fillEllipse(112,270,169,29);

      // Bottom dialogue and command frames.
      panel.fillStyle(0x101827).fillRect(0,306,WIDTH,126);
      panel.lineStyle(5,COLORS.cream).strokeRect(8,313,258,111);
      panel.lineStyle(5,COLORS.cream).strokeRect(273,313,199,111);
      panel.lineStyle(2,COLORS.gold).strokeRect(14,319,246,99);
      panel.lineStyle(2,COLORS.gold).strokeRect(279,319,187,99);

      // Status cards and health bars.
      panel.fillStyle(0xffefc1).fillRect(16,22,223,69);
      panel.fillStyle(0x182847).fillRect(21,27,213,59);
      panel.lineStyle(3,COLORS.gold).strokeRect(19,25,217,63);
      panel.fillStyle(0xffefc1).fillRect(245,202,219,76);
      panel.fillStyle(0x182847).fillRect(250,207,209,66);
      panel.lineStyle(3,COLORS.gold).strokeRect(248,205,213,70);

      const enemyRatio=Math.max(0,enemy.hp)/enemy.maxHp;
      const heroRatio=Math.max(0,this.playerHp)/this.playerMaxHp;
      const hpColor=ratio=>ratio>0.5?0x74a85e:(ratio>0.25?0xe6b85c:0xc94f4f);
      panel.fillStyle(0x3b4050).fillRect(86,65,137,10);
      panel.fillStyle(hpColor(enemyRatio)).fillRect(88,67,133*enemyRatio,6);
      panel.fillStyle(0x3b4050).fillRect(309,245,137,10);
      panel.fillStyle(hpColor(heroRatio)).fillRect(311,247,133*heroRatio,6);
      if (this.playerMaxMp) {
        const mpRatio=Math.max(0,this.playerMp)/this.playerMaxMp;
        panel.fillStyle(0x3b4050).fillRect(309,264,137,8);
        panel.fillStyle(0x678ed1).fillRect(311,266,133*mpRatio,4);
      }
      this.battleUi.push(panel);

      const enemySprite=this.add.sprite(359,130,enemy.type+"-side")
        .setDepth(82).setScrollFactor(0).setScale(4.8).setFlipX(true);
      const heroSprite=this.add.sprite(112,236,this.getHeroTexture("up"))
        .setDepth(82).setScrollFactor(0).setScale(5.2);
      this.battleEnemySprite=enemySprite;
      this.battleHeroSprite=heroSprite;
      this.battleUi.push(enemySprite,heroSprite);

      const style=(size,color="#fff7d6")=>({
        fontFamily:"Silkscreen, monospace",fontSize:size+"px",color
      });
      const foeName=this.add.text(31,34,enemy.name.toUpperCase(),style(15,"#ffd166"))
        .setDepth(83).setScrollFactor(0);
      const foeHp=this.add.text(31,61,"HP",style(12)).setDepth(83).setScrollFactor(0);
      const heroName=this.add.text(261,216,(this.save.className||"HERO").toUpperCase()+"  LV"+(this.save.level||1),style(15,"#ffd166"))
        .setDepth(83).setScrollFactor(0);
      const heroHp=this.add.text(261,239,"HP",style(11)).setDepth(83).setScrollFactor(0);
      const heroNumbers=this.add.text(447,239,this.playerHp+"/"+this.playerMaxHp,style(10))
        .setOrigin(1,0).setDepth(83).setScrollFactor(0);
      this.battleUi.push(foeName,foeHp,heroName,heroHp,heroNumbers);
      if (this.playerMaxMp) {
        const heroMp=this.add.text(261,258,"MP",style(11,"#9fc4ff")).setDepth(83).setScrollFactor(0);
        const mpNumbers=this.add.text(447,258,this.playerMp+"/"+this.playerMaxMp,style(10,"#9fc4ff"))
          .setOrigin(1,0).setDepth(83).setScrollFactor(0);
        this.battleUi.push(heroMp,mpNumbers);
      }

      const promptText=message || (this.battleMenu==="items"
        ? "Choose an item."
        : "What will "+(this.save.className||"the hero")+" do?");
      const prompt=this.add.text(25,330,this.wrap(promptText,24),style(15,message?"#ffb09f":"#fff7d6"))
        .setDepth(83).setScrollFactor(0);
      this.battleUi.push(prompt);

      const options=this.battleMenu==="items"
        ? ["DRAUGHT ×"+this.save.healingDraughts,"SMOKE ×"+this.save.smokeBombs,"BACK"]
        : ["ATTACK",this.getAbilityMenuLabel(),"ITEM","RUN"];
      const positions=this.battleMenu==="items"
        ? [[292,329],[292,361],[292,393]]
        : [[292,325],[292,348],[292,371],[292,394]];
      options.forEach((option,index)=>{
        const selected=index===this.battleIndex;
        const [x,y]=positions[index];
        const t=this.add.text(x,y,(selected?"▶ ":"  ")+option,style(
          this.battleMenu==="items"?13:11,selected?"#ffd166":"#b7d1b0"
        )).setDepth(83).setScrollFactor(0);
        this.battleUi.push(t);
      });
    }

    moveBattleCursor(direction) {
      const count=this.battleMenu==="items" ? 3 : 4;
      this.battleIndex=(this.battleIndex+direction+count)%count;
      this.renderBattleMenu();
    }

    chooseBattleAction() {
      if(this.battleResolving) return;
      if (this.battleMenu === "items") {
        if (this.battleIndex === 0) return this.useHealingDraught();
        if (this.battleIndex === 1) return this.useSmokeBomb();
        this.battleMenu="main"; this.battleIndex=2; this.renderBattleMenu();
        return;
      }
      if (this.battleIndex === 0) {
        const target=this.battleTarget;
        this.attackEnemy(target);
      } else if (this.battleIndex === 1) {
        this.useClassAbility();
      } else if (this.battleIndex === 2) {
        this.battleMenu="items"; this.battleIndex=0; this.renderBattleMenu();
      } else this.attemptRun(false);
    }

    getAbilityName() {
      return {
        Fighter:"2ND WIND", Ranger:"MARK", Rogue:"SNEAK ATTACK",
        Cleric:"HEALING LIGHT", Wizard:"MAGIC MISSILE"
      }[this.save.className] || "GUARD";
    }

    getAbilityMenuLabel() {
      const stats=this.getClassStats();
      if (stats.mp) return this.getAbilityName()+" "+stats.abilityCost+"MP";
      return this.getAbilityName()+" ×"+this.abilityUses;
    }

    spendAbilityUse() {
      const stats=this.getClassStats();
      if (stats.mp) {
        this.playerMp=Math.max(0,this.playerMp-stats.abilityCost);
        this.save.playerMp=this.playerMp;
        saveGame(this.save);
      } else {
        this.abilityUses--;
        this.battleTarget.abilityUses=this.abilityUses;
      }
    }

    useClassAbility() {
      const stats=this.getClassStats();
      if (stats.mp && this.playerMp < stats.abilityCost) {
        this.renderBattleMenu("NOT ENOUGH MP.");
        return;
      }
      if (!stats.mp && this.abilityUses <= 0) {
        this.renderBattleMenu("YOU HAVE NO ABILITY USES LEFT.");
        return;
      }
      const className=this.save.className || "Fighter";
      const target=this.battleTarget;

      if (className === "Fighter") {
        if (this.playerHp >= this.playerMaxHp) {
          this.renderBattleMenu("SECOND WIND IS NOT NEEDED AT FULL HEALTH.");
          return;
        }
        this.spendAbilityUse();
        this.playerHp=Math.min(this.playerMaxHp,this.playerHp+Math.ceil(this.playerMaxHp/2));
        this.save.playerHp=this.playerHp;
        saveGame(this.save);
        this.updateHud();
        this.battleEnemyTurn("Second Wind restores your health.");
        return;
      }

      if (className === "Cleric") {
        if (this.playerHp >= this.playerMaxHp) {
          this.renderBattleMenu("HEALING LIGHT FINDS NO WOUNDS.");
          return;
        }
        this.spendAbilityUse();
        this.playerHp=Math.min(this.playerMaxHp,this.playerHp+7+(stats.healing||0));
        this.save.playerHp=this.playerHp;
        saveGame(this.save);
        this.updateHud();
        this.battleEnemyTurn("Healing Light restores your health.");
        return;
      }

      this.spendAbilityUse();
      if (className === "Ranger") {
        target.marked=true;
        this.abilityStrike(target,4,true);
      } else if (className === "Rogue") {
        this.abilityStrike(target,this.getClassStats().damage*2,true);
      } else {
        this.magicMissile(target);
      }
    }

    magicMissile(enemy) {
      this.busy=true;
      this.battleResolving=true;
      const source=this.battleHeroSprite || this.hero;
      const target=this.battleEnemySprite || enemy.sprite;
      for(let bolt=0;bolt<3;bolt++) {
        const orb=this.add.circle(source.x+bolt*8-8,source.y-18,6,0xbda7ff)
          .setDepth(90).setScrollFactor(0);
        orb.setStrokeStyle(2,0xffefc1);
        this.tweens.add({
          targets:orb,
          x:target.x+(bolt-1)*7,
          y:target.y-10+(bolt%2)*8,
          duration:180,
          delay:bolt*95,
          ease:"Sine.easeIn",
          onComplete:()=>{
            orb.destroy();
            this.cameras.main.flash(45,170,130,255);
          }
        });
      }
      this.time.delayedCall(390,()=>{
        this.abilityStrike(enemy,12+(this.getClassStats().magic||0),true);
      });
    }

    abilityStrike(enemy,damage,enemyActs) {
      this.busy=true;
      if(this.mode==="battle") this.battleResolving=true;
      enemy.hp-=damage;
      this.cameras.main.flash(90,255,190,70);
      this.cameras.main.shake(100,0.009);
      const target=this.mode==="battle" ? this.battleEnemySprite : enemy.sprite;
      this.tweens.add({
        targets:target,alpha:0.15,duration:75,yoyo:true,
        onComplete:()=>{
          if(this.mode==="battle") {
            this.finishBattleStrike(enemy,enemyActs,this.getAbilityName()+" deals "+damage+" damage.");
            return;
          }
          this.busy=false;
          if(enemy.hp<=0) {
            this.removeDefeatedEnemy(enemy);
            if(!this.enemies.length) {
              this.onCombatCleared();
              return;
            }
          }
          if(enemyActs) this.enemyTurn();
          else this.updateHud();
        }
      });
    }

    useHealingDraught() {
      if (this.save.healingDraughts <= 0) {
        this.renderBattleMenu("YOUR PACK HOLDS NO HEALING DRAUGHTS.");
        return;
      }
      if (this.playerHp >= this.playerMaxHp) {
        this.renderBattleMenu("YOU ARE ALREADY AT FULL HEALTH.");
        return;
      }
      this.save.healingDraughts--;
      this.playerHp=Math.min(this.playerMaxHp,this.playerHp+8+(this.getClassStats().healing||0));
      this.save.playerHp=this.playerHp;
      saveGame(this.save);
      this.updateHud();
      this.battleEnemyTurn("You drink a healing draught.");
    }

    useSmokeBomb() {
      if (this.save.smokeBombs <= 0) {
        this.renderBattleMenu("YOU HAVE NO SMOKE BOMBS.");
        return;
      }
      if (this.battleTarget.id === "varkul") {
        this.renderBattleMenu("VARKUL SWEEPS THE SMOKE ASIDE.");
        return;
      }
      this.save.smokeBombs--;
      saveGame(this.save);
      this.attemptRun(true);
    }

    attemptRun(usingSmoke) {
      if (this.battleTarget.id === "varkul") {
        this.renderBattleMenu("THERE IS NO ESCAPE FROM THE COMMANDER.");
        return;
      }
      const backX=this.heroTile.x-this.facing.x;
      const backY=this.heroTile.y-this.facing.y;
      if (this.blocked.has(backX+","+backY)) {
        this.renderBattleMenu("YOUR RETREAT IS BLOCKED.");
        return;
      }
      this.clearBattleMenu(true);
      this.heroTile={x:backX,y:backY};
      this.hero.setPosition(backX*TILE+24,backY*TILE+12);
      if (!usingSmoke) {
        this.playerHp=Math.max(1,this.playerHp-1);
        this.save.playerHp=this.playerHp;
        saveGame(this.save);
      }
      this.updateHud();
    }

    beginRaid() {
      this.save.raidStarted = true;
      this.save.chapterStage = "raid";
      this.save.playerHp = this.getClassStats().hp;
      saveGame(this.save);
      this.openDialogue([
        "A horn screams from the eastern field.",
        "Goblins pour between the houses. Smoke rises above Dunmere.",
        "MARA: Take up your weapon! Protect the village!"
      ], () => this.buildRaid());
    }

    buildRaid() {
      this.prepareCombat("raid", 9, 11, "Defend Dunmere");
      const g=this.add.graphics(),T=TILE;
      for(let y=0;y<15;y++) for(let x=0;x<20;x++) {
        g.fillStyle((x+y)%2?0x5d784c:0x688654).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x405e3f,0.7).fillRect(x*T+9,y*T+30,17,3);
      }
      for(let y=1;y<14;y++) for(const x of [8,9,10]) {
        g.fillStyle((x+y)%2?0xa58a62:0xb99b6b).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x735f4b).fillEllipse(x*T+17,y*T+22,9,5);
      }
      const burningHouse=(x,y,w,color)=>{
        for(let yy=y;yy<y+3;yy++) for(let xx=x;xx<x+w;xx++) this.blocked.add(xx+","+yy);
        g.fillStyle(0x2d2930,0.4).fillRect(x*T+10,y*T+16,w*T,3*T);
        g.fillStyle(color).fillRect(x*T,(y+1)*T,w*T,2*T);
        g.fillStyle(0x493235).fillTriangle(x*T-10,(y+1)*T+8,(x+w/2)*T,y*T-15,(x+w)*T+10,(y+1)*T+8);
        for(let i=0;i<3;i++) {
          g.fillStyle(i===0?0xd9503f:(i===1?0xf28b45:0xffd166),0.9);
          g.fillTriangle((x+1)*T+i*22,(y+1)*T+12,(x+1)*T+15+i*22,y*T-12,(x+1)*T+29+i*22,(y+1)*T+12);
        }
      };
      burningHouse(2,1,5,0x95664c);
      burningHouse(13,1,5,0xa57c55);
      burningHouse(14,10,4,0x8b674e);
      // Battle damage: rolling smoke, ash, shattered fences, arrows and glowing embers.
      [[4,2,44],[15,2,52],[16,11,39]].forEach(([x,y,size])=>{
        g.fillStyle(0x242936,0.32).fillCircle(x*T,y*T,size);
        g.fillStyle(0x4d4850,0.28).fillCircle(x*T+24,y*T-31,size*0.72);
        g.fillStyle(0x73706b,0.18).fillCircle(x*T-13,y*T-59,size*0.48);
      });
      [[7,5],[12,5],[4,9],[16,8]].forEach(([x,y])=>{
        g.fillStyle(0x5a382f).fillRect(x*T+5,y*T+25,T-10,7);
        g.fillStyle(0x8b573b).fillTriangle(x*T+3,y*T+27,x*T+24,y*T+7,x*T+44,y*T+27);
        g.fillStyle(0xd9553f).fillCircle(x*T+12,y*T+14,4);
        g.fillStyle(0xffb84d).fillCircle(x*T+29,y*T+10,3);
      });
      for(const [x,y] of [[7,7],[11,6],[12,11],[5,12],[16,6]]) {
        g.lineStyle(3,0x302a2c).lineBetween(x*T+6,y*T+36,x*T+38,y*T+8);
        g.fillStyle(0xb7bdad).fillTriangle(x*T+34,y*T+8,x*T+43,y*T+3,x*T+39,y*T+13);
      }
      g.lineStyle(5,0x704536);
      g.lineBetween(3*T,7*T,7*T,7*T+19);
      g.lineBetween(13*T,12*T,18*T,12*T-14);
      for(let x=3;x<8;x++) g.fillStyle(0x8b6042).fillRect(x*T,7*T-8,5,33);
      for(let x=13;x<19;x++) g.fillStyle(0x8b6042).fillRect(x*T,12*T-25,5,33);

      this.addBoundaries();
      [[5,6],[15,6],[6,10],[13,9]].forEach(([x,y],i)=>this.spawnEnemy("raid-"+i,"goblin",x,y,7,2,"Ashfang Goblin"));
      this.createCombatHero();
      this.openDialogue(["Defend Dunmere! Face an enemy and press Z to attack."]);
    }

    buildRoad() {
      this.prepareCombat("road", 2, 12, "Follow the raiders");
      this.save.chapterStage="road"; this.save.playerHp=this.getClassStats().hp; saveGame(this.save);
      this.playerHp=this.playerMaxHp;
      const g=this.add.graphics(),T=TILE;
      for(let y=0;y<15;y++) for(let x=0;x<20;x++) {
        g.fillStyle((x*3+y)%2?0x3e6746:0x47734b).fillRect(x*T,y*T,T,T);
        if((x*11+y*7)%5===0) g.fillStyle(0x6f9258).fillRect(x*T+11,y*T+14,4,18);
      }
      for(let x=1;x<19;x++) for(let y=6;y<10;y++) {
        g.fillStyle((x+y)%2?0x917452:0xa4865d).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x665744).fillEllipse(x*T+29,y*T+31,10,6);
      }
      for(const [x,y] of [[2,2],[5,3],[8,1],[12,3],[16,2],[18,5],[3,11],[7,12],[12,12],[17,11]]) {
        this.blocked.add(x+","+y);
        g.fillStyle(0x4a342f).fillRect(x*T+20,y*T+21,9,27);
        g.fillStyle(0x233f36).fillCircle(x*T+24,y*T+17,31);
        g.fillStyle(0x3f7049).fillCircle(x*T+13,y*T+18,19).fillCircle(x*T+37,y*T+20,20);
        g.fillStyle(0x6f9b5a).fillCircle(x*T+22,y*T+7,13);
      }
      // Dense coastwood undergrowth, exposed roots, mushrooms and low drifting mist.
      for(let x=1;x<19;x+=2) {
        g.fillStyle(0x183a32,0.12).fillCircle(x*T+24,2*T+8,84+(x%3)*18);
      }
      [[4,5],[9,3],[14,4],[6,11],[15,11]].forEach(([x,y])=>{
        g.fillStyle(0x315f43).fillTriangle(x*T,y*T+39,x*T+9,y*T+8,x*T+17,y*T+39);
        g.fillStyle(0x4d8250).fillTriangle(x*T+15,y*T+39,x*T+27,y*T+3,x*T+37,y*T+39);
        g.fillStyle(0x76a35e).fillTriangle(x*T+29,y*T+39,x*T+39,y*T+13,x*T+46,y*T+39);
      });
      [[6,4],[13,5],[5,10],[15,10]].forEach(([x,y])=>{
        g.fillStyle(0xe8d9b0).fillRect(x*T+12,y*T+30,3,8).fillRect(x*T+29,y*T+33,3,6);
        g.fillStyle(0xb64f4f).fillCircle(x*T+13,y*T+29,7).fillCircle(x*T+30,y*T+32,6);
        g.fillStyle(0xffefc1).fillRect(x*T+10,y*T+26,2,2).fillRect(x*T+28,y*T+29,2,2);
      });
      g.fillStyle(0x4b362e).fillRect(2*T+8,5*T+28,5*T-16,18);
      g.fillStyle(0x79543a).fillRect(2*T+13,5*T+24,5*T-26,8);
      for(let i=0;i<5;i++) g.fillStyle(0x263c34).fillRect((2+i)*T+20,5*T+37,25,3);
      for(let x=2;x<18;x+=3) {
        g.fillStyle(0xc5d4c4,0.08).fillEllipse(x*T+24,9*T+20,3*T,35);
      }
      for(const [x,y] of [[4,7],[9,10],[14,6],[17,9]]) {
        g.lineStyle(4,0x4a342f).arc(x*T+24,y*T+24,24,3.2,6.1);
        g.lineStyle(2,0x7a6347).arc(x*T+24,y*T+24,15,3.2,6.1);
      }

      // Ashfang trail markers and abandoned supplies.
      g.fillStyle(0x382d2c).fillRect(10*T+8,5*T+22,2*T-16,19);
      g.fillStyle(0xa36c42).fillRect(10*T+14,5*T+15,2*T-28,22);
      g.fillStyle(0x1f2932).fillTriangle(14*T,5*T,14*T+27,5*T+18,14*T,5*T+34);
      this.addBoundaries();
      [[7,8],[12,7]].forEach(([x,y],i)=>this.spawnEnemy("road-"+i,"goblin",x,y,8,2,"Goblin Scout"));
      this.spawnEnemy("road-orc","orc",16,8,12,3,"Ashfang Orc");
      this.createCombatHero();
      this.openDialogue([
        "You follow black-fletched arrows into the old coastwood.",
        "Beyond the trees, the ruined towers of Greywatch Castle rise through the mist."
      ]);
    }

    buildCastle() {
      if (!Array.isArray(this.save.clearedRooms)) this.save.clearedRooms=[];
      if (typeof this.save.dungeonRoom !== "number") {
        this.save.dungeonRoom=0;
        this.save.playerHp=this.getClassStats().hp;
      }
      this.save.chapterStage="castle";
      saveGame(this.save);
      this.buildDungeonRoom(this.save.dungeonRoom,"south");
    }

    buildDungeonRoom(index, entry="south") {
      const rooms=[
        {name:"THE SHATTERED GATEHOUSE",floor:0x5b6061,accent:0x8a7357,intro:"Broken murder holes overlook the gate. Ashfang sentries guard the way deeper."},
        {name:"THE ASHFANG BARRACKS",floor:0x615b57,accent:0x8b4f3d,intro:"Rotted bunks have been claimed by the war band. Crude shields hang from every post."},
        {name:"CHAPEL OF THE LOST FLAME",floor:0x555b61,accent:0x76558f,intro:"A roofless chapel remembers an older faith. Colored light falls across shattered pews."},
        {name:"THE FLOODED UNDERCROFT",floor:0x46595c,accent:0x477b9d,intro:"Black water fills the undercroft. A narrow stone causeway crosses the drowned floor."},
        {name:"THE IRON CELLS",floor:0x52575b,accent:0x6b7475,intro:"Rusting cages line the prison. The missing caravan drivers were held here."},
        {name:"THE RUINED ARMORY",floor:0x5f5d58,accent:0xa84b4b,intro:"Weapon racks and smashed crates fill the old armory. The Ashfangs armed themselves here."},
        {name:"THE GREAT KITCHEN",floor:0x665c50,accent:0xc99157,intro:"Cold ovens, butcher blocks, and hanging iron turn the castle kitchen into a grim camp."},
        {name:"THE CINDER ARCHIVE",floor:0x4c4b56,accent:0x76558f,intro:"Scorched bookshelves surround a violet ritual circle. Malrec's influence is unmistakable."},
        {name:"THE WAR ROOM",floor:0x59575b,accent:0xa84b4b,intro:"A map of the Lantern Coast covers the command table. Every nearby settlement is marked."},
        {name:"THE ASHFANG THRONE",floor:0x4a4e55,accent:0xe6b85c,intro:"Commander Varkul waits beneath stolen banners, Malrec's violet seal hanging at his throat."}
      ];
      const room=rooms[index] || rooms[0];
      const heroX=9, heroY=entry==="north"?2:12;
      this.prepareCombat("dungeon",heroX,heroY,"Clear "+room.name);
      this.dungeonRoom=index;
      this.save.dungeonRoom=index;
      this.save.chapterStage="castle";
      saveGame(this.save);

      const g=this.add.graphics(),T=TILE;
      const block=(x,y,w=1,h=1)=>{
        for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) this.blocked.add(xx+","+yy);
      };
      const stone=(x,y,w=1,h=1,color=0x3c4247)=>{
        block(x,y,w,h);
        g.fillStyle(0x222831,0.45).fillRect(x*T+8,y*T+10,w*T,h*T);
        g.fillStyle(color).fillRect(x*T,y*T,w*T,h*T);
        for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) {
          g.lineStyle(3,0x707570,0.75).strokeRect(xx*T+3,yy*T+3,T-6,T-6);
          g.fillStyle(0x292f35,0.55).fillRect(xx*T+8,yy*T+31,29,4);
        }
      };
      const wood=(x,y,w=1,h=1)=>{
        block(x,y,w,h);
        g.fillStyle(0x2b2528).fillRect(x*T+5,y*T+8,w*T-10,h*T-8);
        g.fillStyle(0x744733).fillRect(x*T+9,y*T+4,w*T-18,h*T-12);
        g.lineStyle(3,0xa06a45).strokeRect(x*T+10,y*T+6,w*T-20,h*T-16);
      };
      const torch=(x,y)=>{
        g.fillStyle(0xe6b85c,0.17).fillCircle(x*T+24,y*T+18,38);
        g.fillStyle(0x392c2d).fillRect(x*T+21,y*T+19,6,27);
        g.fillStyle(0xd9553f).fillTriangle(x*T+15,y*T+20,x*T+24,y*T-4,x*T+33,y*T+20);
        g.fillStyle(0xffd166).fillTriangle(x*T+19,y*T+17,x*T+24,y*T+2,x*T+29,y*T+17);
      };

      // Uneven flagstones, cracks, moss and age-darkened grout.
      for(let y=0;y<15;y++) for(let x=0;x<20;x++) {
        const shade=(x*13+y*7)%3;
        g.fillStyle(shade===0?room.floor:(shade===1?Phaser.Display.Color.IntegerToColor(room.floor).darken(6).color:Phaser.Display.Color.IntegerToColor(room.floor).lighten(5).color))
          .fillRect(x*T,y*T,T,T);
        g.lineStyle(2,0x31363b,0.72).strokeRect(x*T,y*T,T,T);
        if((x*11+y*17)%9===0) {
          g.lineStyle(2,0x252b31,0.75);
          g.lineBetween(x*T+7,y*T+9,x*T+24,y*T+22);
          g.lineBetween(x*T+24,y*T+22,x*T+17,y*T+39);
        }
        if((x*5+y*3)%13===0) g.fillStyle(0x455d46,0.55).fillRect(x*T+5,y*T+39,22,4);
      }

      // Massive perimeter masonry with paired door thresholds.
      for(let x=0;x<20;x++){stone(x,0);stone(x,14);}
      for(let y=1;y<14;y++){stone(0,y);stone(19,y);}
      for(const doorX of [9,10]) {
        this.blocked.delete(doorX+",0");
        this.blocked.delete(doorX+",14");
        g.fillStyle(0x171d25).fillRect(doorX*T,0,T,T);
        g.fillStyle(0x171d25).fillRect(doorX*T,14*T,T,T);
        g.fillStyle(room.accent).fillRect(doorX*T+5,T-8,T-10,6);
        g.fillStyle(room.accent).fillRect(doorX*T+5,14*T,T-10,6);
      }
      if(index===0) { block(9,14,2,1); g.fillStyle(0x343b42).fillRect(9*T,14*T,2*T,T); }
      if(index===9) { block(9,0,2,1); g.fillStyle(0x343b42).fillRect(9*T,0,2*T,T); }
      torch(1,3);torch(18,3);torch(1,11);torch(18,11);

      // Greywatch atmosphere: vaulted door arches, drainage channels, webs, dust and rubble.
      g.fillStyle(0x151b23,0.28).fillRect(T, T,18*T,18);
      g.fillStyle(0x88908a,0.25).fillRect(T,T+18,18*T,4);
      for(const doorY of [0,14]) {
        g.lineStyle(7,0x747a75).arc(10*T,doorY*T+(doorY===0?T:0),T+14,Math.PI,Math.PI*2);
        g.lineStyle(3,0x333940).arc(10*T,doorY*T+(doorY===0?T:0),T-1,Math.PI,Math.PI*2);
      }
      g.fillStyle(0x232a31,0.65).fillRect(2*T,13*T+35,16*T,7);
      g.fillStyle(0x65716c,0.45).fillRect(2*T,13*T+36,16*T,2);
      [[2,2],[17,2],[2,12],[17,12]].forEach(([x,y])=>{
        g.lineStyle(2,0xb5b6aa,0.48).lineBetween(x*T,y*T,x*T+31,y*T+24);
        g.lineBetween(x*T,y*T+13,x*T+31,y*T+24);
        g.lineBetween(x*T+15,y*T,x*T+31,y*T+24);
        g.lineStyle(1,0xb5b6aa,0.35).arc(x*T,y*T,37,0,1.5);
      });
      for(const [x,y] of [[2,7],[5,2],[14,12],[17,8]]) {
        g.fillStyle(0x31383d).fillCircle(x*T+24,y*T+29,15);
        g.fillStyle(0x6e716b).fillRect(x*T+12,y*T+25,27,10);
        g.fillStyle(0x929084).fillRect(x*T+19,y*T+18,15,8);
      }
      for(let i=0;i<18;i++) {
        const x=(i*137+index*41)%(18*T)+T;
        const y=(i*83+index*29)%(12*T)+T;
        g.fillStyle(0xd8d3bb,0.16).fillRect(x,y,3,3);
      }
      [[3,5],[16,5],[3,10],[16,10]].forEach(([x,y])=>{
        g.fillStyle(room.accent,0.12).fillCircle(x*T+24,y*T+18,46);
      });

      // Ten room-specific prop and collision layouts.
      if(index===0) {
        stone(3,4,3,2,0x4b5052);stone(14,4,3,2,0x4b5052);
        for(let x=4;x<16;x+=2){g.fillStyle(0x252c33).fillRect(x*T+19,2*T,8,2*T);g.fillStyle(0x778087).fillTriangle(x*T+15,2*T,x*T+31,2*T,x*T+23,2*T-18);}
        [[4,10],[15,10]].forEach(([x,y])=>{block(x,y);g.fillStyle(0x56595a).fillCircle(x*T+24,y*T+28,25);g.fillStyle(0x828077).fillRect(x*T+7,y*T+23,34,14);});
      } else if(index===1) {
        [[2,3],[2,6],[2,9],[15,3],[15,6],[15,9]].forEach(([x,y])=>{wood(x,y,3,1);g.fillStyle(0x9a8769).fillRect(x*T+13,y*T+10,29,T-20);g.fillStyle(0x7b3f43).fillRect(x*T+45,y*T+10,2*T-57,T-20);});
        g.fillStyle(room.accent).fillRect(7*T+8,5*T,6*T-16,5*T);g.lineStyle(6,0x343039).strokeRect(7*T+8,5*T,6*T-16,5*T);
      } else if(index===2) {
        for(const y of [5,8,11]){wood(4,y,4,1);wood(12,y,4,1);}
        stone(8,2,4,2,0x56565f);
        g.fillStyle(0xe5d290,0.23).fillTriangle(7*T,0,13*T,0,11*T,10*T);
        g.fillStyle(0x76558f).fillCircle(10*T,3*T,23);g.fillStyle(0xffd166).fillCircle(10*T,3*T,9);
      } else if(index===3) {
        for(let y=2;y<13;y++) for(const x of [2,3,4,15,16,17]) {
          block(x,y);g.fillStyle((x+y)%2?0x2d5e70:0x316b7c).fillRect(x*T,y*T,T,T);
          g.fillStyle(0x8dc7be,0.5).fillRect(x*T+7,y*T+17,27,3);
        }
        stone(6,5,2,2,0x51595b);stone(12,8,2,2,0x51595b);
        for(let y=1;y<14;y++) g.fillStyle(0xa49b7f).fillRect(9*T+8,y*T,2*T-16,T);
      } else if(index===4) {
        for(const x of [2,6,14,18]) g.fillStyle(0x7d8584).fillRect(x*T,2*T,5,10*T);
        for(const y of [3,7,11]) {
          g.fillStyle(0x2a3036).fillRect(T,y*T,6*T,T);g.fillRect(13*T,y*T,6*T,T);
          for(let x=1;x<7;x++){block(x,y);g.fillStyle(0x858c89).fillRect(x*T+9,y*T,4,T);}
          for(let x=13;x<19;x++){block(x,y);g.fillStyle(0x858c89).fillRect(x*T+9,y*T,4,T);}
        }
        g.fillStyle(0xb7aa83).fillRect(8*T+8,7*T+11,4*T-16,28);
      } else if(index===5) {
        [[2,3],[2,8],[15,3],[15,8]].forEach(([x,y])=>wood(x,y,3,2));
        [[7,4],[12,4],[7,9],[12,9]].forEach(([x,y])=>{block(x,y);g.fillStyle(0x353b42).fillRect(x*T+8,y*T+6,T-16,T-12);g.fillStyle(0xb7bdad).fillTriangle(x*T+12,y*T+35,x*T+24,y*T+2,x*T+36,y*T+35);});
        g.fillStyle(0xa84b4b).fillRect(9*T,2*T,2*T,3*T);g.fillStyle(0xe6b85c).fillCircle(10*T,3*T,18);
      } else if(index===6) {
        stone(2,3,4,3,0x4c4945);stone(14,3,4,3,0x4c4945);
        g.fillStyle(0x1e252b).fillRect(2*T+17,4*T,3*T-34,T);g.fillStyle(0xd9553f).fillRect(2*T+25,5*T-18,3*T-50,8);
        wood(6,7,8,2);
        for(let x=7;x<14;x+=2){g.fillStyle(0xd7c08d).fillEllipse(x*T+24,7*T+24,25,13);g.fillStyle(0x9c493f).fillEllipse(x*T+24,8*T+11,19,10);}
        [[4,10],[15,10]].forEach(([x,y])=>{block(x,y);g.fillStyle(0x815037).fillEllipse(x*T+24,y*T+26,42,46);g.fillStyle(0x30363d).fillRect(x*T+5,y*T+16,T-10,5);});
      } else if(index===7) {
        [[2,2],[2,6],[2,10],[16,2],[16,6],[16,10]].forEach(([x,y])=>{wood(x,y,2,3);for(let r=0;r<3;r++){g.fillStyle(r%2?0x76558f:0xa84b4b).fillRect(x*T+13,(y+r)*T+11,9,27);g.fillStyle(0x477b9d).fillRect(x*T+27,(y+r)*T+15,8,23);}});
        g.lineStyle(7,0x76558f,0.8).strokeCircle(10*T,7*T+24,82);
        g.lineStyle(3,0xd3a8f0).strokeCircle(10*T,7*T+24,52);
        for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillStyle(0xe1c6f2).fillCircle(10*T+Math.cos(a)*66,7*T+24+Math.sin(a)*66,5);}
      } else if(index===8) {
        wood(5,5,10,4);
        g.fillStyle(0xc6ad78).fillRect(5*T+16,5*T+15,10*T-32,4*T-30);
        g.lineStyle(4,0x477b9d).lineBetween(6*T,6*T,13*T,8*T);
        g.lineStyle(4,0xa84b4b).lineBetween(7*T,8*T,14*T,6*T);
        [[3,3],[16,3],[3,11],[16,11]].forEach(([x,y])=>{block(x,y);g.fillStyle(0x704536).fillRect(x*T+9,y*T+7,T-18,T-7);g.fillStyle(0x303640).fillCircle(x*T+24,y*T+19,13);});
        g.fillStyle(0xa84b4b).fillRect(7*T,T,2*T,3*T);g.fillStyle(0x26334d).fillRect(11*T,T,2*T,3*T);
      } else {
        stone(6,1,8,3,0x363b42);
        g.fillStyle(0x8f343c).fillRect(7*T+8,T,2*T-16,3*T);
        g.fillStyle(0x8f343c).fillRect(11*T+8,T,2*T-16,3*T);
        g.fillStyle(0xe6b85c).fillTriangle(8*T,3*T,9*T,1*T,10*T,3*T);
        [[4,6],[15,6],[4,11],[15,11]].forEach(([x,y])=>{stone(x,y,1,1,0x555b60);g.fillStyle(0xd9553f).fillTriangle(x*T+8,y*T,x*T+24,y*T-35,x*T+40,y*T);g.fillStyle(0xffd166).fillTriangle(x*T+16,y*T-3,x*T+24,y*T-25,x*T+32,y*T-3);});
        g.fillStyle(0x6f2630).fillRect(6*T+8,9*T,8*T-16,2*T);
        g.lineStyle(5,0xe6b85c).strokeRect(6*T+14,9*T+6,8*T-28,2*T-12);
      }

      // Treasure is persistent and distributed across Greywatch.
      const genericLoot=["watch_blade","quilted_jack","saint_token","marsh_boots","jailer_ring","tempered_hatchet","hearth_charm","scribe_lens","captain_mantle",null];
      const genericItem=genericLoot[index];
      if(genericItem) this.spawnLoot(genericItem,10,11);
      const classTreasures={
        Fighter:{room:1,id:"greywatch_buckler"},
        Ranger:{room:3,id:"hawk_quiver"},
        Rogue:{room:4,id:"nightglass_dirk"},
        Cleric:{room:6,id:"dawn_reliquary"},
        Wizard:{room:7,id:"violet_spellshard"}
      };
      const classTreasure=classTreasures[this.save.className];
      if(classTreasure && classTreasure.room===index) this.spawnLoot(classTreasure.id,10,2);

      const cleared=this.save.clearedRooms.includes(index);
      if(!cleared) {
        const encounters=[
          [["goblin",6,7,8,2],["goblin",13,7,8,2]],
          [["goblin",7,5,9,2],["goblin",12,10,9,2]],
          [["orc",10,6,14,3]],
          [["goblin",8,6,10,2],["goblin",11,9,10,2]],
          [["orc",10,6,15,3],["goblin",10,10,10,2]],
          [["orc",7,7,16,3],["orc",13,7,16,3]],
          [["goblin",7,5,11,2],["goblin",13,10,11,2]],
          [["orc",10,5,17,3],["goblin",10,10,12,2]],
          [["orc",7,11,18,4],["orc",13,11,18,4]],
          [["orc",6,8,18,4],["orc",14,8,18,4],["hobgoblin",10,4,30,5]]
        ][index];
        encounters.forEach(([type,x,y,hp,damage],i)=>{
          const id=index===9&&type==="hobgoblin"?"varkul":"room-"+index+"-"+i;
          const name=id==="varkul"?"Commander Varkul":(type==="orc"?"Ashfang Reaver":"Ashfang Goblin");
          this.spawnEnemy(id,type,x,y,hp,damage,name);
        });
      }

      this.createCombatHero();
      const roomLabel=this.add.text(18,18,(index+1)+"/10  "+room.name,{
        fontFamily:"Silkscreen, monospace",fontSize:"14px",color:"#ffefc1",
        backgroundColor:"#182847",padding:{x:8,y:5}
      }).setDepth(72).setScrollFactor(0);
      if(!cleared) this.openDialogue([room.intro,index<9?"Defeat the guards, then take the northern passage.":"Defeat Varkul and end the Ashfang raid."]);
    }

    onCombatCleared() {
      this.save.playerHp=this.playerMaxHp;
      if(this.area==="raid") {
        this.save.raidCleared=true; saveGame(this.save);
        this.openDialogue([
          "The last goblin falls. Dunmere still stands.",
          "NELL: They fled toward Greywatch. They took prisoners and supplies.",
          "You leave at once, following the Ashfang trail."
        ],()=>this.buildRoad());
      } else if(this.area==="road") {
        this.save.roadCleared=true; saveGame(this.save);
        this.openDialogue([
          "The final scout is defeated.",
          "Through the trees, Greywatch's shattered gate stands open.",
          "You tighten your grip and enter the abandoned castle."
        ],()=>this.buildCastle());
      } else if(this.area==="dungeon") {
        if(!Array.isArray(this.save.clearedRooms)) this.save.clearedRooms=[];
        if(!this.save.clearedRooms.includes(this.dungeonRoom)) this.save.clearedRooms.push(this.dungeonRoom);
        this.save.dungeonRoom=this.dungeonRoom;
        this.save.playerHp=this.playerHp;
        saveGame(this.save);
        if(this.dungeonRoom===9) {
          this.save.gameComplete=true; this.save.chapterStage="complete"; saveGame(this.save);
          this.showEnding();
        } else {
          this.openDialogue([
            "The room falls silent.",
            "The northern passage is now clear.",
            "Greywatch continues deeper into the rock."
          ]);
        }
      }
    }

    restartCombatArea() {
      this.save.playerHp=this.getClassStats().hp; saveGame(this.save);
      if(this.area==="raid") this.buildRaid();
      else if(this.area==="road") this.buildRoad();
      else if(this.area==="dungeon") this.buildDungeonRoom(this.dungeonRoom,"south");
      else this.buildCastle();
    }

    showEnding() {
      this.clearScene();
      this.mode="ending";
      this.cameras.main.setBackgroundColor(0x182847);
      const g=this.add.graphics();
      g.fillStyle(0x182847).fillRect(0,0,WIDTH,HEIGHT);
      g.fillStyle(0x26334d).fillCircle(240,145,118);
      g.fillStyle(0xe6b85c,0.3).fillCircle(240,145,82);
      g.fillStyle(0xffefc1).fillCircle(240,145,42);
      g.fillStyle(0x76558f).fillTriangle(210,215,240,105,270,215);
      this.text(80,20,"DUNMERE IS SAVED",10,"#ffd166",0.5);
      this.text(80,92,"THE WIZARD'S SHADOW",8,"#ffefc1",0.5);
      this.text(80,108,"CHAPTER ONE COMPLETE",6,"#b7d1b0",0.5);
      this.text(80,126,"Z: RETURN TO TITLE",5,"#ffd166",0.5);
      this.openDialogue([
        "Varkul falls. In his war chest you find orders sealed in violet wax.",
        "The Ashfangs served a wizard called Malrec, who is gathering armies to conquer the Lantern Coast.",
        "You return to Dunmere as its defender—but your first adventure has only revealed a greater threat."
      ]);
    }

    pressed(...keys) {
      return keys.some(k => Phaser.Input.Keyboard.JustDown(k));
    }

    update() {
      if (this.mode === "title") {
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.startGame();
        if (this.pressed(this.keys.r) && this.save.className) {
          localStorage.removeItem(SAVE_KEY);
          this.save = {};
          this.showTitle();
        }
        return;
      }

      if (this.mode === "battle") {
        if(this.battleResolving) return;
        if (this.pressed(this.keys.up, this.keys.w)) this.moveBattleCursor(-1);
        else if (this.pressed(this.keys.down, this.keys.s)) this.moveBattleCursor(1);
        else if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.chooseBattleAction();
        else if (this.pressed(this.keys.x, this.keys.esc)) {
          if (this.battleMenu === "items") {
            this.battleMenu="main"; this.battleIndex=2; this.renderBattleMenu();
          } else this.attemptRun(false);
        }
        return;
      }

      if (this.mode === "inventory") {
        if (this.pressed(this.keys.up, this.keys.w)) this.moveInventoryCursor(-1);
        else if (this.pressed(this.keys.down, this.keys.s)) this.moveInventoryCursor(1);
        else if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.toggleEquipment();
        else if (this.pressed(this.keys.x, this.keys.esc, this.keys.i)) this.closeInventoryMenu();
        return;
      }

      if (this.mode === "choice") {
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.acceptClass();
        else if (this.pressed(this.keys.x, this.keys.esc)) this.clearChoice();
        return;
      }

      if (this.dialogue) {
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.advanceDialogue();
        return;
      }

      if (this.mode === "ending") {
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.showTitle();
        return;
      }

      if (this.mode !== "world") return;
      if (this.pressed(this.keys.i)) {
        this.openInventoryMenu();
        return;
      }
      if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) {
        if (this.enemies && this.enemies.length && this.combatTalk()) return;
        return this.talk();
      }
      if (this.pressed(this.keys.left, this.keys.a)) return this.tryMove(-1, 0);
      if (this.pressed(this.keys.right, this.keys.d)) return this.tryMove(1, 0);
      if (this.pressed(this.keys.up, this.keys.w)) return this.tryMove(0, -1);
      if (this.pressed(this.keys.down, this.keys.s)) return this.tryMove(0, 1);
    }
  }

  document.fonts.ready.then(() => new Phaser.Game({
    type: Phaser.AUTO,
    resolution: Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 3),
    antialias: false,
    antialiasGL: false,
    powerPreference: "high-performance",
    width: WIDTH,
    height: HEIGHT,
    parent: "game",
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#182847",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      autoRound: true
    },
    scene: [LostLightScene]
  }));
})();
