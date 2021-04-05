import { Tile, TILE_TYPES } from "./tile.js";
import Pathfinder from "./pathfinder.js";
import Coord from "./coord.js";
import Mob from "./mob.js";
import mulberry32 from "./seededRand.js";

const GRID_WIDTH = 36;
const GRID_HEIGHT = 20;
let tileSize;
var tiles = new Array(GRID_WIDTH);
let pathfinder = new Pathfinder(tiles);
let testMob;
let pathLength = 0;

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

// Generates a 'random' integer from 0 to n - 1 using the given random number generating function.
function randInt(n, func = Math.random) {
  return Math.floor(func() * n);
}

document.addEventListener("DOMContentLoaded", (event) => {
  const CANVAS = document.querySelector("#game-space");
  const STAGE = new createjs.Stage("game-space");
  const TOOLBAR_BUTTONS = document.querySelectorAll(".build-type-btn");
  const RANDOMIZE_BUTTON = document.querySelector("#randomize");
  const START_BUTTON = document.querySelector("#start-btn");
  const PATH_LENGTH = document.querySelector("#path-length");
  const MAP_SEED = document.querySelector("#map-seed");
  const NEW_SEED_NUM = document.querySelector("#new-seed-num");
  const NEW_SEED_BUTTON = document.querySelector("#new-seed-btn");

  // User changable options to change what actions are performed on click
  let selectedOptions = {
    selectedTool:"tower",
    // anything else needed?
  };

  TOOLBAR_BUTTONS.forEach(button => button.addEventListener("click", () => {
    handleToolbarButtonClick(button);
  }));

  document.addEventListener("keydown", function(e) {
    if (e.keyCode === 32) {
      START_BUTTON.click();
      e.preventDefault();
    }
  });

  RANDOMIZE_BUTTON.addEventListener("click", handleRandomSeedClick);
  START_BUTTON.addEventListener("click", startPathing);
  NEW_SEED_NUM.addEventListener("keydown", handleNewSeedNumKeydown);
  NEW_SEED_BUTTON.addEventListener("click", handleNewSeedClick);

  function incrementPathLength() {
    pathLength++;
    PATH_LENGTH.innerHTML = pathLength;
  }

  function resetPathLength() {
    pathLength = 0;
  }

  function updateCurrentSeed(seed) {
    MAP_SEED.innerHTML = seed;
  }

  function handleRandomSeedClick() {
    newRandomMap();
  }

  function handleNewSeedNumKeydown(e) {
    if (e.keyCode === 13) NEW_SEED_BUTTON.click();
  }

  function handleNewSeedClick() {
    newRandomMap(NEW_SEED_NUM.value);
  }

  // Change selectedTool on click and update active button
  function handleToolbarButtonClick(button) {
    document.querySelector("#toolbar > .active").classList.remove("active");
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
    generateRandomGrid();
  }

  initialize();
  createjs.Ticker.addEventListener("tick", STAGE);

  function startPathing() {
    resetPathLength();
    testMob.spawn(tileSize)
    testMob.startPathing();
  }

  function newRandomMap(seed) {
    testMob.die()
    resetPathLength()
    generateRandomGrid(seed);
  }

  function generateRandomGrid(seed = randInt(99999)) {
    updateCurrentSeed(seed);

    // Create seeded pseudo-random number generator
    let seededRand = mulberry32(seed);

    // 0 to 3 checkpoints
    let numCPs = randInt(4, seededRand);

    // Reset all tiles to blanks
    for (let i = 0; i < GRID_WIDTH; i++) {
      for (let j = 0; j < GRID_HEIGHT; j++) {
        tiles[i][j].changeType(TILE_TYPES.BLANK);
      }
    }

    // Add random void tiles
    for (let i = 0; i < GRID_WIDTH * 2; i++) {
      let x = randInt(GRID_WIDTH, seededRand);
      let y = randInt(GRID_HEIGHT, seededRand);

      tiles[x][y].changeType(TILE_TYPES.VOID);
    }

    // Add start, finish, and cps
    let startX = randInt(GRID_WIDTH/2, seededRand);
    let startY = randInt(GRID_HEIGHT/2, seededRand);
    let finishX = randInt(GRID_WIDTH/2, seededRand) + GRID_WIDTH/2;
    let finishY = randInt(GRID_HEIGHT/2, seededRand) + GRID_HEIGHT/2;

    for (let i = numCPs; i > 0; i--) {
      let cpX = randInt(GRID_WIDTH, seededRand);
      let cpY = randInt(GRID_HEIGHT, seededRand);

      tiles[cpX][cpY].changeType(TILE_TYPES.CHECKPOINT, i);
    }

    // TODO: Prevent CPs from spawning on top of or next to start/finish
    tiles[startX][startY].changeType(TILE_TYPES.START);
    tiles[finishX][finishY].changeType(TILE_TYPES.FINISH);

    testMob = new Mob(STAGE, tiles, numCPs + 1, pathfinder);

    // TODO: This is awful, fix it
    testMob.incrementPathLength = incrementPathLength;
    testMob.resetPathLength = resetPathLength;

    draw();
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
