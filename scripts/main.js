import { Tile, TILE_TYPES } from "./tile.js";
import Pathfinder from "./pathfinder.js";
import Coord from "./coord.js";
import Mob from "./mob.js";

const GRID_WIDTH = 36;
const GRID_HEIGHT = 20;
let tileSize;
var tiles = new Array(GRID_WIDTH);
let pathfinder = new Pathfinder(tiles);
let testMob;

// Invokes the actual handler (fn) only after a specified delay in triggering events occurs.
// Used as an intermediate handler.
function debounce(delay, fn) {
  let timerId;

  return function (...args) {
    // Clear delay timer if it exists
    timerId && clearTimeout(timerId);

    // Invoke fn after specified delay
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

document.addEventListener("DOMContentLoaded", (event) => {
  const CANVAS = document.querySelector("#game-space");
  const STAGE = new createjs.Stage("game-space");
  const TOOLBAR_BUTTONS = document.querySelectorAll("#toolbar > button");
  const RANDOMIZE_BUTTON = document.querySelector("#randomize");
  const START_BUTTON = document.querySelector("#start-btn");
  const PATH_LENGTH = document.querySelector("#path-length");

  // User changable options to change what actions are performed on click
  let selectedOptions = {
    selectedTool:"tower",
    // anything else needed?
  };

  TOOLBAR_BUTTONS.forEach(button => button.addEventListener("click", () => {
    handleToolbarButtonClick(button);
  }));

  RANDOMIZE_BUTTON.addEventListener("click", newRandomMap);
  START_BUTTON.addEventListener("click", startPathing);

  // Change selectedTool on click and update active button
  function handleToolbarButtonClick(button) {
    document.querySelector("#toolbar > button.active").classList.remove("active");
    button.classList.add("active");
    selectedOptions.selectedTool = button.value;
  }

  // Set up tiles upon initial page load
  function initialize() {
    // Populate grid with tiles
    for (let i = 0; i < GRID_WIDTH; i++) {
      tiles[i] = new Array(GRID_HEIGHT);
      for (let j = 0; j < GRID_HEIGHT; j++) {
        let tile = new Tile(i, j, STAGE, selectedOptions);

        tiles[i][j] = tile;
      }
    }

    updateCanvasSize();
    generateRandomGrid(randInt(4));
  }

  initialize();
  createjs.Ticker.addEventListener("tick", STAGE);

  function startPathing() {
    testMob.spawn(tileSize)
    testMob.startPathing();
  }

  function newRandomMap() {
    testMob.die()
    generateRandomGrid(randInt(4));
  }

  function generateRandomGrid(numCPs = 2) {
    for (let i = 0; i < GRID_WIDTH; i++) {
      for (let j = 0; j < GRID_HEIGHT; j++) {
        tiles[i][j].changeType(TILE_TYPES.BLANK);
      }
    }

    // Add random void tiles
    for (let i = 0; i < GRID_WIDTH * 2; i++) {
      let x = Math.floor(Math.random() * GRID_WIDTH);
      let y = Math.floor(Math.random() * GRID_HEIGHT);

      tiles[x][y].changeType(TILE_TYPES.VOID);
    }

    // Add start, finish, and cps
    let startX = Math.floor(Math.random() * (GRID_WIDTH/2));
    let startY = Math.floor(Math.random() * (GRID_HEIGHT/2));
    let finishX = Math.floor(Math.random() * (GRID_WIDTH/2) + GRID_WIDTH/2);
    let finishY = Math.floor(Math.random() * (GRID_HEIGHT/2) + GRID_HEIGHT/2);

    for (let i = numCPs; i > 0; i--) {
      let cpX = Math.floor(Math.random() * (GRID_WIDTH));
      let cpY = Math.floor(Math.random() * (GRID_HEIGHT));

      tiles[cpX][cpY].changeType(TILE_TYPES.CHECKPOINT, i);
    }

    // TODO: Prevent CPs from spawning on top of or next to start/finish
    tiles[startX][startY].changeType(TILE_TYPES.START);
    tiles[finishX][finishY].changeType(TILE_TYPES.FINISH);

    testMob = new Mob(STAGE, tiles, numCPs + 1, pathfinder);

    draw();
  }

  function generateRandomCoord(max, min = null) {
    let coord = new Coord();
    let cp1X = Math.floor(Math.random() * (GRID_WIDTH));
    let cp1Y = Math.floor(Math.random() * (GRID_HEIGHT));
  }

  // Updates the size of the canvas after the window is resized
  window.addEventListener('resize', debounce(500, handleResize));

  function handleResize() {
    updateCanvasSize();
    draw();
  }

  // Update the size of the canvas depending on the window width
  // Also updates tileSize
  function updateCanvasSize() {
    var canvasWidth = window.innerWidth * 0.75;
    var canvasHeight = canvasWidth * GRID_HEIGHT / GRID_WIDTH; // 20 x 12
    tileSize = canvasWidth / GRID_WIDTH;
    CANVAS.setAttribute("width", canvasWidth);
    CANVAS.setAttribute("height", canvasHeight);
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
