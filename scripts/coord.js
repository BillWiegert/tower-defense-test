class Coord {
  constructor(x, y) {
    // Allows arguments to be passed as two numbers or one array
    [this.x, this.y] = [x,y].flat();
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
      new Coord([this.x + 1, this.y]), // RIGHT >
      new Coord([this.x - 1, this.y]),  // LEFT >
      new Coord([this.x, this.y - 1]), // UP >
      new Coord([this.x, this.y + 1]), // DOWN >
    ];
  }
}

export default Coord;
