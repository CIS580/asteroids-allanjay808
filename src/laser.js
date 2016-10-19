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
