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
function Asteroid(position, isSmall) {
  this.x = position.x;
  this.y = position.y;
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
}

/**
 * @function updates the asteroid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Asteroid.prototype.update = function(time) {
  this.color = '#13E91F';
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
    this.x, this.y, this.width, this.height
  );

  ctx.strokeStyle = this.color;
  ctx.strokeRect(this.x, this.y, this.width, this.height);
}
