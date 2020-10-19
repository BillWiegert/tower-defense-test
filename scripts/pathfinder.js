// This class finds the optimal path for mobs to take to get from one location to a goal tile
// Pathfinding will not consider teleports when determining route.
// Mobs will need to detect when they path over a teleporter and then request a new path.
import { TILE_TYPES } from "./tile.js";
import Queue from "./queue.js";
import Coords from "./coords.js";

class Pathfinder {
  constructor(grid, origin, goalType, cpNum = 0) {
    this.grid = grid; // 2D array of tiles
    this.origin = origin;
    this.findGoalCoords(goalType, cpNum);
  }

  // Finds and saves the coordinates to pathfind to
  findGoalCoords(goal, cpNum) {
    this.grid.forEach((row, x) => {
      row.forEach((tile, y) => {
        if (tile.type == goal && (cpNum === 0 || tile.cpNum == cpNum)) {
          this.goalCoords = new Coords(x, y);
          return;
        }
      });
    });
  }

  // Finds the shortest path from origin to goal tile via breadth first search
  findPath() {
    let origin = this.origin;
    let goal = this.goalCoords;
    const queue = new Queue(); // Tiles to visit
    const pathHist = {}; // Holds a reference to the tile preceeding any given tile in the path

    queue.enqueue(origin);
    pathHist[origin.toArray()] = "origin";

    while (!queue.isEmpty()) {
      let current = queue.dequeue();

      if (current.equals(goal)) {
        pathHist["goal"] = current;
        break;
      }

      this.getPathableNeighbors(current).forEach(next => {
        if (!pathHist[next.toArray()]) {
          queue.enqueue(next);
          pathHist[next.toArray()] = current;
        }
      });
    }

    return this.generatePath(pathHist);
  }

  // Return an array of Coords representing the path from origin to goal from pathHist
  generatePath(pathHist) {
    // No path found
    if (!pathHist["goal"]) {
      return null;
    }

    let current = pathHist["goal"];
    let path = [current]; // to be treated as a stack, populated with push(), read with pop()

    // Iterate backward through pathHist adding coords to the end of the path stack
    while (pathHist[current.toArray()] != "origin") {
      current = pathHist[current.toArray()];
      path.push(current);
    }

    return path;
  }

  // Returns an array of Coords that are pathable neighbor tiles of the tile at given coords
  getPathableNeighbors(coords) {
    return coords.getAdjacent().filter(neighbor => this.inBounds(neighbor) && this.tileAt(neighbor).isPathable());
  }

  // Returns true if coords exists within the grid, false otherwise
  inBounds(coords) {
    return coords.x >= 0 && coords.y >= 0
      && coords.x < this.grid.length && coords.y < this.grid[0].length;
  }

  tileAt(coords) {
    return this.grid[coords.x][coords.y];
  }
}

export default Pathfinder;
