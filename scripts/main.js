import { Tile, TILE_TYPES } from "./tile.js";
import Pathfinder from "./pathfinder.js";
import Coord from "./coord.js";
import Mob from "./mob.js";

const GRID_WIDTH = 36;
const GRID_HEIGHT = 20;
var tileSize;
var tiles = new Array(GRID_WIDTH);

document.addEventListener("DOMContentLoaded", (event) => {
  const CANVAS = document.querySelector("#game-space");
  const STAGE = new createjs.Stage("game-space");
  const TOOLBAR_BUTTONS = document.querySelectorAll("#toolbar > button");
  const RANDOMIZE_BUTTON = document.querySelector("#randomize");
  const PATH_LENGTH = document.querySelector("#path-length");

  // User changable options to change what actions are performed on click
  let selectedOptions = {
    selectedTool:"tower",
    // anything else needed?
  };

  CANVAS.addEventListener("click", () => {
    findPath();
  });

  TOOLBAR_BUTTONS.forEach(button => button.addEventListener("click", () => {
    handleToolbarButtonClick(button);
  }));

  RANDOMIZE_BUTTON.addEventListener("click", generateRandomGrid);

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
  let start;
  let testMob = new createjs.Shape();
  testMob.graphics.clear().beginFill("Crimson").beginStroke("Black").drawCircle(tileSize/2, tileSize/2, tileSize/3);
  STAGE.addChild(testMob);
  createjs.Ticker.addEventListener("tick", STAGE);

  // Initialization
  updateCanvasSize();
  generateRandomGrid();

  function findPath() {
    let pf1 = new Pathfinder(tiles, start, TILE_TYPES.CHECKPOINT, 1);
    let testPath1 = pf1.findPath();
    let pf2 = new Pathfinder(tiles, pf1.goalCoord, TILE_TYPES.FINISH);
    let testPath2 = pf2.findPath();

    // Ensure both paths are valid
    if (testPath1 && testPath2) {
      testPath2.pop(); // Toss this duplicate point
      let path = testPath2.concat(testPath1);
      PATH_LENGTH.innerHTML = path.length;
      let testOrigin = path.pop();

      testMob.x = (testOrigin.x * tileSize);
      testMob.y = (testOrigin.y * tileSize);

      testMob.graphics.clear().beginFill("Crimson").beginStroke("Black").drawCircle(tileSize/2, tileSize/2, tileSize/3);

      animateMob(testMob, path);

    } else {
      // Reset testMob to start tile
      createjs.Tween.removeTweens(testMob);
      // testMob.x = start.x;
      // testMob.y = start.y;

      PATH_LENGTH.innerHTML = 0;
    }
  }

  function generateRandomGrid() {
    console.time("generateRandomGrid");
    for (let i = 0; i < GRID_WIDTH; i++) {
      for (let j = 0; j < GRID_HEIGHT; j++) {
        tiles[i][j].changeType(TILE_TYPES.BLANK);
      }
    }

    for (let i = 0; i < GRID_WIDTH * 2; i++) {
      let x = Math.floor(Math.random() * GRID_WIDTH);
      let y = Math.floor(Math.random() * GRID_HEIGHT);

      tiles[x][y].changeType(TILE_TYPES.VOID);
    }

    let startX = Math.floor(Math.random() * (GRID_WIDTH/2));
    let startY = Math.floor(Math.random() * (GRID_HEIGHT/2));
    let finishX = Math.floor(Math.random() * (GRID_WIDTH/2) + GRID_WIDTH/2);
    let finishY = Math.floor(Math.random() * (GRID_HEIGHT/2) + GRID_HEIGHT/2);
    let cp1X = Math.floor(Math.random() * (GRID_WIDTH));
    let cp1Y = Math.floor(Math.random() * (GRID_HEIGHT));

    tiles[startX][startY].changeType(TILE_TYPES.START);
    tiles[finishX][finishY].changeType(TILE_TYPES.FINISH);
    tiles[cp1X][cp1Y].changeType(TILE_TYPES.CHECKPOINT, 1);

    start = new Coord(startX, startY);

    console.timeEnd("generateRandomGrid");
    draw();
  }

  function animateMob(mob, path) {
    console.time("animateMob");

    // Tween the testMob along the path found by pathfinder
    let tween = createjs.Tween.get(mob, {loop: -1, override: true});
    while(path.length > 0) {
      let nextTile = path.pop();

      // Scale coordinates by tileSize and convert to an offset
      let nextX = nextTile.x * tileSize;
      let nextY = nextTile.y * tileSize;

      tween.to({x: nextX, y: nextY}, 200);
    }
    console.timeEnd("animateMob");
  }

  // Updates the size of the canvas any time the window is resized
  window.addEventListener('resize', () => {
    updateCanvasSize();
    draw();
  });

  // Draw a square on the stage
  function drawTestSquare(x, y, shape) {
    shape.graphics.clear();
    shape.graphics.beginStroke('black').drawRect(x, y, tileSize, tileSize);
  }

  // Update the size of the canvas depending on the window width
  // Also updates tileSize
  function updateCanvasSize() {
    console.time("updateCanvasSize");
    var canvasWidth = window.innerWidth * 0.75;
    var canvasHeight = canvasWidth * GRID_HEIGHT / GRID_WIDTH; // 20 x 12
    tileSize = canvasWidth / GRID_WIDTH;
    CANVAS.setAttribute("width", canvasWidth);
    CANVAS.setAttribute("height", canvasHeight);
    // draw();
  }

  // Render all tiles
  function draw() {
    console.time("draw");
    for (let i = 0; i < GRID_WIDTH; i++) {
      for (let j = 0; j < GRID_HEIGHT; j++) {
        tiles[i][j].render(tileSize);
      }
    }

    STAGE.update();
    console.timeEnd("draw");
    findPath();
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
