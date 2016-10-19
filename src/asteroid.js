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
