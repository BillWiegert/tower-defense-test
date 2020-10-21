class Coords {
  constructor(x, y) {
    this.x = typeof x == "number" ? x : x[0];
    this.y = y ? y : x[1];
  }

  toArray() {
    return [this.x, this.y];
  }

  // Check if two coords are equal
  equals(other) {
    return this.x == other.x && this.y == other.y;
  }

  // Return an array of coordinates immediately adjacent to this one
  // This controls direction preference for pathfinder as well
  getAdjacent() {
    return [
      new Coords([this.x + 1, this.y]), // RIGHT >
      new Coords([this.x - 1, this.y]),  // LEFT >
      new Coords([this.x, this.y - 1]), // UP >
      new Coords([this.x, this.y + 1]), // DOWN >
    ];
  }
}

export default Coords;
