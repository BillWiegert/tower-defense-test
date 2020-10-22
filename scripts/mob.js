import Coord from "./coord.js";

// Represents an enemy whose goal is to reach the finish
class Mob {
  constructor(position) {
    this.position = position; // Coord representing mob's position on the grid
    this.shape = new createjs.Shape(); // Graphical representation of the mob
    this.type; // Affects appearance, stats, and behaviour
    this.health; // Mob dies when this reaches zero
    this.shield; // Absorbs damage before health, gradually recharges after period of no damage
    this.speed; // Modifies how quickly mob can move
    this.armor; // Reduces incoming damage by a fixed amount
  }

  // render the mob at its position
  spawn() {

  }

  pathTo(position) {

  }

  teleportTo(position) {

  }


  damage(amount) {
    let mitigatedDamage = this.armor > amount ? 0 : amount - this.armor;
    this.health = this.health - mitigatedDamage;

    if(this.health <= 0) this.die();
  }

  // Remove mob from the game space
  die(){

  }
}

export default Mob;
