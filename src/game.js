(() => {
  "use strict";

  const WIDTH = 480;
  const HEIGHT = 432;
  const TITLE_WIDTH = 960;
  const TITLE_HEIGHT = 864;
  const TILE = 48;
  const MAP_WIDTH = 20 * TILE;
  const MAP_HEIGHT = 15 * TILE;
  const LEGACY_SAVE_KEY = "lost-light-save-v1";
  const SAVE_PREFIX = "lost-light-save-v1-slot-";
  const ACTIVE_SLOT_KEY = "lost-light-active-slot";
  const SAVE_SLOT_COUNT = 3;

  const clampSlot = value => Math.max(1, Math.min(SAVE_SLOT_COUNT, Number(value) || 1));
  let activeSaveSlot = clampSlot(localStorage.getItem(ACTIVE_SLOT_KEY));
  const saveKey = slot => SAVE_PREFIX + clampSlot(slot);

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
    marsh_boots: { name:"Marshwalker Boots", slot:"boots", hp:1, description:"+1 maximum HP. Keeps steady footing in flooded stonework." },
    jailer_ring: { name:"Jailer's Iron Ring", slot:"trinket", armor:1, description:"+1 armor. Heavy iron engraved with Greywatch's crest." },
    tempered_hatchet: { name:"Tempered Hatchet", slot:"weapon", damage:1, description:"+1 damage. The finest surviving weapon in the armory." },
    hearth_charm: { name:"Hearthkeeper Charm", slot:"trinket", healing:1, description:"+1 healing from draughts and healing abilities." },
    scribe_lens: { name:"Runed Scribe Lens", slot:"trinket", mp:1, description:"+1 maximum MP. The glass still holds a trace of old magic." },
    captain_mantle: { name:"Captain's Mantle", slot:"cloak", hp:2, description:"+2 maximum HP. A weathered cloak from the war room." },
    greywatch_buckler: { name:"Greywatch Buckler", slot:"shield", className:"Fighter", armor:1, hp:1, unique:true, description:"Fighter only. +1 armor and +1 maximum HP." },
    hawk_quiver: { name:"Hawkfeather Quiver", slot:"cloak", className:"Ranger", damage:1, unique:true, description:"Ranger only. +1 damage with every attack." },
    nightglass_dirk: { name:"Nightglass Dirk", slot:"weapon", className:"Rogue", damage:1, unique:true, description:"Rogue only. +1 damage, including Sneak Attack scaling." },
    dawn_reliquary: { name:"Reliquary of Dawn", slot:"trinket", className:"Cleric", mp:2, healing:1, unique:true, description:"Cleric only. +2 maximum MP and +1 healing." },
    violet_spellshard: { name:"Violet Spellshard", slot:"trinket", className:"Wizard", mp:2, magic:1, unique:true, description:"Wizard only. +2 maximum MP and +1 Magic Missile damage." },
    blackpine_sabre: { name:"Blackpine Sabre", slot:"weapon", damage:1, description:"+1 damage. A balanced blade carried by the northern wardens." },
    warded_coat: { name:"Warded Coat", slot:"armor", hp:3, description:"+3 maximum HP. Silver thread turns aside glancing blows." },
    pilgrim_boots: { name:"Pilgrim Boots", slot:"boots", armor:1, description:"+1 armor. Moonfall leather reinforced with iron." },
    mirror_shield: { name:"Mirror Shield", slot:"shield", armor:1, mp:1, description:"+1 armor and +1 MP. Its face reflects hostile sorcery." },
    raven_cloak: { name:"Raven Cloak", slot:"cloak", hp:2, description:"+2 maximum HP. Black feathers soften every fall." },
    ember_maul: { name:"Ember Maul", slot:"weapon", damage:2, description:"+2 damage. Forged in the furnaces beneath Emberdeep." },
    rune_mail: { name:"Runed Mail", slot:"armor", armor:1, hp:2, description:"+1 armor and +2 maximum HP." },
    starstep_boots: { name:"Starstep Boots", slot:"boots", hp:2, mp:1, description:"+2 maximum HP and +1 MP." },
    spellguard_shield: { name:"Spellguard Shield", slot:"shield", armor:1, mp:2, description:"+1 armor and +2 maximum MP." },
    sapphire_focus: { name:"Sapphire Focus", slot:"trinket", mp:3, description:"+3 maximum MP. Cold light circles the stone." },
    shadow_mantle: { name:"Shadow Mantle", slot:"cloak", damage:1, description:"+1 damage. It moves a heartbeat behind its wearer." },
    lionguard_shield: { name:"Lionguard Shield", slot:"shield", className:"Fighter", armor:2, unique:true, description:"Fighter only. +2 armor." },
    storm_quiver: { name:"Storm Quiver", slot:"cloak", className:"Ranger", damage:2, unique:true, description:"Ranger only. +2 damage." },
    duskfang: { name:"Duskfang", slot:"weapon", className:"Rogue", damage:2, unique:true, description:"Rogue only. +2 damage." },
    solar_icon: { name:"Solar Icon", slot:"trinket", className:"Cleric", mp:3, healing:2, unique:true, description:"Cleric only. +3 MP and +2 healing." },
    malrec_grimoire: { name:"Malrec\'s Grimoire", slot:"trinket", className:"Wizard", mp:4, magic:2, unique:true, description:"Wizard only. +4 MP and +2 magic damage." }
  };

  const VALUABLES = {
    amber_bead: { name:"Amber Trade Bead", value:8, description:"Warm coastal amber, useful to merchants and collectors." },
    silver_clasp: { name:"Silver Cloak Clasp", value:14, description:"A chased silver clasp taken from an Ashfang supply pouch." },
    moonstone_chip: { name:"Moonstone Chip", value:22, description:"A pale blue gemstone fragment that glows softly at dusk." },
    old_relic: { name:"Greywatch Relic", value:35, description:"A small pre-ruin keepsake bearing Greywatch's faded crest." }
  };

  const RANDOM_LOOT_TABLE = [
    { max:35, type:"gold", name:"coins", min:4, maxAmount:12 },
    { max:50, type:"healing", name:"healing draught" },
    { max:58, type:"smoke", name:"smoke bomb" },
    { max:72, type:"valuable", id:"amber_bead" },
    { max:84, type:"valuable", id:"silver_clasp" },
    { max:93, type:"valuable", id:"moonstone_chip" },
    { max:100, type:"valuable", id:"old_relic" }
  ];

  function migrateLegacySave() {
    try {
      const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
      if (legacy && !localStorage.getItem(saveKey(1))) {
        localStorage.setItem(saveKey(1), legacy);
        localStorage.removeItem(LEGACY_SAVE_KEY);
      }
    } catch (_) {}
  }

  function loadSave(slot = activeSaveSlot) {
    migrateLegacySave();
    try { return JSON.parse(localStorage.getItem(saveKey(slot))) || {}; }
    catch (_) { return {}; }
  }

  function saveGame(data) {
    localStorage.setItem(saveKey(activeSaveSlot), JSON.stringify(data));
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
      this.inventoryTab = 0;
      this.shopUi = [];
      this.shopTab = 0;
      this.shopIndex = 0;
      this.heroGearVisuals = [];
      this.heroGearSignature = "";
      this.heroGearOwner = null;
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
            g.fillStyle(0x667586).fillRect(5,17,14,4);
            g.fillStyle(COLORS.gold).fillRect(11,20,2,2);
          } else if (role === "ranger") {
            g.fillStyle(0x31553c).fillTriangle(5,10,12,3,19,10);
            g.fillStyle(0x294b39).fillTriangle(5,18,12,29,19,18);
          } else if (role === "rogue") {
            g.fillStyle(0x453555).fillTriangle(5,10,12,3,19,10);
            g.fillStyle(0xc35d68).fillRect(7,16,10,2);
          } else if (role === "cleric") {
            g.fillStyle(0xf2ead0).fillRect(7,18,10,8);
            g.fillStyle(COLORS.gold).fillRect(11,19,2,5).fillRect(9,21,6,2);
          } else if (role === "wizard") {
            g.fillStyle(0x334b85).fillTriangle(3,8,13,0,20,8).fillRect(3,7,18,3);
            g.fillStyle(COLORS.gold).fillRect(10,3,2,2).fillRect(15,6,2,2);
          } else if (role === "innkeeper") {
            g.fillStyle(0xf2ead0).fillRect(8,19,8,7);
            g.fillStyle(COLORS.gold).fillRect(11,21,2,2);
          } else {
            g.fillStyle(COLORS.gold).fillRect(11,20,2,2);
          }

          if (key.startsWith("hero-")) {
            if (role === "fighter") {
              g.fillStyle(0x536476).fillRect(7,18,10,6);
              g.fillStyle(0xb8c1b7).fillRect(8,18,8,2);
              g.fillStyle(0x303b49).fillRect(5,6,14,3);
            } else if (role === "ranger") {
              g.fillStyle(0x294b39).fillTriangle(5,17,12,10,19,17).fillTriangle(5,17,12,30,19,17);
              g.fillStyle(0x6f9258).fillRect(8,18,8,3);
            } else if (role === "rogue") {
              g.fillStyle(0x262634).fillTriangle(4,10,12,2,20,10).fillRect(5,8,14,6);
              if (direction !== "up") g.fillStyle(0x30303b).fillRect(7,13,10,4);
              g.fillStyle(0x9b4f61).fillRect(7,19,11,2);
            } else if (role === "cleric") {
              g.fillStyle(0xf1e6c5).fillRect(7,17,10,10);
              g.fillStyle(0xc89b4d).fillRect(11,18,2,8).fillRect(8,21,8,2);
              g.fillStyle(0xffd166).fillCircle(12,21,3);
            } else if (role === "wizard") {
              g.fillStyle(0x293d75).fillTriangle(5,17,12,30,19,17);
              g.fillStyle(0x76558f).fillRect(6,17,12,3);
              g.fillStyle(0xffd166).fillRect(9,22,2,2).fillRect(15,25,2,2).fillRect(12,18,2,2);
              g.fillStyle(0x2c3768).fillTriangle(3,8,13,0,20,8).fillRect(2,7,20,3);
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
      makePerson("cultist", 0x4b355f, 0x20222d, "wizard");
      makePerson("malrec", 0x76558f, 0xd8d8e8, "wizard");
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
      const baseKey=classKey ? "hero-"+classKey+"-"+direction : "hero-"+direction;
      if(!classKey || !this.textures || !this.textures.exists(baseKey)) return baseKey;
      this.ensureInventory();
      const eq=this.save.equipment || {};
      if(!eq.weapon&&!eq.armor&&!eq.boots&&!eq.shield&&!eq.trinket&&!eq.cloak) return baseKey;
      const signature=[classKey,eq.weapon||"none",eq.armor||"none",eq.boots||"none",eq.shield||"none",eq.trinket||"none",eq.cloak||"none",direction]
        .join("-").replace(/[^a-z0-9-]/gi,"");
      const compositeKey="hero-equipped-"+signature;
      if(this.textures.exists(compositeKey)) return compositeKey;

      const keys=this.getEquipmentTextureKeys(direction);
      const composite=this.textures.addDynamicTexture(compositeKey,24,32);
      composite.draw(keys.backKey,0,0);
      composite.draw(baseKey,0,0);
      composite.draw(keys.frontKey,0,0);
      return compositeKey;
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
      this.shopUi = [];
      this.heroGearVisuals = [];
      this.heroGearSignature = "";
      this.heroGearOwner = null;
      this.hudText = null;
    }

    getEquipmentTextureKeys(direction="down") {
      this.ensureInventory();
      const eq=this.save.equipment || {};
      const signature=[eq.weapon||"none",eq.armor||"none",eq.boots||"none",eq.shield||"none",eq.trinket||"none",eq.cloak||"none",direction].join("-").replace(/[^a-z0-9-]/gi,"");
      const backKey="hero-gear-back-"+signature;
      const frontKey="hero-gear-front-"+signature;
      if(this.textures.exists(backKey)&&this.textures.exists(frontKey)) return {backKey,frontKey};

      const back=this.make.graphics({add:false});
      const front=this.make.graphics({add:false});
      const weapon=eq.weapon,armor=eq.armor,boots=eq.boots,shield=eq.shield,trinket=eq.trinket,cloak=eq.cloak;

      // Everything is drawn on the character's exact native 24×32 pixel grid.
      if(cloak==="captain_mantle") {
        back.fillStyle(0x182847).fillTriangle(4,16,12,31,20,16);
        back.fillStyle(0x7d3541).fillTriangle(5,16,12,29,19,16);
        back.fillStyle(0xe6b85c).fillRect(7,16,10,2);
      }
      if(cloak==="hawk_quiver") {
        back.fillStyle(0x182847).fillRect(2,9,6,19);
        back.fillStyle(0x5b3b2f).fillRect(3,10,4,17);
        back.fillStyle(0xe6d59a).fillTriangle(2,10,4,4,6,10).fillTriangle(5,10,7,3,9,10);
      }

      // Opaque armor pixels cover and replace the base torso/boot pixels.
      if(armor==="quilted_jack") {
        front.fillStyle(0x182847).fillRect(5,16,14,11);
        front.fillStyle(0x9b704d).fillRect(6,17,12,9);
        front.fillStyle(0xd0a86b).fillRect(7,18,10,2).fillRect(7,22,10,1);
        front.fillStyle(0x704536).fillRect(11,17,2,9);
      }
      if(shield==="greywatch_buckler") {
        front.fillStyle(0x182847).fillCircle(4,21,6);
        front.fillStyle(0xa9b8b0).fillCircle(4,21,5);
        front.fillStyle(0x405164).fillCircle(4,21,3);
        front.fillStyle(0xe6b85c).fillCircle(4,21,1);
      }
      if(boots==="marsh_boots") {
        front.fillStyle(0x182847).fillRect(4,25,8,7).fillRect(12,25,8,7);
        front.fillStyle(0x405642).fillRect(5,26,6,5).fillRect(13,26,6,5);
        front.fillStyle(0x9a7b4f).fillRect(4,29,8,2).fillRect(12,29,8,2);
      }

      // Weapons fit inside the same hand and silhouette pixels as the base sprite.
      if(weapon==="nightglass_dirk") {
        front.fillStyle(0xd9c3f0).fillTriangle(19,18,24,14,21,22);
        front.fillStyle(0x4a315f).fillRect(18,21,6,2);
        front.fillStyle(0x704536).fillRect(20,23,2,6);
      } else if(weapon==="tempered_hatchet") {
        front.fillStyle(0x6e4934).fillRect(20,13,2,16);
        front.fillStyle(0xb8c0b8).fillRect(17,11,7,5);
        front.fillStyle(0x626c70).fillTriangle(17,11,13,14,17,16);
      } else if(weapon) {
        front.fillStyle(0xd7ded2).fillTriangle(20,7,23,7,22,23);
        front.fillStyle(0xe6b85c).fillRect(18,21,6,2);
        front.fillStyle(0x704536).fillRect(20,23,3,7);
      }

      const trinketColors={
        saint_token:0xe8e1c7,jailer_ring:0xa9b8b0,hearth_charm:0xe87545,
        scribe_lens:0x65b9c7,dawn_reliquary:0xffd166,violet_spellshard:0xbda7ff
      };
      if(direction!=="up"&&trinketColors[trinket]) {
        front.fillStyle(0x182847).fillCircle(12,21,3);
        front.fillStyle(trinketColors[trinket]).fillCircle(12,21,2);
        front.fillStyle(0xffefc1).fillRect(12,19,1,2);
      }

      back.generateTexture(backKey,24,32);
      front.generateTexture(frontKey,24,32);
      back.destroy();
      front.destroy();
      return {backKey,frontKey};
    }

    syncHeroEquipmentVisuals() {
      if(!this.hero||this.mode!=="world") return;
      const direction=this.facing.y<0?"up":(this.facing.x!==0?"side":"down");
      const textureKey=this.getHeroTexture(direction);
      if(this.hero.texture.key!==textureKey) this.hero.setTexture(textureKey);
      this.heroGearVisuals.forEach(x=>x&&x.destroy());
      this.heroGearVisuals=[];
      this.heroGearOwner=this.hero;
      this.heroGearSignature=textureKey;
    }

    addBattleEquipmentVisuals() {
      // Equipment is already composited into the battle hero's single texture.
    }

    checkEnemyEngagement() {
      if(this.mode!=="world"||this.busy||this.dialogue||!this.enemies||!this.enemies.length) return false;
      const enemy=this.enemies.find(e=>Math.abs(e.x-this.heroTile.x)+Math.abs(e.y-this.heroTile.y)<=1);
      if(!enemy) return false;
      this.openBattleMenu(enemy);
      return true;
    }

    text(x, y, value, size = 7, color = "#ffefc1", origin = 0) {
      const renderScale = 3;
      return this.add.text(x * renderScale, y * renderScale, value, {

        fontFamily: 'Silkscreen, monospace',
        fontSize: (size * renderScale) + "px",
        fontStyle: "bold",
        color,
        resolution: 24,
        lineSpacing: 1
      }).setOrigin(origin).setDepth(20).setScrollFactor(0);
    }

    selectSaveSlot(direction) {
      activeSaveSlot = ((activeSaveSlot - 1 + direction + SAVE_SLOT_COUNT) % SAVE_SLOT_COUNT) + 1;
      localStorage.setItem(ACTIVE_SLOT_KEY, String(activeSaveSlot));
      this.save = loadSave(activeSaveSlot);
      this.showTitle();
    }

    slotSummary(slot) {
      const data = loadSave(slot);
      if (!data.className) return "EMPTY";
      const stage = data.gameComplete ? "COMPLETE" : "LV" + (data.level || 1);
      return data.className.toUpperCase() + " " + stage;
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
      this.text(160, 201, this.save.className ? "CONTINUE JOURNEY" : "NEW JOURNEY", 10, "#fff7d6", 0.5);
      for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot++) {
        const selected = slot === activeSaveSlot;
        const label = (selected ? "▶ " : "  ") + "SLOT " + slot + " · " + this.slotSummary(slot);
        this.text(160, 218 + (slot - 1) * 17, label, 7, selected ? "#ffd166" : "#b7d1b0", 0.5);
      }
      const prompt = this.text(160, 270, "← → SELECT   Z: PLAY", 7, "#e6b85c", 0.5);
      if (this.save.className) {
        this.text(160, 282, "R: ERASE SELECTED SLOT", 5, "#89a39a", 0.5);
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
        if (this.save.chapterTwoComplete) {
          this.showChapterTwoEnding();
          return;
        }
        if (this.save.chapterStage === "chapter2") {
          this.buildChapterTwoRoom(this.save.chapterTwoRoom || 0, "south");
          return;
        }
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
        if (this.save.chapterStage === "village") {
          this.buildVillage();
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
      const T = TILE;
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

    buildVillage(entry="inn") {
      this.clearScene();
      this.mode = "world";
      this.area = "village";
      this.heroTile = entry === "east" ? { x: 28, y: 8 } : { x: 9, y: 5 };
      this.facing = entry === "east" ? { x: -1, y: 0 } : { x: 0, y: 1 };
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
      if (this.save.raidStarted) {
        this.blocked.delete("29,7");
        this.blocked.delete("29,8");
        g.fillStyle(0x9c815d).fillRect(29*T,7*T, T,2*T);
        g.fillStyle(0xd8bd88,0.7).fillRect(29*T,7*T+9,T,4);
        g.fillStyle(0xd8bd88,0.7).fillRect(29*T,8*T+31,T,4);
      }

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
        {id:"village-jun",x:12,y:17,texture:"villager-c-down",intro:["JUN: I can see Greywatch from the hill when the clouds break.","Last night there was a red light in its highest window.","Everyone says the castle is empty."]},
        {id:"merchant-selda",x:15,y:8,texture:"villager-a-down",intro:["SELDA: Coin still spends, even when goblins are at the gate.","I buy equipment and valuables, and keep adventuring supplies in stock."]}
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
      this.hideHud();
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
      if(this.mode==="world"&&!this.dialogue) this.updateHud();
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

      if (npc.id === "merchant-selda") {
        this.openShopMenu();
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
      this.hideHud();
      const classInfo={
        Fighter:{
          ability:"SECOND WIND",
          description:"Twice per enemy, recover half of your maximum HP.",
          stats:"18 HP  ·  5 ATK  ·  2 ARMOR",
          gear:"STARTS WITH: LONGSWORD"
        },
        Ranger:{
          ability:"HUNTER'S MARK",
          description:"Twice per enemy, deal 4 damage and mark the foe. Marked foes take +2 damage.",
          stats:"15 HP  ·  5 ATK  ·  1 ARMOR",
          gear:"STARTS WITH: HUNTING BOW"
        },
        Rogue:{
          ability:"SNEAK ATTACK",
          description:"Twice per enemy, strike for double your normal attack damage.",
          stats:"14 HP  ·  6 ATK  ·  1 ARMOR",
          gear:"STARTS WITH: TWIN KNIVES"
        },
        Cleric:{
          ability:"HEALING LIGHT · 3 MP",
          description:"Restore 7 HP. Starts with 6 MP and gains more MP when leveling.",
          stats:"16 HP  ·  4 ATK  ·  1 ARMOR",
          gear:"STARTS WITH: MACE"
        },
        Wizard:{
          ability:"MAGIC MISSILE · 3 MP",
          description:"Fire three unerring bolts for 12 total magic damage.",
          stats:"12 HP  ·  7 ATK  ·  0 ARMOR",
          gear:"STARTS WITH: OAK WAND"
        }
      };
      const info=classInfo[npc.className] || classInfo.Fighter;
      this.choicePanel = this.add.graphics().setDepth(55).setScrollFactor(0).setScale(3);
      this.choicePanel.fillStyle(0x101827,0.88).fillRect(8,25,144,112);
      this.choicePanel.fillStyle(COLORS.cream).fillRect(10,27,140,108);
      this.choicePanel.fillStyle(COLORS.ink).fillRect(13,30,134,102);
      this.choicePanel.lineStyle(2,npc.color,1).strokeRect(15,32,130,98);

      const choiceText=(x,y,value,size,color,origin=0)=>{
        return this.text(x,y,value,size,color,origin).setDepth(60).setData("choice",true);
      };
      choiceText(80,36,npc.className.toUpperCase(),9,"#ffd166",0.5);
      choiceText(80,50,info.ability,6,"#b7d1b0",0.5);
      choiceText(18,63,this.wrap(info.description,38),5,"#fff7d6");
      choiceText(18,91,info.stats,5,"#ffd166");
      choiceText(18,102,info.gear,5,"#b7d1b0");
      choiceText(80,120,"Z: ACCEPT   X: DECLINE",5,"#ffefc1",0.5);
    }

    clearChoice() {
      if (this.choicePanel) this.choicePanel.destroy();
      this.children.list.filter(x => x.getData && x.getData("choice")).forEach(x => x.destroy());
      this.choicePanel = null;
      this.pendingMentor = null;
      this.mode = "world";
      this.busy = false;
      this.updateHud();
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
      this.save.equipment = { weapon:null, armor:null, boots:null, shield:null, trinket:null, cloak:null };
      this.save.collectedLoot = [];
      this.save.chestPositions = {};
      this.save.lootSeed = ((Date.now()>>>0)^Math.floor(Math.random()*0xffffffff)).toString(36);
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
      if (this.area === "chapter2" && (nx === 9 || nx === 10) && ny === 0) {
        if (this.enemies.length) this.openDialogue(["The northern passage is blocked while enemies remain."]);
        else if (this.chapterTwoRoom < 19) this.buildChapterTwoRoom(this.chapterTwoRoom + 1, "south");
        else if ((this.save.clearedChapterTwoRooms || []).includes(19)) {
          this.save.chapterTwoComplete=true;
          this.save.chapterStage="chapter2-complete";
          saveGame(this.save);
          this.showChapterTwoEnding();
        }
        return;
      }
      if (this.area === "chapter2" && (nx === 9 || nx === 10) && ny === 14) {
        if (this.chapterTwoRoom > 0) this.buildChapterTwoRoom(this.chapterTwoRoom - 1, "north");
        else this.showEnding();
        return;
      }
      if (this.area === "dungeon" && (nx === 9 || nx === 10) && ny === 0) {
        if (this.enemies.length) this.openDialogue(["The northern passage is blocked while enemies remain."]);
        else if (this.dungeonRoom < 9) this.buildDungeonRoom(this.dungeonRoom + 1,"south");
        else if (this.save.clearedRooms.includes(9)) {
          this.save.gameComplete=true;
          this.save.chapterStage="complete";
          saveGame(this.save);
          this.showEnding();
        }
        return;
      }
      if (this.area === "dungeon" && (nx === 9 || nx === 10) && ny === 14) {
        if (this.dungeonRoom > 0) this.buildDungeonRoom(this.dungeonRoom - 1,"north");
        else this.buildRoad("east");
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
      if (this.area === "village" && nx === 30 && (ny === 7 || ny === 8)) {
        if (!this.save.raidStarted) this.openDialogue(["The east path is quiet. Speak with Elin, Tomas, and Nell first."]);
        else this.buildRaid("south");
        return;
      }
      if (this.area === "raid" && (nx === 9 || nx === 10) && ny === 15) {
        this.buildVillage("east");
        return;
      }
      if (this.area === "raid" && (nx === 9 || nx === 10) && ny === -1) {
        if (!this.save.raidCleared) this.openDialogue(["The Ashfangs still hold the northern path."]);
        else this.buildRoad("west");
        return;
      }
      if (this.area === "road" && nx === -1 && (ny === 7 || ny === 8)) {
        this.buildRaid("north");
        return;
      }
      if (this.area === "road" && nx === 20 && (ny === 7 || ny === 8)) {
        if (!this.save.roadCleared) this.openDialogue(["Ashfang scouts still block the way to Greywatch."]);
        else this.buildCastle();
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

    getSeededChestPosition(itemId,roomIndex,reserved=[]) {
      this.ensureInventory();
      const reservedTiles=new Set(reserved.map(([x,y])=>x+","+y));
      reservedTiles.add(this.heroTile.x+","+this.heroTile.y);
      for(const x of [9,10]) {
        reservedTiles.add(x+",0");
        reservedTiles.add(x+",1");
        reservedTiles.add(x+",13");
        reservedTiles.add(x+",14");
      }
      const candidates=[];
      for(let y=2;y<=12;y++) for(let x=2;x<=17;x++) {
        const key=x+","+y;
        if(!this.blocked.has(key)&&!reservedTiles.has(key)) candidates.push({x,y});
      }
      const saved=this.save.chestPositions[itemId];
      if(saved&&saved.room===roomIndex&&candidates.some(p=>p.x===saved.x&&p.y===saved.y)) return saved;

      let hash=2166136261;
      const input=this.save.lootSeed+"|"+roomIndex+"|"+itemId;
      for(let i=0;i<input.length;i++) {
        hash^=input.charCodeAt(i);
        hash=Math.imul(hash,16777619)>>>0;
      }
      const position=candidates[hash%candidates.length] || {x:10,y:7};
      const seeded={room:roomIndex,x:position.x,y:position.y};
      this.save.chestPositions[itemId]=seeded;
      saveGame(this.save);
      return seeded;
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
      this.hideHud();
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

    getInventoryEntries() {
      this.ensureInventory();
      if(this.inventoryTab===0) return [
        {kind:"healing",name:"Healing Draught",count:this.save.healingDraughts,description:"Restores 8 HP plus healing bonuses. Press Z to drink."},
        {kind:"mana",name:"Mana Potion",count:this.save.manaPotions,description:"Restores 6 MP. Only Clerics and Wizards can use it."},
        {kind:"smoke",name:"Smoke Bomb",count:this.save.smokeBombs,description:"Allows a safe escape from most battles. Used from the battle Item menu."},
        {kind:"gold",name:"Gold Coins",count:this.save.gold,description:"Currency gathered from enemies and forgotten caches."}
      ];
      if(this.inventoryTab===1) return this.save.inventory.map(id=>({kind:"gear",id,item:ITEMS[id]}));
      return Object.entries(this.save.valuables)
        .filter(([,count])=>count>0)
        .map(([id,count])=>({kind:"valuable",id,count,item:VALUABLES[id]}));
    }

    renderInventoryMenu(message="") {
      this.ensureInventory();
      this.inventoryUi.forEach(x=>x&&x.destroy());
      this.inventoryUi=[];
      const panel=this.add.graphics().setDepth(100).setScrollFactor(0);
      panel.fillStyle(0x101827,0.99).fillRect(8,8,464,416);
      panel.lineStyle(5,COLORS.cream).strokeRect(8,8,464,416);
      panel.lineStyle(2,COLORS.gold).strokeRect(15,15,450,402);
      panel.fillStyle(0x26334d).fillRect(20,55,440,42);
      panel.fillStyle(0x182847).fillRect(20,326,440,80);
      this.inventoryUi.push(panel);

      const style=(size,color="#fff7d6")=>({
        fontFamily:"Silkscreen, monospace",fontSize:size+"px",fontStyle:"bold",color,resolution: 24
      });
      const title=this.add.text(25,21,"INVENTORY",style(22,"#ffd166")).setDepth(101).setScrollFactor(0);
      this.inventoryUi.push(title);

      const tabs=["SUPPLIES","EQUIPMENT","VALUABLES"];
      tabs.forEach((tab,index)=>{
        const selected=index===this.inventoryTab;
        const x=[31,166,326][index];
        const label=this.add.text(x,67,(selected?"▶ ":"")+tab,style(12,selected?"#ffd166":"#89a39a"))
          .setDepth(101).setScrollFactor(0);
        this.inventoryUi.push(label);
      });

      const entries=this.getInventoryEntries();
      if(this.inventoryIndex>=entries.length) this.inventoryIndex=Math.max(0,entries.length-1);
      const visible=7;
      if(this.inventoryIndex<this.inventoryScroll) this.inventoryScroll=this.inventoryIndex;
      if(this.inventoryIndex>=this.inventoryScroll+visible) this.inventoryScroll=this.inventoryIndex-visible+1;
      if(!entries.length) {
        const empty=this.add.text(30,125,
          this.inventoryTab===1?"No equipment collected.":"No valuables collected.",
          style(15,"#89a39a")).setDepth(101).setScrollFactor(0);
        this.inventoryUi.push(empty);
      } else {
        entries.slice(this.inventoryScroll,this.inventoryScroll+visible).forEach((entry,row)=>{
          const index=this.inventoryScroll+row;
          const selected=index===this.inventoryIndex;
          let label="";
          let color=selected?"#ffd166":"#fff7d6";
          if(entry.kind==="gear") {
            const worn=this.save.equipment[entry.item.slot]===entry.id;
            const restricted=entry.item.className&&entry.item.className!==this.save.className;
            label=(worn?"[E] ":"")+entry.item.name+"  · "+entry.item.slot.toUpperCase();
            if(restricted) color="#6f7280";
          } else {
            label=entry.name+"  ×"+entry.count;
          }
          const line=this.add.text(31,109+row*28,(selected?"▶ ":"  ")+label,style(13,color))
            .setDepth(101).setScrollFactor(0);
          this.inventoryUi.push(line);
        });

        const entry=entries[this.inventoryIndex];
        let description="",stats="",controls="← → TABS   X/I: CLOSE";
        if(entry.kind==="gear") {
          const item=entry.item;
          description=item.description;
          stats=[
            item.damage?"+"+item.damage+" DAMAGE":"",
            item.armor?"+"+item.armor+" ARMOR":"",
            item.hp?"+"+item.hp+" HP":"",
            item.mp?"+"+item.mp+" MP":"",
            item.healing?"+"+item.healing+" HEALING":"",
            item.magic?"+"+item.magic+" MAGIC":""
          ].filter(Boolean).join("  ·  ");
          controls="Z: EQUIP/REMOVE   ← → TABS   X/I: CLOSE";
        } else if(entry.kind==="valuable") {
          description=entry.item.description;
          stats="VALUE: "+entry.item.value+" GOLD EACH  ·  TOTAL: "+(entry.item.value*entry.count);
        } else {
          description=entry.description;
          stats=entry.kind==="gold"?"CURRENT FUNDS: "+entry.count+" GOLD":"";
          if(entry.kind==="healing") controls="Z: USE   ← → TABS   X/I: CLOSE";
        }
        const detail=this.add.text(29,337,
          (message||description)+(stats?"\n"+stats:"")+"\n"+controls,
          style(11,message?"#ffb09f":"#b7d1b0")).setDepth(101).setScrollFactor(0);
        detail.setWordWrapWidth(420);
        this.inventoryUi.push(detail);
      }
    }

    moveInventoryCursor(direction) {
      const entries=this.getInventoryEntries();
      if(!entries.length) return;
      this.inventoryIndex=(this.inventoryIndex+direction+entries.length)%entries.length;
      this.renderInventoryMenu();
    }

    moveInventoryTab(direction) {
      this.inventoryTab=(this.inventoryTab+direction+3)%3;
      this.inventoryIndex=0;
      this.inventoryScroll=0;
      this.renderInventoryMenu();
    }

    activateInventoryItem() {
      const entries=this.getInventoryEntries();
      if(!entries.length) return;
      const entry=entries[this.inventoryIndex];
      if(entry.kind==="gear") {
        this.toggleEquipment(entry.id);
        return;
      }
      if(entry.kind==="healing") {
        if(this.save.healingDraughts<=0) return this.renderInventoryMenu("You have no healing draughts.");
        if(this.playerHp>=this.playerMaxHp) return this.renderInventoryMenu("You are already at full health.");
        this.save.healingDraughts--;
        this.playerHp=Math.min(this.playerMaxHp,this.playerHp+8+(this.getClassStats().healing||0));
        this.save.playerHp=this.playerHp;
        saveGame(this.save);
        this.renderInventoryMenu("You drink a healing draught and restore HP.");
      } else if(entry.kind==="mana") {
        if(!this.playerMaxMp) return this.renderInventoryMenu("Your class does not use MP.");
        if(this.save.manaPotions<=0) return this.renderInventoryMenu("You have no mana potions.");
        if(this.playerMp>=this.playerMaxMp) return this.renderInventoryMenu("Your MP is already full.");
        this.save.manaPotions--;
        this.playerMp=Math.min(this.playerMaxMp,this.playerMp+6);
        this.save.playerMp=this.playerMp;
        saveGame(this.save);
        this.renderInventoryMenu("Arcane energy returns. You restore 6 MP.");
      }
    }

    toggleEquipment(id=null) {
      if(!this.save.inventory.length) return;
      id=id || this.save.inventory[this.inventoryIndex];
      const item=ITEMS[id];
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
      this.heroGearSignature="";
      this.renderInventoryMenu();
    }

    getShopEntries() {
      this.ensureInventory();
      if(this.shopTab===0) return [
        {kind:"buy",id:"healing",name:"Healing Draught",price:10,description:"Restores 8 HP plus healing bonuses."},
        {kind:"buy",id:"mana",name:"Mana Potion",price:12,description:"Restores 6 MP for Clerics and Wizards."},
        {kind:"buy",id:"smoke",name:"Smoke Bomb",price:18,description:"Guarantees escape from most non-boss encounters."}
      ];
      const valuables=Object.entries(this.save.valuables)
        .filter(([,count])=>count>0)
        .map(([id,count])=>({kind:"valuable",id,count,name:VALUABLES[id].name,price:VALUABLES[id].value,description:VALUABLES[id].description}));
      const gear=this.save.inventory.map(id=>{
        const item=ITEMS[id];
        const stats=(item.damage||0)*8+(item.armor||0)*10+(item.hp||0)*3+(item.mp||0)*3+(item.healing||0)*8+(item.magic||0)*8;
        return {kind:"gear",id,item,name:item.name,price:Math.max(6,6+stats),description:item.description};
      });
      return [...valuables,...gear];
    }

    openShopMenu() {
      this.hideHud();
      this.ensureInventory();
      this.mode="shop";
      this.busy=true;
      this.shopTab=0;
      this.shopIndex=0;
      this.renderShopMenu();
    }

    closeShopMenu() {
      this.shopUi.forEach(x=>x&&x.destroy());
      this.shopUi=[];
      this.mode="world";
      this.busy=false;
      this.updateHud();
    }

    renderShopMenu(message="") {
      this.shopUi.forEach(x=>x&&x.destroy());
      this.shopUi=[];
      const panel=this.add.graphics().setDepth(105).setScrollFactor(0);
      panel.fillStyle(0x101827,0.99).fillRect(8,8,464,416);
      panel.lineStyle(5,COLORS.cream).strokeRect(8,8,464,416);
      panel.lineStyle(2,COLORS.gold).strokeRect(15,15,450,402);
      panel.fillStyle(0x26334d).fillRect(20,55,440,44);
      panel.fillStyle(0x182847).fillRect(20,326,440,80);
      this.shopUi.push(panel);
      const style=(size,color="#fff7d6")=>({
        fontFamily:"Silkscreen, monospace",fontSize:size+"px",fontStyle:"bold",color,resolution: 24
      });
      this.shopUi.push(
        this.add.text(25,21,"SELDA'S MARKET",style(21,"#ffd166")).setDepth(106).setScrollFactor(0),
        this.add.text(448,27,"GOLD "+this.save.gold,style(14,"#ffd166")).setOrigin(1,0).setDepth(106).setScrollFactor(0)
      );
      ["BUY","SELL"].forEach((tab,index)=>{
        const selected=index===this.shopTab;
        this.shopUi.push(this.add.text(index?254:87,70,(selected?"▶ ":"")+tab,
          style(14,selected?"#ffd166":"#89a39a")).setDepth(106).setScrollFactor(0));
      });
      const entries=this.getShopEntries();
      if(this.shopIndex>=entries.length) this.shopIndex=Math.max(0,entries.length-1);
      if(!entries.length) {
        this.shopUi.push(this.add.text(31,125,"Nothing available to sell.",style(15,"#89a39a")).setDepth(106).setScrollFactor(0));
      } else {
        const scrollStart=Math.max(0,Math.min(this.shopIndex-6,entries.length-7));
        entries.slice(scrollStart,scrollStart+7).forEach((entry,row)=>{
          const index=scrollStart+row;
          const selected=index===this.shopIndex;
          const suffix=entry.kind==="valuable"?" ×"+entry.count:"";
          const equipped=entry.kind==="gear"&&this.save.equipment[entry.item.slot]===entry.id;
          const label=(selected?"▶ ":"  ")+(equipped?"[E] ":"")+entry.name+suffix+"  "+entry.price+"G";
          this.shopUi.push(this.add.text(31,109+row*28,label,style(13,
            equipped?"#6f7280":(selected?"#ffd166":"#fff7d6")
          )).setDepth(106).setScrollFactor(0));
        });
        const entry=entries[this.shopIndex];
        const action=this.shopTab===0?"Z: BUY":"Z: SELL";
        const detail=this.add.text(29,337,
          (message||entry.description)+"\n"+(this.shopTab===0?"PRICE: ":"SELL VALUE: ")+entry.price+" GOLD\n"+
          action+"   ← → BUY/SELL   X: CLOSE",
          style(11,message?"#ffb09f":"#b7d1b0")).setDepth(106).setScrollFactor(0);
        detail.setWordWrapWidth(420);
        this.shopUi.push(detail);
      }
    }

    moveShopCursor(direction) {
      const entries=this.getShopEntries();
      if(!entries.length) return;
      this.shopIndex=(this.shopIndex+direction+entries.length)%entries.length;
      this.renderShopMenu();
    }

    moveShopTab(direction) {
      this.shopTab=(this.shopTab+direction+2)%2;
      this.shopIndex=0;
      this.renderShopMenu();
    }

    chooseShopAction() {
      const entries=this.getShopEntries();
      if(!entries.length) return;
      const entry=entries[this.shopIndex];
      if(this.shopTab===0) {
        if(this.save.gold<entry.price) return this.renderShopMenu("You do not have enough gold.");
        this.save.gold-=entry.price;
        if(entry.id==="healing") this.save.healingDraughts++;
        else if(entry.id==="mana") this.save.manaPotions++;
        else this.save.smokeBombs++;
        saveGame(this.save);
        this.renderShopMenu("Purchased "+entry.name+".");
        return;
      }
      if(entry.kind==="gear") {
        if(this.save.equipment[entry.item.slot]===entry.id) return this.renderShopMenu("Remove equipped gear before selling it.");
        this.save.inventory=this.save.inventory.filter(id=>id!==entry.id);
      } else {
        this.save.valuables[entry.id]--;
      }
      this.save.gold+=entry.price;
      saveGame(this.save);
      this.shopIndex=0;
      this.renderShopMenu("Sold "+entry.name+" for "+entry.price+" gold.");
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
      const reward=enemy.id==="malrec" ? 120 : (enemy.id==="varkul" ? 45 : (enemy.type==="cultist" ? 22 : (enemy.type==="orc" || enemy.type==="hobgoblin" ? 18 : 10)));
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

    hideHud() {
      if(this.hudText) {
        this.hudText.destroy();
        this.hudText=null;
      }
    }

    updateHud() {
      this.hideHud();
      if(this.dialogue || ["choice","inventory","shop","battle"].includes(this.mode)) return;
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

    rollEnemyDamage(enemy) {
      return enemy.type === "goblin" ? Phaser.Math.Between(1,4) : enemy.damage;
    }

    rollRandomLoot(enemy) {
      this.ensureInventory();
      const roll=Phaser.Math.Between(1,100);
      const drop=RANDOM_LOOT_TABLE.find(entry=>roll<=entry.max) || RANDOM_LOOT_TABLE[0];
      let message="";
      if(drop.type==="gold") {
        const bonus=enemy.id==="varkul" ? 15 : 0;
        const amount=Phaser.Math.Between(drop.min,drop.maxAmount)+bonus;
        this.save.gold+=amount;
        message="LOOT: "+amount+" GOLD";
      } else if(drop.type==="healing") {
        this.save.healingDraughts++;
        message="LOOT: HEALING DRAUGHT";
      } else if(drop.type==="smoke") {
        this.save.smokeBombs++;
        message="LOOT: SMOKE BOMB";
      } else {
        this.save.valuables[drop.id]=(this.save.valuables[drop.id]||0)+1;
        message="LOOT: "+VALUABLES[drop.id].name.toUpperCase();
      }
      saveGame(this.save);
      this.showLootToast(message);
      return message;
    }

    showLootToast(message) {
      const toast=this.add.text(WIDTH/2,104,message,{
        fontFamily:"Silkscreen, monospace",fontSize:"14px",fontStyle:"bold",
        color:"#ffd166",backgroundColor:"#182847",padding:{x:9,y:5},resolution: 24
      }).setOrigin(0.5).setDepth(98).setScrollFactor(0);
      this.tweens.add({targets:toast,y:88,alpha:0,duration:1100,delay:650,onComplete:()=>toast.destroy()});
    }

    removeDefeatedEnemy(enemy) {
      this.gainExperience(enemy);
      this.rollRandomLoot(enemy);
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
      enemy.battleTurns=(enemy.battleTurns||0)+1;
      const ashfangCleave=enemy.id==="varkul"&&enemy.battleTurns%3===0;
      const violetRuin=enemy.id==="malrec"&&enemy.battleTurns%4===0;
      const rolledDamage=ashfangCleave?Phaser.Math.Between(6,9):(violetRuin?Phaser.Math.Between(8,12):this.rollEnemyDamage(enemy));
      const armor=this.getClassStats().armor;
      const effectiveArmor=ashfangCleave?Math.floor(armor/2):(violetRuin?0:armor);
      let dealt=Math.max(1,rolledDamage-effectiveArmor);
      if(this.guarding) {
        dealt=Math.max(1,Math.floor(dealt/3));
        this.guarding=false;
      }
      this.playerHp-=dealt;
      this.save.playerHp=this.playerHp;
      saveGame(this.save);
      if(violetRuin) {
        this.playerMp=Math.max(0,this.playerMp-2); this.save.playerMp=this.playerMp;
        this.cameras.main.flash(180,90,45,140); this.cameras.main.shake(220,0.017);
      } else if(ashfangCleave) {
        this.cameras.main.flash(130,175,35,25);
        this.cameras.main.shake(180,0.014);
      } else {
        this.cameras.main.flash(75,120,20,20);
      }
      this.tweens.add({
        targets:this.battleEnemySprite,
        x:(ashfangCleave||violetRuin)?302:326,
        scaleX:(ashfangCleave||violetRuin)?5.45:4.8,
        scaleY:(ashfangCleave||violetRuin)?5.45:4.8,
        duration:(ashfangCleave||violetRuin)?140:90,
        yoyo:true
      });
      this.tweens.add({
        targets:this.battleHeroSprite,alpha:0.25,duration:(ashfangCleave||violetRuin)?135:85,yoyo:true,
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
          const action=ashfangCleave
            ? "VARKUL USES ASHFANG CLEAVE! "+dealt+" DAMAGE. HALF ARMOR."
            : (violetRuin ? "MALREC CASTS VIOLET RUIN! "+dealt+" DAMAGE. 2 MP DRAINED." : enemy.name+" deals "+dealt+" damage.");
          const warning=enemy.id==="varkul"&&enemy.battleTurns%3===2
            ? "  Varkul raises his axe—Ashfang Cleave is next!"
            : (enemy.id==="malrec"&&enemy.battleTurns%4===3 ? "  The violet crown flares—Violet Ruin is next!" : "");
          this.renderBattleMenu((playerMessage?playerMessage+"  ":"")+action+warning);
        }
      });
    }

    enemyTurn() {
      if (this.busy || !this.enemies || !this.enemies.length) return;
      for (const enemy of this.enemies) {
        let distance=Math.abs(enemy.x-this.heroTile.x)+Math.abs(enemy.y-this.heroTile.y);
        if(distance===1) {
          this.openBattleMenu(enemy);
          return;
        }
        if(distance>6) continue;
        const choices=[];
        const dx=Math.sign(this.heroTile.x-enemy.x);
        const dy=Math.sign(this.heroTile.y-enemy.y);
        if(Math.abs(this.heroTile.x-enemy.x)>=Math.abs(this.heroTile.y-enemy.y)) choices.push([dx,0],[0,dy]);
        else choices.push([0,dy],[dx,0]);
        for(const [mx,my] of choices) {
          if(!mx&&!my) continue;
          const nx=enemy.x+mx,ny=enemy.y+my,key=nx+","+ny;
          if(nx===this.heroTile.x&&ny===this.heroTile.y) continue;
          if(!this.blocked.has(key)) {
            this.blocked.delete(enemy.x+","+enemy.y);
            enemy.x=nx;enemy.y=ny;this.blocked.add(key);
            distance=Math.abs(nx-this.heroTile.x)+Math.abs(ny-this.heroTile.y);
            if(distance===1) {
              this.busy=true;
              this.tweens.add({
                targets:enemy.sprite,x:nx*TILE+24,y:ny*TILE+12,duration:100,
                onComplete:()=>{
                  this.busy=false;
                  if(this.mode==="world"&&this.enemies.includes(enemy)) this.openBattleMenu(enemy);
                }
              });
              return;
            }
            this.tweens.add({targets:enemy.sprite,x:nx*TILE+24,y:ny*TILE+12,duration:100});
            break;
          }
        }
      }
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
      if (typeof this.save.manaPotions !== "number") this.save.manaPotions = 0;
      if (!Array.isArray(this.save.inventory)) this.save.inventory=[];
      if (!Array.isArray(this.save.collectedLoot)) this.save.collectedLoot=[];
      let equipmentChanged=false;
      if (!this.save.equipment) {
        this.save.equipment={weapon:null,armor:null,boots:null,shield:null,trinket:null,cloak:null};
        equipmentChanged=true;
      }
      const equipment=this.save.equipment;
      for(const slot of ["weapon","armor","boots","shield","trinket","cloak"]) {
        if(!(slot in equipment)) { equipment[slot]=null; equipmentChanged=true; }
      }
      const armorMigrations={marsh_boots:"boots",greywatch_buckler:"shield",captain_mantle:"cloak"};
      if(armorMigrations[equipment.armor]) {
        equipment[armorMigrations[equipment.armor]]=equipment.armor;
        equipment.armor=null;
        equipmentChanged=true;
      }
      if(equipment.trinket==="hawk_quiver") {
        equipment.cloak=equipment.trinket;
        equipment.trinket=null;
        equipmentChanged=true;
      }
      if(equipmentChanged) saveGame(this.save);
      if (!this.save.chestPositions || Array.isArray(this.save.chestPositions)) this.save.chestPositions={};
      if (!this.save.lootSeed) this.save.lootSeed=((Date.now()>>>0)^Math.floor(Math.random()*0xffffffff)).toString(36);
      if (typeof this.save.gold !== "number") this.save.gold=0;
      if (!this.save.valuables || Array.isArray(this.save.valuables)) this.save.valuables={};
    }

    openBattleMenu(enemy) {
      this.hideHud();
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
        this.updateHud();
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

      const battleEnemyTexture=enemy.type==="goblin" ? "goblin-down" : enemy.type+"-side";
      const enemySprite=this.add.sprite(359,130,battleEnemyTexture)
        .setDepth(82).setScrollFactor(0).setScale(4.8).setFlipX(enemy.type!=="goblin");
      const heroSprite=this.add.sprite(112,236,this.getHeroTexture("up"))
        .setDepth(82).setScrollFactor(0).setScale(5.2);
      this.battleEnemySprite=enemySprite;
      this.battleHeroSprite=heroSprite;
      this.battleUi.push(enemySprite,heroSprite);
      this.addBattleEquipmentVisuals();

      const style=(size,color="#fff7d6")=>({
        fontFamily:"Silkscreen, monospace",fontSize:size+"px",fontStyle:"bold",color,resolution: 24
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
        ? ["DRAUGHT ×"+this.save.healingDraughts,"MANA ×"+this.save.manaPotions,"SMOKE ×"+this.save.smokeBombs,"BACK"]
        : ["ATTACK",this.getAbilityMenuLabel(),"ITEM","RUN"];
      const positions=this.battleMenu==="items"
        ? [[292,323],[292,347],[292,371],[292,395]]
        : [[292,325],[292,348],[292,371],[292,394]];
      options.forEach((option,index)=>{
        const selected=index===this.battleIndex;
        const [x,y]=positions[index];
        const t=this.add.text(x,y,(selected?"▶ ":"  ")+option,style(
          this.battleMenu==="items"?11:11,selected?"#ffd166":"#b7d1b0"
        )).setDepth(83).setScrollFactor(0);
        this.battleUi.push(t);
      });
    }

    moveBattleCursor(direction) {
      const count=this.battleMenu==="items" ? 4 : 4;
      this.battleIndex=(this.battleIndex+direction+count)%count;
      this.renderBattleMenu();
    }

    chooseBattleAction() {
      if(this.battleResolving) return;
      if (this.battleMenu === "items") {
        if (this.battleIndex === 0) return this.useHealingDraught();
        if (this.battleIndex === 1) return this.useManaPotion();
        if (this.battleIndex === 2) return this.useSmokeBomb();
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

    useManaPotion() {
      if (!this.playerMaxMp) {
        this.renderBattleMenu("YOUR CLASS DOES NOT USE MP.");
        return;
      }
      if (this.save.manaPotions <= 0) {
        this.renderBattleMenu("YOU HAVE NO MANA POTIONS.");
        return;
      }
      if (this.playerMp >= this.playerMaxMp) {
        this.renderBattleMenu("YOUR MP IS ALREADY FULL.");
        return;
      }
      this.save.manaPotions--;
      this.playerMp=Math.min(this.playerMaxMp,this.playerMp+6);
      this.save.playerMp=this.playerMp;
      saveGame(this.save);
      this.updateHud();
      this.battleEnemyTurn("You drink a mana potion and restore 6 MP.");
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
      this.save.chapterStage = "village";
      this.save.playerHp = this.getClassStats().hp;
      saveGame(this.save);
      this.blocked.delete("29,7");
      this.blocked.delete("29,8");
      this.openDialogue([
        "A horn screams from the eastern field.",
        "Goblins pour between the houses. Smoke rises above Dunmere.",
        "MARA: Take up your weapon! The east path leads to the attack!"
      ]);
    }

    buildRaid(entry="south") {
      this.prepareCombat("raid", 9, entry === "north" ? 2 : 12, "Defend Dunmere");
      if (!["road","castle","complete"].includes(this.save.chapterStage)) this.save.chapterStage="raid";
      saveGame(this.save);
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
      this.blocked.delete("9,14");
      this.blocked.delete("10,14");
      if (this.save.raidCleared) {
        this.blocked.delete("9,0");
        this.blocked.delete("10,0");
      } else {
        [[5,6],[15,6],[6,10],[13,9]].forEach(([x,y],i)=>this.spawnEnemy("raid-"+i,"goblin",x,y,7,2,"Ashfang Goblin"));
      }
      this.createCombatHero();
      if (!this.save.raidCleared) this.openDialogue(["Defend Dunmere! Face an enemy and press Z to attack."]);
      else this.openDialogue(["The northern path follows the fleeing Ashfangs into the coastwood."]);
    }

    buildRoad(entry="west") {
      this.prepareCombat("road", entry === "east" ? 17 : 2, 8, "Follow the raiders");
      if (this.save.chapterStage !== "castle") this.save.chapterStage="road";
      this.save.playerHp=this.getClassStats().hp; saveGame(this.save);
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
      this.blocked.delete("0,7");
      this.blocked.delete("0,8");
      if (this.save.roadCleared) {
        this.blocked.delete("19,7");
        this.blocked.delete("19,8");
      } else {
        [[7,8],[12,7]].forEach(([x,y],i)=>this.spawnEnemy("road-"+i,"goblin",x,y,8,2,"Goblin Scout"));
        this.spawnEnemy("road-orc","orc",16,8,12,3,"Ashfang Orc");
      }
      this.createCombatHero();
      if (!this.save.roadCleared) this.openDialogue([
        "You follow black-fletched arrows into the old coastwood.",
        "Beyond the trees, the ruined towers of Greywatch Castle rise through the mist."
      ]);
      else this.openDialogue(["The road east ends at Greywatch's shattered gate."]);
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
      if(index===9 && !this.save.clearedRooms.includes(9)) {
        block(9,0,2,1);
        g.fillStyle(0x343b42).fillRect(9*T,0,2*T,T);
      }
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

      // Persistent per-save encounters also reserve their tiles from randomized chests.
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
      const reservedEnemyTiles=encounters.map(([,x,y])=>[x,y]);

      // Every save receives deterministic randomized chest locations.
      const genericLoot=["watch_blade","quilted_jack","saint_token","marsh_boots","jailer_ring","tempered_hatchet","hearth_charm","scribe_lens","captain_mantle",null];
      const genericItem=genericLoot[index];
      if(genericItem) {
        const pos=this.getSeededChestPosition(genericItem,index,reservedEnemyTiles);
        this.spawnLoot(genericItem,pos.x,pos.y);
      }
      const classTreasures={
        Fighter:{room:1,id:"greywatch_buckler"},
        Ranger:{room:3,id:"hawk_quiver"},
        Rogue:{room:4,id:"nightglass_dirk"},
        Cleric:{room:6,id:"dawn_reliquary"},
        Wizard:{room:7,id:"violet_spellshard"}
      };
      const classTreasure=classTreasures[this.save.className];
      if(classTreasure&&classTreasure.room===index) {
        const pos=this.getSeededChestPosition(classTreasure.id,index,reservedEnemyTiles);
        this.spawnLoot(classTreasure.id,pos.x,pos.y);
      }

      const cleared=this.save.clearedRooms.includes(index);
      if(!cleared) {
        encounters.forEach(([type,x,y,hp,damage],i)=>{
          const id=index===9&&type==="hobgoblin"?"varkul":"room-"+index+"-"+i;
          const name=id==="varkul"?"Commander Varkul":(type==="orc"?"Ashfang Reaver":"Ashfang Goblin");
          this.spawnEnemy(id,type,x,y,hp,damage,name);
        });
      }

      this.createCombatHero();
      const roomLabel=this.add.text(18,18,(index+1)+"/10  "+room.name,{
        fontFamily:"Silkscreen, monospace",fontSize:"14px",fontStyle:"bold",color:"#ffefc1",resolution: 24,
        backgroundColor:"#182847",padding:{x:8,y:5}
      }).setDepth(72).setScrollFactor(0);
      if(!cleared) this.openDialogue([room.intro,index<9?"Defeat the guards, then take the northern passage.":"Defeat Varkul and end the Ashfang raid."]);
    }


    beginChapterTwo() {
      if(!Array.isArray(this.save.clearedChapterTwoRooms)) this.save.clearedChapterTwoRooms=[];
      this.save.chapterTwoStarted=true;
      this.save.chapterStage="chapter2";
      this.save.chapterTwoRoom=Math.max(0,Math.min(19,this.save.chapterTwoRoom || 0));
      const stats=this.getClassStats();
      this.save.playerHp=stats.hp;
      this.save.playerMp=stats.mp || 0;
      saveGame(this.save);
      this.buildChapterTwoRoom(this.save.chapterTwoRoom,"south");
    }

    buildChapterTwoRoom(index, entry="south") {
      const rooms=[
        {name:"THE NORTHBOUND GATE",region:"BLACKPINE ROAD",floor:0x405642,accent:0xb7d1b0,intro:"Beyond Dunmere, Malrec's violet trail vanishes into the Blackpine wilds."},
        {name:"BLACKPINE VERGE",region:"BLACKPINE ROAD",floor:0x354c3d,accent:0x6f9b69,intro:"Ancient pines crowd the road. Bootprints and drag marks lead north."},
        {name:"HUNTER'S FORD",region:"BLACKPINE ROAD",floor:0x3d5556,accent:0x64a4bd,intro:"Cold water rushes over a broken ford while raiders guard the stones."},
        {name:"THE HANGING STONES",region:"BLACKPINE ROAD",floor:0x465346,accent:0x9b8f6d,intro:"Runes burn on standing stones older than Dunmere."},
        {name:"CAMP OF CROWS",region:"BLACKPINE ROAD",floor:0x4d4b3d,accent:0xa84b4b,intro:"Malrec's scouts have made camp beneath a sky black with crows."},
        {name:"MOONFALL COURTYARD",region:"MOONFALL ABBEY",floor:0x5a5b61,accent:0xc3c7dd,intro:"The ruined abbey rises from the forest, its silver doors torn open."},
        {name:"HALL OF SAINTS",region:"MOONFALL ABBEY",floor:0x62616a,accent:0xe6d59a,intro:"Headless saints watch cultists deface the old mosaics."},
        {name:"THE SCRIPTORIUM",region:"MOONFALL ABBEY",floor:0x585463,accent:0x76558f,intro:"Violet formulae crawl across books that should have turned to dust."},
        {name:"BELL TOWER CRYPT",region:"MOONFALL ABBEY",floor:0x4b5058,accent:0x8d99a6,intro:"The abbey bell tolls below ground though no hand pulls its rope."},
        {name:"THE BROKEN RELIQUARY",region:"MOONFALL ABBEY",floor:0x55515d,accent:0xffd166,intro:"A shattered altar hides a stair descending into red-lit stone."},
        {name:"EMBERDEEP DESCENT",region:"EMBERDEEP",floor:0x493f3b,accent:0xf08b45,intro:"Heat rolls up the mine stair. Chains vanish into the dark."},
        {name:"SULFUR GALLERY",region:"EMBERDEEP",floor:0x51483c,accent:0xe6b85c,intro:"Yellow crystals hiss beside pools of boiling water."},
        {name:"THE CHAIN BRIDGE",region:"EMBERDEEP",floor:0x3e4146,accent:0xc17a55,intro:"A narrow bridge sways above a river of fire."},
        {name:"FURNACE VAULT",region:"EMBERDEEP",floor:0x4d403b,accent:0xd9553f,intro:"Enchanted furnaces hammer weapons for Malrec's gathering army."},
        {name:"THE ASHEN RESERVOIR",region:"EMBERDEEP",floor:0x45484b,accent:0x9aa6aa,intro:"A black lake mirrors the impossible tower above it."},
        {name:"BLACKGLASS GATE",region:"BLACKGLASS SPIRE",floor:0x353647,accent:0x76558f,intro:"The spire's gate opens like a wound in polished black stone."},
        {name:"HALL OF MIRRORS",region:"BLACKGLASS SPIRE",floor:0x424255,accent:0xb09bc4,intro:"Each mirror shows a coast already kneeling to Malrec."},
        {name:"VIOLET LABORATORY",region:"BLACKGLASS SPIRE",floor:0x3f394f,accent:0x9f6cc1,intro:"Bottled lightning feeds a map of the Lantern Coast."},
        {name:"THE HIGH OBSERVATORY",region:"BLACKGLASS SPIRE",floor:0x343849,accent:0x6f8fc8,intro:"Stars turn overhead in patterns no mortal sky should hold."},
        {name:"MALREC'S SANCTUM",region:"BLACKGLASS SPIRE",floor:0x302f42,accent:0xc56cff,intro:"Malrec waits before a crown of violet flame, his conquest ritual nearly complete."}
      ];
      index=Math.max(0,Math.min(19,index));
      const room=rooms[index], heroX=9, heroY=entry==="north"?2:12;
      this.prepareCombat("chapter2",heroX,heroY,"Cross "+room.name);
      this.chapterTwoRoom=index;
      this.save.chapterTwoRoom=index;
      this.save.chapterStage="chapter2";
      if(!Array.isArray(this.save.clearedChapterTwoRooms)) this.save.clearedChapterTwoRooms=[];
      saveGame(this.save);

      const g=this.add.graphics(),T=TILE;
      const block=(x,y,w=1,h=1)=>{for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) this.blocked.add(xx+","+yy);};
      const prop=(x,y,color=0x343b42)=>{
        block(x,y);
        g.fillStyle(0x151b23,0.45).fillEllipse(x*T+25,y*T+38,42,12);
        g.fillStyle(color).fillRect(x*T+7,y*T+7,34,34);
        g.lineStyle(3,room.accent,0.7).strokeRect(x*T+10,y*T+10,28,28);
      };
      for(let y=0;y<15;y++) for(let x=0;x<20;x++) {
        const shade=(x*17+y*11+index)%3;
        const color=shade===0?room.floor:(shade===1?Phaser.Display.Color.IntegerToColor(room.floor).darken(7).color:Phaser.Display.Color.IntegerToColor(room.floor).lighten(5).color);
        g.fillStyle(color).fillRect(x*T,y*T,T,T);
        g.lineStyle(2,0x202632,0.48).strokeRect(x*T,y*T,T,T);
        if((x*7+y*13+index)%11===0) {
          g.fillStyle(room.accent,0.18).fillCircle(x*T+12,y*T+30,7);
          g.fillStyle(room.accent,0.28).fillRect(x*T+8,y*T+36,26,3);
        }
      }
      for(let x=0;x<20;x++){block(x,0);block(x,14);}
      for(let y=0;y<15;y++){block(0,y);block(19,y);}
      g.fillStyle(0x202632).fillRect(0,0,MAP_WIDTH,T).fillRect(0,14*T,MAP_WIDTH,T).fillRect(0,0,T,MAP_HEIGHT).fillRect(19*T,0,T,MAP_HEIGHT);
      for(let x=0;x<20;x++) {
        g.lineStyle(3,room.accent,0.35).strokeRect(x*T+3,3,T-6,T-6);
        g.lineStyle(3,room.accent,0.35).strokeRect(x*T+3,14*T+3,T-6,T-6);
      }
      for(const doorX of [9,10]) {
        this.blocked.delete(doorX+",0"); this.blocked.delete(doorX+",14");
        g.fillStyle(0x111722).fillRect(doorX*T,0,T,T).fillRect(doorX*T,14*T,T,T);
        g.fillStyle(room.accent).fillRect(doorX*T+5,T-7,T-10,5).fillRect(doorX*T+5,14*T+2,T-10,5);
      }
      const cleared=this.save.clearedChapterTwoRooms.includes(index);
      if(index===19&&!cleared){block(9,0,2,1);g.fillStyle(0x76558f).fillRect(9*T,0,2*T,T);}

      // Region-specific landmarks make every five-room act visually distinct.
      const region=Math.floor(index/5);
      if(region===0) {
        for(const [x,y] of [[2,3],[17,3],[3,10],[16,11],[5,5],[14,6]]) {
          block(x,y); g.fillStyle(0x26392f).fillCircle(x*T+24,y*T+20,25);
          g.fillStyle(0x49724d).fillTriangle(x*T+2,y*T+27,x*T+24,y*T-10,x*T+46,y*T+27);
          g.fillStyle(0x5b3b2f).fillRect(x*T+20,y*T+23,8,25);
        }
        g.fillStyle(0x8a7357).fillRect(T,7*T+18,18*T,12);
      } else if(region===1) {
        for(const [x,y] of [[3,3],[16,3],[3,11],[16,11]]) prop(x,y,0x6b6d75);
        g.lineStyle(5,0xd8cfad,0.32).strokeCircle(10*T,7*T,92);
        g.fillStyle(room.accent,0.18).fillCircle(10*T,7*T,70);
      } else if(region===2) {
        for(const [x,y] of [[2,4],[17,4],[3,11],[16,10]]) {
          block(x,y); g.fillStyle(0x2b2221).fillRect(x*T+4,y*T+8,40,36);
          g.fillStyle(0xd9553f,0.65).fillCircle(x*T+24,y*T+22,15);
          g.fillStyle(0xffd166).fillCircle(x*T+24,y*T+22,6);
        }
        g.fillStyle(0xd9553f,0.25).fillRect(T,7*T+34,18*T,8);
      } else {
        for(const [x,y] of [[3,3],[16,3],[3,11],[16,11],[6,7],[13,7]]) {
          block(x,y); g.fillStyle(0x151525).fillRect(x*T+5,y*T+3,38,42);
          g.fillStyle(room.accent,0.55).fillRect(x*T+11,y*T+7,26,34);
          g.fillStyle(0xe7dcff,0.3).fillRect(x*T+15,y*T+9,5,28);
        }
        g.lineStyle(4,room.accent,0.42).strokeCircle(10*T,7*T,76);
      }

      const encounters=[
        [["goblin",7,7,13,3],["goblin",13,7,13,3]],
        [["goblin",6,6,14,3],["orc",13,9,20,4]],
        [["orc",7,6,21,4],["goblin",13,10,15,3]],
        [["cultist",10,6,18,4]],
        [["orc",6,8,22,4],["cultist",14,8,19,4]],
        [["cultist",7,6,20,4],["goblin",13,9,16,3]],
        [["cultist",6,7,21,4],["cultist",14,7,21,4]],
        [["hobgoblin",10,6,25,5],["cultist",10,10,21,4]],
        [["cultist",7,5,22,5],["orc",13,9,24,5]],
        [["hobgoblin",7,8,27,5],["cultist",13,8,23,5]],
        [["orc",7,6,25,5],["cultist",13,9,24,5]],
        [["cultist",6,7,25,5],["cultist",14,7,25,5]],
        [["hobgoblin",10,6,29,6],["orc",10,10,27,5]],
        [["orc",6,8,28,6],["orc",14,8,28,6],["cultist",10,5,25,5]],
        [["hobgoblin",7,7,31,6],["cultist",13,7,27,6]],
        [["cultist",7,6,28,6],["hobgoblin",13,9,32,6]],
        [["cultist",6,7,29,6],["cultist",14,7,29,6]],
        [["hobgoblin",7,9,34,7],["cultist",13,6,31,6]],
        [["cultist",6,8,32,7],["hobgoblin",14,8,36,7],["cultist",10,5,32,7]],
        [["cultist",6,9,34,7],["cultist",14,9,34,7],["malrec",10,4,60,8]]
      ][index];
      const reserved=encounters.map(([,x,y])=>[x,y]);
      const loot=["blackpine_sabre",null,"warded_coat",null,"raven_cloak","pilgrim_boots",null,"mirror_shield",null,"sapphire_focus","ember_maul",null,"rune_mail",null,"starstep_boots","spellguard_shield",null,"shadow_mantle",null,null][index];
      if(loot){const p=this.getSeededChestPosition(loot,100+index,reserved);this.spawnLoot(loot,p.x,p.y);}
      const classLoot={
        Fighter:{room:5,id:"lionguard_shield"},Ranger:{room:9,id:"storm_quiver"},
        Rogue:{room:12,id:"duskfang"},Cleric:{room:15,id:"solar_icon"},Wizard:{room:17,id:"malrec_grimoire"}
      };
      const special=classLoot[this.save.className];
      if(special&&special.room===index){const p=this.getSeededChestPosition(special.id,100+index,reserved);this.spawnLoot(special.id,p.x,p.y);}

      if(!cleared) encounters.forEach(([type,x,y,hp,damage],i)=>{
        const id=index===19&&type==="malrec"?"malrec":"chapter2-"+index+"-"+i;
        const name=id==="malrec"?"Malrec the Violet":(type==="cultist"?"Violet Acolyte":(type==="hobgoblin"?"Blackglass Captain":(type==="orc"?"Ashfang Veteran":"Blackpine Goblin")));
        this.spawnEnemy(id,type,x,y,hp,damage,name);
      });
      this.createCombatHero();
      this.add.text(18,18,(index+1)+"/20  "+room.region+"  ·  "+room.name,{
        fontFamily:"Silkscreen, monospace",fontSize:"13px",fontStyle:"bold",color:"#ffefc1",resolution:24,
        backgroundColor:"#182847",padding:{x:8,y:5}
      }).setDepth(72).setScrollFactor(0);
      if(!cleared) this.openDialogue([room.intro,index<19?"Defeat the guards and continue north.":"Defeat Malrec and break the conquest ritual."]);
    }

    onCombatCleared() {
      this.save.playerHp=this.playerMaxHp;
      if(this.area==="raid") {
        this.save.raidCleared=true;
        this.blocked.delete("9,0");
        this.blocked.delete("10,0");
        saveGame(this.save);
        this.openDialogue([
          "The last goblin falls. Dunmere still stands.",
          "NELL: They fled north toward Greywatch with prisoners and supplies.",
          "The northern path is now open. Follow it when you are ready."
        ]);
      } else if(this.area==="road") {
        this.save.roadCleared=true;
        this.blocked.delete("19,7");
        this.blocked.delete("19,8");
        saveGame(this.save);
        this.openDialogue([
          "The final scout is defeated.",
          "Through the trees, Greywatch's shattered gate stands open.",
          "The eastern road is clear. Walk through the gate when you are ready."
        ]);
      } else if(this.area==="chapter2") {
        if(!Array.isArray(this.save.clearedChapterTwoRooms)) this.save.clearedChapterTwoRooms=[];
        if(!this.save.clearedChapterTwoRooms.includes(this.chapterTwoRoom)) this.save.clearedChapterTwoRooms.push(this.chapterTwoRoom);
        this.save.chapterTwoRoom=this.chapterTwoRoom;
        this.save.playerHp=this.playerHp;
        if(this.chapterTwoRoom===19){this.blocked.delete("9,0");this.blocked.delete("10,0");}
        saveGame(this.save);
        this.openDialogue(this.chapterTwoRoom===19 ? [
          "Malrec falls and the violet crown shatters into harmless sparks.",
          "Across the Lantern Coast, his war banners burn to ash.",
          "The northern arch opens. Step through when you are ready."
        ] : [
          "The way forward is clear.",
          "Malrec\'s trail continues north through "+(this.chapterTwoRoom<4?"Blackpine":this.chapterTwoRoom<9?"Moonfall Abbey":this.chapterTwoRoom<14?"Emberdeep":"Blackglass Spire")+"."
        ]);
      } else if(this.area==="dungeon") {
        if(!Array.isArray(this.save.clearedRooms)) this.save.clearedRooms=[];
        if(!this.save.clearedRooms.includes(this.dungeonRoom)) this.save.clearedRooms.push(this.dungeonRoom);
        this.save.dungeonRoom=this.dungeonRoom;
        this.save.playerHp=this.playerHp;
        if(this.dungeonRoom===9) {
          this.blocked.delete("9,0");
          this.blocked.delete("10,0");
        }
        saveGame(this.save);
        this.openDialogue(this.dungeonRoom===9 ? [
          "Varkul falls. The northern door opens behind the throne.",
          "Beyond it waits the proof of who commanded the Ashfangs.",
          "Leave through the door when you are ready."
        ] : [
          "The room falls silent.",
          "The northern passage is now clear.",
          "Greywatch continues deeper into the rock."
        ]);
      }
    }

    restartCombatArea() {
      this.save.playerHp=this.getClassStats().hp; saveGame(this.save);
      if(this.area==="raid") this.buildRaid();
      else if(this.area==="road") this.buildRoad();
      else if(this.area==="dungeon") this.buildDungeonRoom(this.dungeonRoom,"south");
      else if(this.area==="chapter2") this.buildChapterTwoRoom(this.chapterTwoRoom,"south");
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
      this.text(80,126,"Z: BEGIN CHAPTER TWO   X: TITLE",5,"#ffd166",0.5);
      this.openDialogue([
        "Varkul falls. In his war chest you find orders sealed in violet wax.",
        "The Ashfangs served a wizard called Malrec, who is gathering armies to conquer the Lantern Coast.",
        "You return to Dunmere as its defender—but your first adventure has only revealed a greater threat."
      ]);
    }

    showChapterTwoEnding() {
      this.clearScene();
      this.mode="ending2";
      this.cameras.main.setBackgroundColor(0x141426);
      const g=this.add.graphics();
      g.fillStyle(0x141426).fillRect(0,0,WIDTH,HEIGHT);
      g.fillStyle(0x302f42).fillCircle(240,145,118);
      g.fillStyle(0x76558f,0.5).fillCircle(240,145,84);
      g.fillStyle(0xffd166).fillCircle(240,145,46);
      g.fillStyle(0xffefc1).fillCircle(240,145,30);
      g.lineStyle(6,0xc56cff,0.75).strokeCircle(240,145,66);
      this.text(80,20,"THE VIOLET CROWN FALLS",9,"#ffd166",0.5);
      this.text(80,92,"THE SHATTERED SIGIL",8,"#ffefc1",0.5);
      this.text(80,108,"CHAPTER TWO COMPLETE",6,"#b7d1b0",0.5);
      this.text(80,126,"Z: RETURN TO TITLE",5,"#ffd166",0.5);
      this.openDialogue([
        "Malrec's spell breaks. Dawn reaches Blackglass Spire for the first time in a generation.",
        "The armies he gathered scatter, and the settlements of the Lantern Coast ring their bells.",
        "You return to the Lost Light no longer an untested orphan, but a hero with a name of your own."
      ]);
    }

    pressed(...keys) {
      return keys.some(k => Phaser.Input.Keyboard.JustDown(k));
    }

    update() {
      if (this.mode === "title") {
        if (this.pressed(this.keys.left, this.keys.a, this.keys.up, this.keys.w)) {
          this.selectSaveSlot(-1);
          return;
        }
        if (this.pressed(this.keys.right, this.keys.d, this.keys.down, this.keys.s)) {
          this.selectSaveSlot(1);
          return;
        }
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.startGame();
        if (this.pressed(this.keys.r) && this.save.className) {
          localStorage.removeItem(saveKey(activeSaveSlot));
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
        else if (this.pressed(this.keys.left, this.keys.a)) this.moveInventoryTab(-1);
        else if (this.pressed(this.keys.right, this.keys.d)) this.moveInventoryTab(1);
        else if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.activateInventoryItem();
        else if (this.pressed(this.keys.x, this.keys.esc, this.keys.i)) this.closeInventoryMenu();
        return;
      }

      if (this.mode === "shop") {
        if (this.pressed(this.keys.up, this.keys.w)) this.moveShopCursor(-1);
        else if (this.pressed(this.keys.down, this.keys.s)) this.moveShopCursor(1);
        else if (this.pressed(this.keys.left, this.keys.a)) this.moveShopTab(-1);
        else if (this.pressed(this.keys.right, this.keys.d)) this.moveShopTab(1);
        else if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.chooseShopAction();
        else if (this.pressed(this.keys.x, this.keys.esc)) this.closeShopMenu();
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
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.beginChapterTwo();
        else if (this.pressed(this.keys.x, this.keys.esc)) this.showTitle();
        return;
      }
      if (this.mode === "ending2") {
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space, this.keys.x, this.keys.esc)) this.showTitle();
        return;
      }

      if (this.mode !== "world") return;
      this.syncHeroEquipmentVisuals();
      if (this.checkEnemyEngagement()) return;
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
    resolution: Math.min(Math.max((window.devicePixelRatio || 1) * 3, 6), 8),
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
