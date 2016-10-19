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
