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
