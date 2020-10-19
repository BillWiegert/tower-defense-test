// Represents an enemy whose goal is to reach the finish

// Pathfinding logic should go in this class so it will need to somehow get access to the gamespace
class Mob {
  constructor(type = null) {
    this.type = type;
  }

  speak() {
    console.log("I'm a mob!");
  }
}

export default Mob;
