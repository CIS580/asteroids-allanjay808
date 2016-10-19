(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const Laser = require('./laser.js');
const Hud = require('./hud.js');

// Audio
var laserShot = new Audio();
laserShot.src = 'assets/sounds/laser.wav';
var explosion = new Audio();
explosion.src = 'assets/sounds/explosion.wav';
var asteroidBreak = new Audio();
asteroidBreak.src = 'assets/sounds/break.wav';
var teleport = new Audio();
teleport.src = 'assets/sounds/teleport.wav'

/* Global variables */
var canvas = document.getElementById('screen');
// Game logistics
var game;
var gameOver = false;
var hud;
var score;
var lives;
var level;
// Game objects
var player;
var asteroids;
var lasers;

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  if (!gameOver) {
    setTimeout(function() {
      game.loop(timestamp);
    }, 1000/16);
  }
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
  * @function onkeydown
  * If user presses 'Enter' and the game is over, restart game
  */
document.onkeydown = function(event) {
  switch (event.keyCode) {
    case 13:
      if (gameOver) {
        gameOver = false;
        initialize();
      }
      break;
    // 'T' is to teleport
    case 84:
        teleport.play();
        player.teleport();
      break;
    // 'space' is to shoot a laser
    case 32:
        laserShot.play();
        var position = player.position;
        var angle = player.angle;
        lasers.push(new Laser(position, angle, canvas));
        break;
    default:
  }
}

/**
  * @function initialize
  * Initalizes all the game objects to begin or restart the game
  */
function initialize() {
  game = new Game(canvas, update, render);
  score = 0;
  lives = 3;
  level = 0;
  hud = new Hud();

  player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);

  asteroids = [];
  spawnAsteroids();

  lasers = [];
}
initialize();

/**
  * @function spawnAsteroids
  * Spawns asteroids at random locations, number based on level
  */
function spawnAsteroids() {
  for (var i = 0; i < (10 + level); i++) {
    var size = Math.round(Math.random()) == 1 ? true : false;
    asteroids.push(new Asteroid(size, canvas));
  }
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {

  if (gameOver) return;

  player.update(elapsedTime);

  // Move asteroids
  asteroids.forEach(function(asteroid) {
    asteroid.update(elapsedTime);
  });

  // Move lasers if any
  lasers.forEach(function(laser, index) {
    laser.update(elapsedTime);
    if (laser.offScreen()) {
      lasers.splice(index, 1);
    }
  });

  // Check for collision with player and asteroids
  asteroids.sort(function(a, b) { return a.position.x - b.position.x});
  var active = [];
  var potentiallyColliding = [];

  asteroids.forEach(function(asteroid, asteroidIndex) {
    active = active.filter(function() {
      if (!asteroid.isSmall) {
        return (player.position.x) - (asteroid.position.x + 32) < 37;
      } else return (player.position.x) - (asteroid.position.x + 16) < 21;
    });

    active.forEach(function() {
      potentiallyColliding.push(asteroid)
    });

    active.push(asteroid);
  });

  potentiallyColliding.forEach(function(asteroid) {
    var dist;
    if (!asteroid.isSmall) {
      dist = Math.pow((player.position.x) - (asteroid.position.x + 32), 2) +
             Math.pow((player.position.y) - (asteroid.position.y + 32), 2);
      if (dist < 2056) {
        explosion.play();
        lives--;
        player.respawn();
      }
    } else {
      dist = Math.pow((player.position.x) - (asteroid.position.x + 16), 2) +
             Math.pow((player.position.y - 10) - (asteroid.position.y + 16), 2);
      if (dist < 2056) {
        explosion.play();
        lives--;
        player.respawn();
      }
    }
  });

  var newAsteroids = [];
  // Check for collisions with lasers and asteroids
  if (lasers.length > 0) {

    active = [];
    potentiallyColliding = [];

    lasers.forEach(function(laser, laserIndex) {

      asteroids.forEach(function(asteroid, asteroidIndex) {

        active = active.filter(function() {
          if (!asteroid.isSmall) {
            return (laser.position.x + 2) - (asteroid.position.x + 32) < 34;
          } else return (laser.position.x + 2) - (asteroid.position.x + 16) < 18;
        });

        active.forEach(function() {
          potentiallyColliding.push({l: laser, a: asteroid, lIndex: laserIndex,
            aIndex: asteroidIndex});
        });

        active.push(asteroid);
      });

      var collisions = [];
      potentiallyColliding.forEach(function(pair) {
        // 1028 and 256
        var dist;
        if (!pair.a.isSmall) {
          dist = Math.pow((pair.l.position.x + 2) - (pair.a.position.x + 32), 2) +
                 Math.pow((pair.l.position.y + 2) - (pair.a.position.y + 32), 2);
          if (dist < 2056) {
            collisions.push(pair);
          }
        } else {
          dist = Math.pow((pair.l.position.x + 2) - (pair.a.position.x + 16), 2) +
                 Math.pow((pair.l.position.y + 2) - (pair.a.position.y + 16), 2);
          if (dist < 516) {
            collisions.push(pair);
          }
        }
      });

      // Handle collision
      collisions.forEach(function(pair) {
        asteroidBreak.play();
        lasers.splice(pair.lIndex, 1);
        // Break apart asteroid if big
        if (!pair.a.isSmall) {
          var mass = pair.a.mass / 2;
          var v = pair.a.velocity;
          var p = pair.a.position;
          asteroids.splice(pair.aIndex, 1);
          var smallAsteroid1 = new Asteroid(true, canvas);
          var smallAsteroid2 = new Asteroid(true, canvas);
          smallAsteroid1.mass = mass;
          smallAsteroid2.mass = mass;

          smallAsteroid1.position.x = p.x;
          smallAsteroid1.position.y = p.y;
          smallAsteroid2.position.x = p.x;
          smallAsteroid2.position.y = p.y;

          smallAsteroid1.velocity.x = v.x * 2;
          smallAsteroid1.velocity.y = v.y * 2;
          smallAsteroid2.velocity.x = v.x * 2 * -1;
          smallAsteroid2.velocity.y = v.y * 2 * -1;

          newAsteroids.push(smallAsteroid1);
          newAsteroids.push(smallAsteroid2);
          score += 50;
        } else {
          asteroids.splice(pair.aIndex, 1);
          score += 100;
        }
      });

    });
  }

  newAsteroids.forEach(function(asteroid) {
    asteroids.push(asteroid);
  })

  if (asteroids.length == 0) levelUp();

  if (lives < 0) {
    gameOver = true;
  }

}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);

  // Draw asteroids
  asteroids.forEach(function(asteroid) {
    asteroid.render(elapsedTime, ctx);
  });

  // Draw lasers if any
  lasers.forEach(function(laser) {
    laser.render(elapsedTime, ctx);
  });

  hud.displayScore(ctx, score);
  hud.displayLives(ctx, lives);
  hud.displayLevel(ctx, level);

  if (gameOver) {
    hud.displayGameOver(ctx, canvas, score);
  }
}

/**
  * @function levelUp
  * When all asteroids are destroyed, level up the game
  */
function levelUp() {
  score += 1000;
  level++;
  player.respawn();
  spawnAsteroids();
}

},{"./asteroid.js":2,"./game.js":3,"./hud.js":4,"./laser.js":5,"./player.js":6}],2:[function(require,module,exports){
"use strict;"

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Asteroid class
 */
module.exports = exports = Asteroid;

/**
 * @constructor Asteroid
 * Creates a new small asteroid object
 * @param {Postition} position object specifying an x and y
 * @param {IsSmall} isSmall boolean specifying if asteroid is small
 */
function Asteroid(isSmall, canvas) {

  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;

  var genPosition = generateRandomPosition();
  this.position = {
    x: genPosition.x,
    y: genPosition.y
  };

  this.isSmall = isSmall;

  this.spritesheet = new Image();
  this.width;
  this.height;
  if (!this.isSmall) {
    this.spritesheet.src = encodeURI("assets/images/asteroid-large.png");
    this.width = 64;
    this.height = 64;
  } else {
    this.spritesheet.src = encodeURI("assets/images/asteroid-small.png");
    this.width = 32;
    this.height = 32;
  }

  this.frame = Math.floor(Math.random() * 3);

  this.mass = Math.random() + 0.1;

  var genVx = 0;
  var genVy = 0;
  while (genVx == 0 && genVy == 0) {
    genVx = generateRandomNumber(2, -2);
    genVy = generateRandomNumber(2, -2);
  }

  this.velocity = {
    x: genVx,
    y: genVy
  };

  this.angle = 0;
  // Rotate right or left
  this.rotateRight = false;
  if (Math.round(Math.random()) == 0) {
    this.rotateRight = true;
  }
}

/**
 * @function updates the asteroid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Asteroid.prototype.update = function(time) {

  if (this.rotateRight) {
    this.angle += time * 0.005;
  } else this.angle -= time * 0.005;

  this.position.x += this.velocity.x * this.mass;
  this.position.y += this.velocity.y * this.mass;

  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;

}

/**
 * @function renders the asteroid into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Asteroid.prototype.render = function(time, ctx) {

  ctx.drawImage(
    // image
    this.spritesheet,
    // source rectangle
    this.frame * this.width, 0, this.width, this.height,
    // destination rectangle
    this.position.x, this.position.y, this.width, this.height
  );
}

/**
  * @function generateRandomPosition
  * This will generate a random position outside of the player spawn box
  * X is between 20 to 280 or 480 to 740
  * Y is between 20 to 140 or 340 to 460
  */
function generateRandomPosition() {

  var randomX = [];
  var randomY = [];

  randomX.push(generateRandomNumber(280, 20));
  randomX.push(generateRandomNumber(740, 480));

  randomY.push(generateRandomNumber(140, 20));
  randomY.push(generateRandomNumber(460, 340));

  var position = {
    x: randomX[Math.round(Math.random())],
    y: randomY[Math.round(Math.random())]
  };

  return position;
}

/**
  * @function generateRandomNumber
  * Generates a random number between the given min and max
  */
function generateRandomNumber(max, min) {
  return Math.floor(Math.random() * (max - min)) + min;
}

},{}],3:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],4:[function(require,module,exports){
"use strict;"

/**
  * @module exports the Hud class
  */
module.exports = exports = Hud;

/**
  * @constructor Hud
  * Creates a new hud object
  */
function Hud() {}

/**
  * @function displayScore
  * Displays the current score bottom left of canvas
  */
Hud.prototype.displayScore = function(ctx, score) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "green";
  var scoreText = "Score: " + score;
  ctx.fillText(scoreText, 10, 470);
}

/**
  * @function displayLives
  * Displays the number of lives bottom middle of canvas
  */
Hud.prototype.displayLives = function(ctx, lives) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "red";
  var livesText = "Lives: " + lives;
  ctx.fillText(livesText, 350, 470);
}

/**
  * @function displayLevel
  * Displays the level number bottom right of canvas
  */
Hud.prototype.displayLevel = function(ctx, level) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "white";
  var levelText = "Level: " + (level + 1);
  ctx.fillText(levelText, 690, 470);
}

/**
  * @function displayGameOver
  * When game is over, message is displayed over canvas with high score
  */
Hud.prototype.displayGameOver = function(ctx, canvas, score) {
  ctx.fillStyle = "#798187";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 48px Helvetica";
  ctx.fillStyle = "black";

  var gameOverText = "Game Over!";
  var scoreText = "Score: " + score;
  var gameOverHelp = "Press 'Enter' to restart";

  ctx.fillText(gameOverText, 240, 240);
  ctx.fillText(scoreText, 10, 460);
  ctx.font = "bold 32px Helvetica";
  ctx.fillText(gameOverHelp, 205, 280);
}

},{}],5:[function(require,module,exports){
"use strict;"

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Laser class
 */
module.exports = exports = Laser;

/**
 * @constructor Laser
 * Creates a new laser object
 * @param {Postition} position object specifying an x and y
 */
function Laser(position, angle, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;

  this.position = {
    x: position.x,
    y: position.y
  };

  this.angle = Math.floor((angle / 0.005 / 3.5) % 360);

  var radians = this.angle * (Math.PI/180);

  this.velocity = {
    x: Math.sin(radians),
    y: -1 * Math.cos(radians)
  };

}

/**
 * @function updates the laser object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Laser.prototype.update = function(time) {
  this.position.x += this.velocity.x * 4;
  this.position.y += this.velocity.y * 4;
}

/**
 * @function renders the laser into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Laser.prototype.render = function(time, ctx) {

  ctx.fillStyle = 'orange';
  ctx.fillRect(this.position.x, this.position.y, 4, 4);

}

/**
  * @function offScreen
  */
Laser.prototype.offScreen = function() {
  if (this.position.x < 0 || this.position.x > this.worldWidth ||
      this.position.y < 0 || this.position.y > this.worldHeight) {

    return true;

  } else return false;
}

},{}],6:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;

  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
    }
  }
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle -= time * 0.005;
  }
  if(this.steerRight) {
    this.angle += time * 0.005;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(-this.angle),
      y: Math.cos(-this.angle)
    }
    this.velocity.x -= acceleration.x / 4;
    this.velocity.y -= acceleration.y / 4;
  }

  // Apply velocity
  this.position.x += this.velocity.x / 4;
  this.position.y += this.velocity.y / 4;

  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = 'purple';
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }

  ctx.restore();
}

/**
  * @function teleport
  * Player is teleported to a random spot
  */
Player.prototype.teleport = function() {
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.position.x = Math.floor(Math.random() * (740 - 20)) + 20;
  this.position.y = Math.floor(Math.random() * (460 - 20)) + 20;
}

Player.prototype.respawn = function() {
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.position.x = this.worldWidth / 2;
  this.position.y = this.worldHeight / 2;
}

},{}]},{},[1]);
