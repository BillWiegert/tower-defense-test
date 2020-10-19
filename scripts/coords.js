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
  getAdjacent() {
    return [
      new Coords([this.x - 1, this.y]),
      new Coords([this.x, this.y - 1]),
      new Coords([this.x + 1, this.y]),
      new Coords([this.x, this.y + 1])
    ];
  }
}

export default Coords;
