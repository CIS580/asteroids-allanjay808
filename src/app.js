"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');

/* Global variables */
var canvas = document.getElementById('screen');
// Game logistics
var game;
var gameOver = false;
var score;
var lives;
var level;
// Game objects
var player;
var asteroids = [];

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
        initialize();
      }
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
  level = 1;

  player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);

  spawnAsteroids();
}
initialize();

function spawnAsteroids() {
  asteroids.push(new Asteroid({x: 200, y: 200}, false));
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
  player.update(elapsedTime);

  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].update(elapsedTime);
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

  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].render(elapsedTime, ctx);
  }

  displayScore(ctx);
  displayLives(ctx);
  displayLevel(ctx);

  if (gameOver) {
    displayGameOver(ctx);
  }
}

/**
  * @function displayScore
  */
function displayScore(ctx) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "white";
  var scoreText = "Score: " + score;
  ctx.fillText(scoreText, 10, 470);
}

/**
  * @function displayLives
  */
function displayLives(ctx) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "white";
  var livesText = "Lives: " + lives;
  ctx.fillText(livesText, 350, 470);
}

/**
  * @function displayLevel
  */
function displayLevel(ctx) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "white";
  var levelText = "Level: " + level;
  ctx.fillText(levelText, 690, 470);
}

/**
  * @function
  */
function displayGameOver(ctx) {
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
