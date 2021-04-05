import { TILE_TYPES } from "./tile.js";
import Coord from "./coord.js";
//import Healthbar from "./healthbar.js";

// Create mobs with start position
// call spawn() when you want them to spawn
// spawn()ing should also start the pathing
// give mobs an array of goalTypes they need to path to, they request paths to each goal as needed
// when they path over a tp, they record it, teleport to the exit and request a new path

// Represents an enemy whose goal is to reach the finish
class Mob {
  constructor(stage, grid, numGoals, pathfinder) {
    this.grid = grid;
    this.numGoals = numGoals // array of goalTypes the mob needs to path to
    this.pathfinder = pathfinder; // pathfinder instance with grid access
    this.shape = new createjs.Shape(); // Graphical representation of the mob
    stage.addChild(this.shape);

    this.type; // Affects appearance, stats, and behaviour
    this.speed = 150; // Number of ms mob takes to advance to the next tile
    this.healthMax; // Maximum health this mob can have
    this.health; // Current health, mob dies when this reaches zero
    this.shieldMax; // Absorbs damage before health, gradually recharges after period of no damage
    this.shield; // Current value of shield
    this.armor = 0; // Reduces incoming damage by a fixed amount
  }

  getStartCoords() {
    let grid = this.grid;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        let tile = grid[x][y];
        if (tile.type === TILE_TYPES.START) return new Coord(x, y);
      }
    }

    throw "Unable to find start tile";
  }

  // Render the mob at its position scaled to the current tileSize
  // Must respawn the mob after changing tileSize
  spawn(tileSize = this.tileSize) {
    this.tileSize = tileSize;
    this.currentGoal = 1; // current goal number, increment upon reaching a goal
    this.position = this.getStartCoords();
    this.shape.x = this.position.x * tileSize;
    this.shape.y = this.position.y * tileSize;
    this.shape.graphics.clear().beginFill("Cyan").beginStroke("Black").drawCircle(tileSize/2, tileSize/2, tileSize/3);
  }

  // Returns path found by pathfinder to next goal
  findPath(){
    let pos = this.position;
    let goalType = this.numGoals === this.currentGoal ? TILE_TYPES.FINISH : TILE_TYPES.CHECKPOINT;
    let cpNum = goalType === TILE_TYPES.CHECKPOINT ? this.currentGoal : null;

    return this.pathfinder.findPath(pos, goalType, cpNum);
  }

  // Animate mob pathing to each goal
  startPathing() {
    let path = this.findPath();

    // Throw error if no path found TODO: catch this somewhere and alert the player
    if (path == null) throw `No valid path to goal ${this.currentGoal}`;

    path.pop(); // Toss first entry, should be current position which is unneeded
    let goalPos = path[0];
    this.tween = createjs.Tween.get(this.shape, {override: true});

    // Iterate through path array and animate movement to each tile
    while(path.length > 0) {
      let nextTile = path.pop();

      // Scale coordinates by tileSize
      let nextX = nextTile.x * this.tileSize;
      let nextY = nextTile.y * this.tileSize;

      // Animate shape to next tile
      this.tween.to({x: nextX, y: nextY}, this.speed);

      // Update Mob's position each tile moved
      this.tween.call(() => {
        this.position = nextTile;
        this.incrementPathLength();
      });
    }

    // Callback function to be called after mob reaches goal tile
    this.tween.call(() => {
      this.currentGoal++; // Update current goal number
      this.currentGoal <= this.numGoals ? this.startPathing() : this.reachFinish();
    });
  }

  // Instantly move mob to given position and start path to next goal
  teleportTo(position) {
    this.updatePosition(position);
  }

  // Adjust all necessary instance variables when changing position
  // Must only be called after the mob is spawned
  updatePosition(position) {
    this.position = position;
    this.shape.x = position.x * this.tileSize;
    this.shape.y = position.y * this.tileSize;
  }

  // Deal damage to the mob
  takeDamage(amount) {
    // Calculate damage reduction from armor, prevent negative damage
    let mitigatedDamage = this.armor >= amount ? 0 : amount - this.armor;
    this.health = this.health - mitigatedDamage;

    if (this.health <= 0) this.die(); // Die if health reduced below 0
  }

  // Handle mob reaching 0 health
  // Either remove from game or restore to full health and grant score
  die(){
    this.shape.graphics.clear();
    createjs.Tween.removeTweens(this.shape);
  }

  reachFinish() {
    this.shape.graphics.clear();
    createjs.Tween.removeTweens(this.shape);
  }
}

export default Mob;
