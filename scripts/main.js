import { Tile, TILE_TYPES } from "./tile.js";
import Pathfinder from "./pathfinder.js";
import Coord from "./coord.js";
import Mob from "./mob.js";

const GRID_WIDTH = 20;
const GRID_HEIGHT = 12;
var tileSize;
var tiles = new Array(GRID_WIDTH);

document.addEventListener("DOMContentLoaded", (event) => {
  const CANVAS = document.querySelector("#game-space");
  const STAGE = new createjs.Stage("game-space");
  const TOOLBAR_BUTTONS = document.querySelectorAll("#toolbar > button");

  // User changable options to change what actions are performed on click
  let selectedOptions = {
    selectedTool:"tower",
    // anything else needed?
  };

  TOOLBAR_BUTTONS.forEach(button => button.addEventListener("click", () => {
    handleToolbarButtonClick(button);
  }));

  // Change selectedTool on click and update active button
  function handleToolbarButtonClick(button) {
    document.querySelector("#toolbar > button.active").classList.remove("active");
    button.classList.add("active");
    selectedOptions.selectedTool = button.value;
  }

  // Populate grid with tiles
  for (let i = 0; i < GRID_WIDTH; i++) {
    tiles[i] = new Array(GRID_HEIGHT);
    for (let j = 0; j < GRID_HEIGHT; j++) {
      let tile = new Tile(i, j, STAGE, selectedOptions);

      tiles[i][j] = tile;
    }
  }

  // ========= TEST CODE =========
  let mob = new Mob();
  tiles[0][1].changeType(TILE_TYPES.START);
  tiles[17][6].changeType(TILE_TYPES.FINISH);
  tiles[8][11].changeType(TILE_TYPES.CHECKPOINT, 1);

  tiles[0][6].changeType(TILE_TYPES.TP_IN);
  tiles[0][8].changeType(TILE_TYPES.TP_OUT);

  tiles[8][6].addWall();
  tiles[1][9].addTower();

  tiles[3][0].addRock();
  tiles[1][1].addRock();
  tiles[0][2].addRock();

  tiles[3][1].addRock();
  tiles[3][2].addRock();
  tiles[2][3].addRock();
  tiles[1][4].addRock();
  tiles[4][3].addRock();
  tiles[5][4].addRock();
  tiles[6][5].addRock();
  tiles[7][6].addRock();
  tiles[9][7].addRock();
  tiles[10][8].addRock();
  tiles[11][9].addRock();
  tiles[12][9].addRock();
  tiles[13][9].addRock();
  tiles[14][9].addRock();
  tiles[18][6].addRock();
  tiles[17][7].addRock();
  tiles[16][8].addRock();
  tiles[15][9].addRock();
  tiles[17][5].addRock();
  tiles[16][4].addRock();
  tiles[15][5].addRock();
  tiles[14][6].addRock();
  tiles[14][7].addRock();

  console.log(`[0,8] pathable?: ${tiles[0][8].isPathable()}`);

  let start = new Coord(0,1);
  let pf = new Pathfinder(tiles, start, TILE_TYPES.FINISH);
  console.log("Goal Coord:", pf.goalCoord);
  let testPath = pf.findPath();
  console.log("Path:", testPath);


  // Ensure error is thrown
  try {
    tiles[0][0].changeType("invisible tile");
  } catch (e) {
    console.log(e)
  }

  // =============================

  updateCanvasSize();

  if(testPath) {
    let testMob = new createjs.Shape();
    let testOrigin = testPath.pop();

    testMob.x = (testOrigin.x * tileSize);
    testMob.y = (testOrigin.y * tileSize);

    window.testMob = testMob;
    window.stage = STAGE;
    window.tileSize = tileSize;

    // Draw testMob at testOrigin in the center of the tile with a radius 1/3 of tileSize
    testMob.graphics.beginFill("Crimson").drawCircle(tileSize/2, tileSize/2, tileSize/3);

    // Tween the testMob along the path found by pathfinder
    let tween = createjs.Tween.get(testMob, {loop: -1});
    while(testPath.length > 0) {
      let nextTile = testPath.pop();

      // Scale coordinates by tileSize and convert to an offset
      let nextX = nextTile.x * tileSize;
      let nextY = nextTile.y * tileSize;

      tween.to({x: nextX, y: nextY}, 400);
    }

    STAGE.addChild(testMob);
    createjs.Ticker.addEventListener("tick", STAGE);
  }



  // Updates the size of the canvas any time the window is resized
  window.addEventListener('resize', updateCanvasSize);

  // Draw a square on the stage
  function drawTestSquare(x, y, shape) {
    shape.graphics.clear();
    shape.graphics.beginStroke('black').drawRect(x, y, tileSize, tileSize);
  }

  // Update the size of the canvas depending on the window width
  // Also updates tileSize
  function updateCanvasSize() {
    var canvasWidth = window.innerWidth * 0.75;
    var canvasHeight = canvasWidth * 0.6; // 20 x 12
    tileSize = canvasWidth / 20.0;
    CANVAS.setAttribute("width", canvasWidth);
    CANVAS.setAttribute("height", canvasHeight);
    draw();
  }

  // Render all tiles
  function draw() {
    for (let i = 0; i < GRID_WIDTH; i++) {
      for (let j = 0; j < GRID_HEIGHT; j++) {
        tiles[i][j].render(tileSize);
      }
    }

    STAGE.update();
  }
});

// GAME IDEA: Tower defense game with focus on making a long maze.
// Mobs start at the start tile, path to any checkpoint tiles in order, and then the finish tile.
// Mobs will take the shortest path to their next objective, navigating around obstacles.
// Teleports are not considered in detemining the shortest path (Mobs see them as blank tiles).
// Each teleport is active once per wave per mob, subsequent visits will not teleport.
// Player can place walls and towers to block the path. Walls cheap, Towers expensive, both limited.
// Rocks block path, can't be built on. Can be removed for a huge cost.
// Objective tiles (Start/End, Checkpoints) can't be built on.
// Teleport tiles can be built on. If exit is blocked mobs simply walk over entrance.
// Walls can be sold for 100% refund, Towers refund base price but not cost of upgrades.
// Tower damage and range(expensive) can be upgraded and can be upgraded into different types.

// Mob pathing will utilize a breadth-first search to find the shortest path to the next objective.
// After finding path to an objective, but before finding path to next objective or taking path;
// will need to check if the path leads over any active teleports and then recalculate path
// from tp exit. Must ensure TP is active and flag inactive after pathing over it.
