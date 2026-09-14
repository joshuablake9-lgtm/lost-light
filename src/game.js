(() => {
  "use strict";

  const WIDTH = 160;
  const HEIGHT = 144;
  const TILE = 16;
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
      const makePerson = (key, coat, hair = COLORS.ink) => {
        const g = this.make.graphics({ add: false });
        g.fillStyle(COLORS.ink);
        g.fillRect(4, 1, 8, 2).fillRect(3, 3, 10, 6);
        g.fillStyle(hair);
        g.fillRect(4, 2, 8, 3).fillRect(3, 5, 3, 4).fillRect(10, 5, 3, 4);
        g.fillStyle(COLORS.cream);
        g.fillRect(5, 5, 6, 5);
        g.fillStyle(COLORS.ink);
        g.fillRect(6, 7, 1, 1).fillRect(9, 7, 1, 1).fillRect(3, 11, 10, 10);
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
      return this.add.text(x, y, value, {
        fontFamily: '"Courier New", monospace',
        fontSize: size + "px",
        fontStyle: "bold",
        color,
        resolution: 2,
        lineSpacing: 1
      }).setOrigin(origin).setDepth(20).setScrollFactor(0);
    }

    showTitle() {
      this.clearScene();
      this.mode = "title";
      const bg = this.add.graphics();
      bg.fillStyle(COLORS.ink).fillRect(0, 0, WIDTH, HEIGHT);
      bg.fillStyle(0x213b52).fillRect(0, 92, WIDTH, 52);
      bg.fillStyle(0x31566a).fillTriangle(0, 92, 36, 62, 70, 92);
      bg.fillTriangle(45, 92, 100, 48, 150, 92);
      bg.fillStyle(0x101b32).fillRect(0, 112, WIDTH, 32);
      bg.fillStyle(COLORS.gold).fillRect(76, 58, 8, 24);
      bg.fillStyle(COLORS.white).fillRect(78, 59, 4, 13);
      bg.fillStyle(COLORS.red).fillRect(79, 60, 2, 8);

      this.text(80, 20, "LOST LIGHT", 14, "#ffd166", 0.5)
        .setShadow(2, 2, "#8b3a3a", 0, false, true);
      this.text(80, 38, "A TALE OF THE LANTERN COAST", 6, "#b7d1b0", 0.5);
      this.text(80, 104, this.save.className ? "CONTINUE" : "NEW GAME", 7, "#fff7d6", 0.5);
      this.text(80, 118, "PRESS Z OR ENTER", 6, "#e6b85c", 0.5);
      if (this.save.className) {
        this.text(80, 128, "R: ERASE SAVE", 5, "#89a39a", 0.5);
      }
      this.tweens.add({
        targets: this.children.list[this.children.list.length - (this.save.className ? 2 : 1)],
        alpha: { from: 1, to: 0.25 }, duration: 650, yoyo: true, repeat: -1
      });
    }

    startGame() {
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
      for (let y = 2; y < 15; y++) {
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

      this.hero = this.add.sprite(this.heroTile.x * TILE + 8, this.heroTile.y * TILE + 4, "hero")
        .setDepth(10);

      this.npcs = MENTORS.map(m => {
        const sprite = this.add.sprite(m.x * TILE + 8, m.y * TILE + 4, m.id).setDepth(9);
        this.blocked.add(m.x + "," + m.y);
        return { ...m, sprite };
      });

      const innkeeper = {
        id: "innkeeper", name: "Mara", x: 9, y: 4, color: COLORS.timber,
        intro: this.save.className
          ? ["MARA: There you are, birthday boy.", "Your breakfast is getting cold.", "Go on. Everyone has something to say before the celebration."]
          : ["MARA: Happy birthday.", "Everyone who helped raise you came early.", "Speak with them. Today you decide what path you'll walk."],
        sprite: this.add.sprite(9 * TILE + 8, 4 * TILE + 4, "fighter").setTint(0xc99157).setDepth(9)
      };
      this.npcs.push(innkeeper);
      this.blocked.add("9,4");

      this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
      this.cameras.main.startFollow(this.hero, true, 0.18, 0.18);
      this.cameras.main.setDeadzone(40, 32);

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

    drawFurniture(g) {
      const rect = (x, y, w, h, color = COLORS.timber) => {
        g.fillStyle(color).fillRect(x * TILE, y * TILE, w * TILE, h * TILE);
        for (let yy = y; yy < y + h; yy++) {
          for (let xx = x; xx < x + w; xx++) this.blocked.add(xx + "," + yy);
        }
      };
      rect(3, 3, 4, 1);
      rect(12, 3, 4, 1);
      rect(8, 3, 3, 1, 0x6e3e32);
      rect(3, 8, 3, 2);
      rect(14, 12, 3, 1);
      rect(8, 8, 2, 1);
      g.fillStyle(COLORS.gold).fillRect(8 * TILE, 8 * TILE, 2 * TILE, TILE);
      this.add.sprite(9 * TILE, 8 * TILE + 8, "flame").setDepth(3);
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

      this.dialoguePanel = this.add.graphics().setDepth(50).setScrollFactor(0);
      this.dialoguePanel.fillStyle(COLORS.cream).fillRect(3, 86, 154, 55);
      this.dialoguePanel.fillStyle(COLORS.ink).fillRect(6, 89, 148, 49);
      this.dialoguePanel.lineStyle(1, COLORS.gold).strokeRect(5, 88, 150, 51);
      this.dialogueText = this.text(10, 94, this.wrap(this.dialogue[this.dialogueIndex], 31), 7, "#fff7d6")
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

      if (npc.id === "innkeeper") {
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
      this.choicePanel = this.add.graphics().setDepth(55).setScrollFactor(0);
      this.choicePanel.fillStyle(COLORS.cream).fillRect(24, 45, 112, 50);
      this.choicePanel.fillStyle(COLORS.ink).fillRect(27, 48, 106, 44);
      this.text(80, 54, npc.className.toUpperCase(), 8, "#ffd166", 0.5).setData("choice", true);
      this.text(80, 68, npc.boon, 6, "#fff7d6", 0.5).setData("choice", true);
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
      const nx = this.heroTile.x + dx;
      const ny = this.heroTile.y + dy;
      if (this.blocked.has(nx + "," + ny)) return;
      this.heroTile = { x: nx, y: ny };
      this.busy = true;
      this.tweens.add({
        targets: this.hero,
        x: nx * TILE + 8,
        y: ny * TILE + 4,
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
    width: WIDTH,
    height: HEIGHT,
    parent: "game",
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#182847",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [LostLightScene]
  }));
})();
