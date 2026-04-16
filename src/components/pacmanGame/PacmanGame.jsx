import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import "./pacmanGame.style.css";

const spritesheetKey = "pacman-spritesheet";
const tilesKey = "pacman-tiles";
const pillKey = "pacman-pill";
const lifeKey = "pacman-life";

const spritesheetPath =
  "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/images/pacmansprites.png";
const tilesPath =
  "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/images/background.png";
const mapPath =
  "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/levels/codepen-level.json";

const Animation = {
  Player: {
    Eat: "player-eat",
    Stay: "player-stay",
    Die: "player-die",
  },
  Ghost: {
    Blue: { Move: "ghost-blue-move", frame: 0 },
    Red: { Move: "ghost-red-move", frame: 16 },
    Orange: { Move: "ghost-orange-move", frame: 4 },
    Pink: { Move: "ghost-pink-move", frame: 14 },
  },
};

const gridSize = 32;
const offset = Math.floor(gridSize / 2);

function createAnimations(scene) {
  scene.anims.create({
    key: Animation.Player.Eat,
    frames: scene.anims.generateFrameNumbers(spritesheetKey, {
      start: 9,
      end: 13,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: Animation.Player.Stay,
    frames: [{ key: spritesheetKey, frame: 9 }],
    frameRate: 20,
  });

  scene.anims.create({
    key: Animation.Player.Die,
    frames: scene.anims.generateFrameNumbers(spritesheetKey, {
      start: 6,
      end: 8,
    }),
    frameRate: 10,
  });

  scene.anims.create({
    key: Animation.Ghost.Blue.Move,
    frames: scene.anims.generateFrameNumbers(spritesheetKey, {
      start: 0,
      end: 1,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: Animation.Ghost.Orange.Move,
    frames: scene.anims.generateFrameNumbers(spritesheetKey, {
      start: 4,
      end: 5,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: Animation.Ghost.Pink.Move,
    frames: scene.anims.generateFrameNumbers(spritesheetKey, {
      start: 14,
      end: 15,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: Animation.Ghost.Red.Move,
    frames: scene.anims.generateFrameNumbers(spritesheetKey, {
      start: 16,
      end: 17,
    }),
    frameRate: 10,
    repeat: -1,
  });
}

function makeDirections(map, layer, sprite) {
  const directions = [];
  const sx = Phaser.Math.FloorTo(sprite.x);
  const sy = Phaser.Math.FloorTo(sprite.y);
  const currentTile = map.getTileAtWorldXY(sx, sy, true);
  if (currentTile) {
    const x = currentTile.x;
    const y = currentTile.y;
    directions[Phaser.LEFT] = map.getTileAt(x - 1, y, true, layer);
    directions[Phaser.RIGHT] = map.getTileAt(x + 1, y, true, layer);
    directions[Phaser.UP] = map.getTileAt(x, y - 1, true, layer);
    directions[Phaser.DOWN] = map.getTileAt(x, y + 1, true, layer);
  }
  return directions;
}

function turningPoint(map, sprite) {
  const turningPoint = new Phaser.Geom.Point();
  const sx = Phaser.Math.FloorTo(sprite.x);
  const sy = Phaser.Math.FloorTo(sprite.y);
  const currentTile = map.getTileAtWorldXY(sx, sy, true);
  if (currentTile) {
    turningPoint.x = currentTile.pixelX + offset;
    turningPoint.y = currentTile.pixelY + offset;
  }
  return turningPoint;
}

class Ghost {
  constructor(scene, position, anim) {
    this.scene = scene;
    this.sprite = scene.physics.add
      .sprite(position.x, position.y, spritesheetKey, anim.frame)
      .setScale(0.85)
      .setOrigin(0.5);
    this.spawnPoint = position;
    this.anim = anim;
    this.speed = 100;
    this.moveTo = new Phaser.Geom.Point();
    this.safetile = [-1, 19];
    this.directions = [];
    this.opposites = [
      null,
      null,
      null,
      null,
      null,
      Phaser.DOWN,
      Phaser.UP,
      Phaser.RIGHT,
      Phaser.LEFT,
    ];
    this.turning = Phaser.NONE;
    this.current = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    this.threshold = 5;
    this.rnd = new Phaser.Math.RandomDataGenerator();
    this.sprite.anims.play(anim.Move, true);
    this.turnCount = 0;
    this.turnAtTime = [4, 8, 16, 32, 64];
    this.turnAt = this.rnd.pick(this.turnAtTime);
  }

  freeze() {
    this.moveTo = new Phaser.Geom.Point();
    this.current = Phaser.NONE;
  }

  respawn() {
    this.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
    this.sprite.flipX = false;
  }

  moveLeft() {
    this.moveTo.x = -1;
    this.moveTo.y = 0;
    this.sprite.flipX = true;
    this.sprite.angle = 0;
  }

  moveRight() {
    this.moveTo.x = 1;
    this.moveTo.y = 0;
    this.sprite.flipX = false;
    this.sprite.angle = 0;
  }

  moveUp() {
    this.moveTo.x = 0;
    this.moveTo.y = -1;
    this.sprite.angle = 0;
  }

  moveDown() {
    this.moveTo.x = 0;
    this.moveTo.y = 1;
    this.sprite.angle = 0;
  }

  update() {
    this.sprite.setVelocity(
      this.moveTo.x * this.speed,
      this.moveTo.y * this.speed,
    );
    this.turn();
    if (
      this.directions[this.current] &&
      !this.isSafe(this.directions[this.current].index)
    ) {
      this.takeRandomTurn();
    }
  }

  setDirections(directions) {
    this.directions = directions;
  }

  setTurningPoint(turningPoint) {
    this.turningPoint = turningPoint;
  }

  setTurn(turnTo) {
    if (
      !this.directions[turnTo] ||
      this.turning === turnTo ||
      this.current === turnTo ||
      !this.isSafe(this.directions[turnTo].index)
    ) {
      return false;
    }
    if (this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
      this.move(turnTo);
      this.turning = Phaser.NONE;
      this.turningPoint = new Phaser.Geom.Point();
    } else {
      this.turning = turnTo;
    }
    return true;
  }

  takeRandomTurn() {
    const turns = [];
    for (let i = 0; i < this.directions.length; i++) {
      const direction = this.directions[i];
      if (direction && this.isSafe(direction.index)) {
        turns.push(i);
      }
    }
    if (turns.length >= 2) {
      const index = turns.indexOf(this.opposites[this.current]);
      if (index > -1) {
        turns.splice(index, 1);
      }
    }
    const turn = this.rnd.pick(turns);
    this.setTurn(turn);
    this.turnCount = 0;
    this.turnAt = this.rnd.pick(this.turnAtTime);
  }

  turn() {
    if (this.turnCount === this.turnAt) {
      this.takeRandomTurn();
    }
    this.turnCount++;
    if (this.turning === Phaser.NONE) return false;
    if (
      !Phaser.Math.Within(this.sprite.x, this.turningPoint.x, this.threshold) ||
      !Phaser.Math.Within(this.sprite.y, this.turningPoint.y, this.threshold)
    ) {
      return false;
    }
    this.sprite.setPosition(this.turningPoint.x, this.turningPoint.y);
    this.move(this.turning);
    this.turning = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    return true;
  }

  move(direction) {
    this.current = direction;
    switch (direction) {
      case Phaser.LEFT:
        this.moveLeft();
        break;
      case Phaser.RIGHT:
        this.moveRight();
        break;
      case Phaser.UP:
        this.moveUp();
        break;
      case Phaser.DOWN:
        this.moveDown();
        break;
      default:
        break;
    }
  }

  isSafe(index) {
    return this.safetile.includes(index);
  }
}

class Player {
  constructor(scene, position, anim, dieCallback, lives) {
    this.scene = scene;
    this.sprite = scene.physics.add
      .sprite(position.x, position.y, spritesheetKey, 9)
      .setScale(0.9)
      .setOrigin(0.5);
    this.spawnPoint = position;
    this.anim = anim;
    this.dieCallback = dieCallback;
    this.speed = 85;
    this.moveTo = new Phaser.Geom.Point();
    this.sprite.angle = 180;
    this.safetile = [-1, 18];
    this.directions = [];
    this.opposites = [
      null,
      null,
      null,
      null,
      null,
      Phaser.DOWN,
      Phaser.UP,
      Phaser.RIGHT,
      Phaser.LEFT,
    ];
    this.turning = Phaser.NONE;
    this.current = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    this.threshold = 18; // aumenta auto-lock nas quinas para facilitar a curva
    this.life = lives;
    this.score = 0;
    this.active = true;
    this.sprite.anims.play(this.anim.Stay, true);
    this.sprite.on(
      "animationcomplete",
      (animation) => {
        if (animation.key === this.anim.Die) {
          this.dieCallback();
        }
      },
      scene,
    );
    this.playing = false;
  }

  die() {
    this.active = false;
    this.playing = false;
    this.life--;
    this.moveTo = new Phaser.Geom.Point();
    this.sprite.anims.play(this.anim.Die, true);
  }

  respawn() {
    this.active = true;
    this.playing = false;
    this.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.moveTo = new Phaser.Geom.Point();
    this.sprite.anims.play(this.anim.Stay, true);
    this.sprite.angle = 180;
    this.turning = Phaser.NONE;
    this.current = Phaser.NONE;
  }

  moveLeft() {
    this.moveTo.x = -1;
    this.moveTo.y = 0;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 180;
  }

  moveRight() {
    this.moveTo.x = 1;
    this.moveTo.y = 0;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 0;
  }

  moveUp() {
    this.moveTo.x = 0;
    this.moveTo.y = -1;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 270;
  }

  moveDown() {
    this.moveTo.x = 0;
    this.moveTo.y = 1;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 90;
  }

  update() {
    this.sprite.setVelocity(
      this.moveTo.x * this.speed,
      this.moveTo.y * this.speed,
    );
    this.turn();
    if (
      this.directions[this.current] &&
      !this.isSafe(this.directions[this.current].index)
    ) {
      this.sprite.anims.play(Animation.Player.Stay, true);
    }
  }

  setDirections(directions) {
    this.directions = directions;
  }

  setTurningPoint(turningPoint) {
    this.turningPoint = turningPoint;
  }

  setTurn(turnTo) {
    if (
      !this.active ||
      !this.directions[turnTo] ||
      this.turning === turnTo ||
      this.current === turnTo ||
      !this.isSafe(this.directions[turnTo].index)
    ) {
      return false;
    }
    if (this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
      this.move(turnTo);
      this.turning = Phaser.NONE;
      this.turningPoint = new Phaser.Geom.Point();
    } else {
      this.turning = turnTo;
    }
    return true;
  }

  turn() {
    if (this.turning === Phaser.NONE) return false;
    if (
      !Phaser.Math.Within(this.sprite.x, this.turningPoint.x, this.threshold) ||
      !Phaser.Math.Within(this.sprite.y, this.turningPoint.y, this.threshold)
    ) {
      return false;
    }
    this.sprite.setPosition(this.turningPoint.x, this.turningPoint.y);
    this.move(this.turning);
    this.turning = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    return true;
  }

  move(direction) {
    this.playing = true;
    this.current = direction;
    switch (direction) {
      case Phaser.LEFT:
        this.moveLeft();
        break;
      case Phaser.RIGHT:
        this.moveRight();
        break;
      case Phaser.UP:
        this.moveUp();
        break;
      case Phaser.DOWN:
        this.moveDown();
        break;
      default:
        break;
    }
  }

  isSafe(index) {
    return this.safetile.includes(index);
  }
}

export default function PacmanGame({
  onScore,
  timeLimitSeconds = 120,
  livesLimit = 3,
  ranking = [],
}) {
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  const sceneContextRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [livesLeft, setLivesLeft] = useState(livesLimit);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    setTimeLeft(timeLimitSeconds);
    setLivesLeft(livesLimit);
  }, [timeLimitSeconds, livesLimit]);

  useEffect(() => {
    if (!started) return undefined;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 625,
      backgroundColor: "#000",
      parent: hostRef.current,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          gravity: { x: 0, y: 0 },
        },
      },
      scene: {
        key: "PacmanScene",
        preload,
        create,
        update,
      },
    };

    let sceneContext = {};

    function preload() {
      this.load.setCORS("anonymous");
      this.load.setBaseURL(
        "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets",
      );
      this.load.spritesheet(spritesheetKey, "images/pacmansprites.png", {
        frameWidth: gridSize,
        frameHeight: gridSize,
      });
      this.load.tilemapTiledJSON("map", "levels/codepen-level.json");
      this.load.image(tilesKey, "images/background.png");
      this.load.image(pillKey, "images/pac%20man%20pill/spr_pill_0.png");
      this.load.image(
        lifeKey,
        "images/pac%20man%20life%20counter/spr_lifecounter_0.png",
      );
      this.cameras.main.setBackgroundColor("#000000");
    }

    function create() {
      createAnimations(this);
      sceneContext = {
        lives: livesLimit,
        score: 0,
        startAt: performance.now(),
        finished: false,
      };

      const map = this.make.tilemap({
        key: "map",
        tileWidth: gridSize,
        tileHeight: gridSize,
      });
      const tileset = map.addTilesetImage("pacman-tiles", tilesKey);
      const layer1 = map.createLayer("Layer 1", tileset, 0, 0);
      layer1.setCollisionByProperty({ collides: true });
      const layer2 = map.createLayer("Layer 2", tileset, 0, 0);
      layer2.setCollisionByProperty({ collides: true });

      const spawnPoint = map.findObject(
        "Objects",
        (obj) => obj.name === "Player",
      );
      const position = new Phaser.Geom.Point(
        spawnPoint.x + offset,
        spawnPoint.y - offset,
      );
      const player = new Player(
        this,
        position,
        Animation.Player,
        () => {
          if (player.life <= 0) {
            endGame(true);
          } else {
            respawn();
          }
        },
        livesLimit,
      );
      sceneContextRef.current = {
        setTurn: (dir) => player.setTurn(dir),
      };

      const pills = this.physics.add.group();
      map.filterObjects("Objects", (value) => {
        if (value.name === "Pill") {
          const pill = this.physics.add.sprite(
            value.x + offset,
            value.y - offset,
            pillKey,
          );
          pills.add(pill);
        }
        return false;
      });

      const ghostsGroup = this.physics.add.group();
      const ghosts = [];
      const skins = [
        Animation.Ghost.Blue,
        Animation.Ghost.Red,
        Animation.Ghost.Orange,
        Animation.Ghost.Pink,
      ];
      map.filterObjects("Objects", (value) => {
        if (value.name === "Ghost") {
          const pos = new Phaser.Geom.Point(value.x + offset, value.y - offset);
          const ghost = new Ghost(
            this,
            pos,
            skins[ghosts.length % skins.length],
          );
          ghosts.push(ghost);
          ghostsGroup.add(ghost.sprite);
        }
        return false;
      });

      this.physics.add.collider(player.sprite, layer1);
      this.physics.add.collider(player.sprite, layer2);
      this.physics.add.collider(ghostsGroup, layer1);
      this.physics.add.overlap(
        player.sprite,
        pills,
        (_, pill) => {
          pill.disableBody(true, true);
          sceneContext.score += 10;
          setScore(sceneContext.score);
          if (pills.countActive(true) === 0) {
            endGame(false);
          }
        },
        null,
        this,
      );

      this.physics.add.overlap(
        player.sprite,
        ghostsGroup,
        () => {
          if (player.active) {
            player.die();
            ghosts.forEach((g) => g.freeze());
          }
        },
        null,
        this,
      );

      const cursors = this.input.keyboard.createCursorKeys();

      const scoreText = this.add
        .text(25, 595, "Score: 0")
        .setFontFamily("Arial")
        .setFontSize(18)
        .setColor("#ffffff");
      this.add
        .text(630, 595, "Lives:")
        .setFontFamily("Arial")
        .setFontSize(18)
        .setColor("#ffffff");
      const livesImage = [];
      for (let i = 0; i < player.life; i++) {
        livesImage.push(this.add.image(700 + i * 25, 605, lifeKey));
      }

      const timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          if (sceneContext.finished) return;
          setTimeLeft((prev) => {
            const next = Math.max(0, prev - 1);
            if (next === 0) {
              setTimedOut(true);
              endGame(true);
            }
            return next;
          });
        },
      });

      const respawn = () => {
        player.respawn();
        ghosts.forEach((g) => g.respawn());
      };

      const endGame = (timeoutOrDeath) => {
        if (sceneContext.finished) return;
        sceneContext.finished = true;
        timerEvent.remove(false);
        setFinished(true);
        setTimedOut((prev) => prev || timeoutOrDeath);
        const elapsedMs = Math.max(
          0,
          Math.round(performance.now() - sceneContext.startAt),
        );
        if (!reported) {
          onScore?.({
            game: "Pac-man",
            score: sceneContext.score,
            elapsedMs,
            timedOut: timeoutOrDeath,
          });
          setReported(true);
        }
      };

      this.events.on("update", () => {
        player.setDirections(makeDirections(map, layer1, player.sprite));
        player.setTurningPoint(turningPoint(map, player.sprite));
        ghosts.forEach((ghost) => {
          ghost.setDirections(makeDirections(map, layer1, ghost.sprite));
          ghost.setTurningPoint(turningPoint(map, ghost.sprite));
        });

        if (cursors.left.isDown) {
          player.setTurn(Phaser.LEFT);
        } else if (cursors.right.isDown) {
          player.setTurn(Phaser.RIGHT);
        } else if (cursors.up.isDown) {
          player.setTurn(Phaser.UP);
        } else if (cursors.down.isDown) {
          player.setTurn(Phaser.DOWN);
        } else {
          player.setTurn(Phaser.NONE);
        }

        player.update();
        ghosts.forEach((g) => g.update());

        scoreText.setText(`Score: ${sceneContext.score}`);
        livesImage.forEach((img, idx) => {
          img.alpha = idx < player.life ? 1 : 0;
        });

        if (player.active) {
          if (player.sprite.x < 0 - offset) {
            player.sprite.setPosition(800 + offset, player.sprite.y);
          } else if (player.sprite.x > 800 + offset) {
            player.sprite.setPosition(0 - offset, player.sprite.y);
          }
        }

        setLivesLeft(player.life);
        if (!sceneContext.finished && player.life <= 0) {
          endGame(true);
        }
      });

      this.events.on("shutdown", () => {
        timerEvent.remove(false);
      });
    }

    function update() {
      // handled in events bound in create
    }

    gameRef.current = new Phaser.Game(config);

    return () => {
      setFinished(false);
      setTimedOut(false);
      setReported(false);
      sceneContextRef.current = null;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onScore, timeLimitSeconds, livesLimit, started]);

  const resetReactState = () => {
    setFinished(false);
    setTimedOut(false);
    setReported(false);
    setScore(0);
    setTimeLeft(timeLimitSeconds);
    setLivesLeft(livesLimit);
    if (!started) {
      setStarted(true);
      return;
    }
    const scene = gameRef.current?.scene?.getScene("PacmanScene");
    scene?.scene.restart();
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(timeLimitSeconds);
    setLivesLeft(livesLimit);
    setFinished(false);
    setTimedOut(false);
    setReported(false);
    setStarted(true);
  };

  const handleTouchTurn = (direction) => {
    sceneContextRef.current?.setTurn?.(direction);
  };

  return (
    <div className="pacman panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Pac-man</p>
          <h2>{finished ? "Resultado" : "Colete todos os pontos"}</h2>
          <p className="muted">Use as setas ou toque no canvas</p>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className={`pill ${livesLeft <= 1 ? "warning" : ""}`}>
          Vidas: {livesLeft}
        </span>
        <span className="pill">Score: {score}</span>
      </div>

      <div className="phaser-wrapper">
        <div ref={hostRef} className="phaser-host" />
      </div>

      {started && !finished && (
        <div className="touch-controls" aria-label="Controles de toque">
          <div className="touch-row">
            <button onPointerDown={() => handleTouchTurn(Phaser.UP)}>▲</button>
          </div>
          <div className="touch-row">
            <button onPointerDown={() => handleTouchTurn(Phaser.LEFT)}>
              ◀
            </button>
            <button onPointerDown={() => handleTouchTurn(Phaser.DOWN)}>
              ▼
            </button>
            <button onPointerDown={() => handleTouchTurn(Phaser.RIGHT)}>
              ▶
            </button>
          </div>
        </div>
      )}

      {!started && (
        <div className="result-box">
          <p>Toque em iniciar para começar o Pac-man.</p>
          <button className="primary" onClick={startGame}>
            Iniciar jogo
          </button>
        </div>
      )}

      {finished && (
        <div className="result-box">
          <p>
            {timedOut
              ? "Tempo esgotado ou sem vidas"
              : "Todos os pontos coletados!"}
          </p>
          <p>
            Score: {score} | Tempo usado: {timeLimitSeconds - timeLeft}s
          </p>
          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.score} pts</span>
                  <span>{Math.round((row.elapsedMs ?? 0) / 1000)}s</span>
                </div>
              ))}
            </div>
          )}
          <button className="primary" onClick={resetReactState}>
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}
