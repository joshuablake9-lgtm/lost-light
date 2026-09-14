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

          g.generateTexture(key + "-" + direction, 24, 32);
          g.destroy();
        });
      };

      makePerson("hero", 0x3f6380, 0x5b352d, "hero");
      MENTORS.forEach(m => makePerson(m.id, m.color, 0x2c2730, m.id));
      makePerson("mara", 0x9b6647, 0x6b3e32, "innkeeper");
      makePerson("villager-a", 0x7c5b8f, 0x4b302a, "villager");
      makePerson("villager-b", 0x477b9d, 0xb88755, "villager");
      makePerson("villager-c", 0x5f8b62, 0x372d2c, "villager");

      const flame = this.make.graphics({ add: false });
      flame.fillStyle(COLORS.red).fillRect(4, 7, 8, 8);
      flame.fillStyle(COLORS.gold).fillRect(6, 3, 5, 10);
      flame.fillStyle(COLORS.white).fillRect(7, 7, 3, 6);
      flame.generateTexture("flame", 16, 16);
      flame.destroy();
    }

    clearScene() {
      this.children.removeAll(true);
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0);
      this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
      this.dialogue = null;
      this.busy = false;
      this.npcs = [];
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
      this.scale.resize(WIDTH, HEIGHT);
      this.cameras.main.setSize(WIDTH, HEIGHT);
      this.cameras.main.setViewport(0, 0, WIDTH, HEIGHT);
      this.cameras.main.setScroll(0, 0);
      this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
      if (this.save.className) {
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

      for (let x = 1; x < 19; x++) {
          g.fillStyle((x + y) % 2 ? COLORS.floorA : COLORS.floorB);
          g.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
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

      this.drawFurniture(g);
      this.text(80, 4, "LOST LIGHT INN · MORNING", 6, "#ffefc1", 0.5);

      this.hero = this.add.sprite(this.heroTile.x * TILE + 24, this.heroTile.y * TILE + 12, "hero-down")
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
      const block = (x,y,w=1,h=1) => {
        for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) this.blocked.add(xx+","+yy);
      };

      // Layered grass with small deterministic details.
      for(let y=0;y<15;y++) for(let x=0;x<20;x++) {
        const px=x*T,py=y*T;
        g.fillStyle((x+y)%3===0?0x709c60:((x+y)%2?0x659254:0x78a566)).fillRect(px,py,T,T);
        g.fillStyle(0x4d7a49,0.65).fillRect(px+7,py+13,13,3).fillRect(px+31,py+34,9,3);
        if((x*7+y*11)%8===0) {
          g.fillStyle(0xf0d36b).fillRect(px+23,py+20,5,5);
          g.fillStyle(0xf1e5bd).fillRect(px+20,py+22,11,2);
        }
      }

      // Sea, surf, cliffs and dock.
      for(let y=0;y<15;y++) {
        for(let x=0;x<4;x++) {
          g.fillStyle((x+y)%2?0x34778b:0x2c6980).fillRect(x*T,y*T,T,T);
          g.fillStyle(0x91cbc1,0.75).fillRect(x*T+8,y*T+15,27,3);
          block(x,y);
        }
        g.fillStyle(0x5d6260).fillRect(4*T,y*T,15,T);
        g.fillStyle(0x9b927a).fillRect(4*T+15,y*T,7,T);
        block(4,y);
      }
      for(let x=1;x<6;x++) {
        g.fillStyle(0x4d352f).fillRect(x*T,9*T+8,T,33);
        g.fillStyle(0xa26e48).fillRect(x*T,9*T+8,T-3,7);
        this.blocked.delete(x+",9");
      }

      // Roads and the village square.
      for(let y=0;y<15;y++) for(const x of [8,9,10]) {
        g.fillStyle((x+y)%2?0xb99b6b:0xc8aa78).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x897357).fillEllipse(x*T+15,y*T+19,8,5);
      }
      for(let y=6;y<10;y++) for(let x=5;x<19;x++) {
        g.fillStyle((x+y)%2?0xc2a371:0xb49364).fillRect(x*T,y*T,T,T);
        g.fillStyle(0x856e52).fillEllipse(x*T+35,y*T+32,7,4);
      }

      const house=(x,y,w,h,wall,roof,doorX)=>{
        const px=x*T,py=y*T,pw=w*T,ph=h*T;
        g.fillStyle(0x252631,0.35).fillRect(px+12,py+15,pw,ph);
        g.fillStyle(wall).fillRect(px,py+T,pw,ph-T);
        g.fillStyle(roof).fillTriangle(px-13,py+T+10,px+pw/2,py-18,px+pw+13,py+T+10);
        g.fillStyle(0x382c30).fillRect(px,py+T+6,pw,8);
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

      for(let x=0;x<20;x++){block(x,0);block(x,14);}
      for(let y=0;y<15;y++) block(19,y);
      this.blocked.delete("9,4");

      this.text(80,4,"DUNMERE · LANTERN COAST",6,"#ffefc1",0.5);
      this.text(4,127,"VILLAGE SQUARE",5,"#ffd166");
      this.text(156,127,"Z: TALK",5,"#d7dfc4",1);
      this.hero=this.add.sprite(9*T+24,5*T+12,"hero-down").setDepth(10).setScale(2);

      const villagers=[
        {id:"village-elin",x:7,y:7,texture:"villager-a-down",intro:["ELIN: Happy birthday!","Mara has half the village preparing your supper.","Stay near the square. Something has the gulls frightened."]},
        {id:"village-tomas",x:14,y:8,texture:"villager-b-down",intro:["TOMAS: The northern road is too quiet.","No caravans have arrived since yesterday.","Captain Brann should hear about it."]},
        {id:"village-nell",x:8,y:10,texture:"villager-c-down",intro:["NELL: I found black-fletched arrows by the east field.","They weren't made in Dunmere.","Maybe goblins are ranging farther south."]}
      ];
      this.npcs=villagers.map(n=>{
        block(n.x,n.y);
        return {...n,sprite:this.add.sprite(n.x*T+24,n.y*T+12,n.texture).setDepth(9).setScale(2)};
      });
      this.cameras.main.setBounds(0,0,MAP_WIDTH,MAP_HEIGHT);
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
      const npc = this.npcs.find(n => n.x === targetX && n.y === targetY);
      if (!npc) {
        this.openDialogue(["Nothing here but old floorboards and the smell of breakfast."]);
        return;
      }

      if (npc.id === "innkeeper" || npc.id.startsWith("village-")) {
        this.openDialogue(npc.intro);
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
      saveGame(this.save);
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
        this.hero.setTexture("hero-up").setFlipX(false);
      } else if (dy > 0) {
        this.hero.setTexture("hero-down").setFlipX(false);
      } else {
        this.hero.setTexture("hero-side").setFlipX(dx < 0);
      }
      const nx = this.heroTile.x + dx;
      const ny = this.heroTile.y + dy;
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
        onComplete: () => { this.busy = false; }
      });
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

      if (this.mode === "choice") {
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.acceptClass();
        else if (this.pressed(this.keys.x, this.keys.esc)) this.clearChoice();
        return;
      }

      if (this.dialogue) {
        if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) this.advanceDialogue();
        return;
      }

      if (this.mode !== "world") return;
      if (this.pressed(this.keys.z, this.keys.enter, this.keys.space)) return this.talk();
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
