import { Rock, Wall, Tower } from "./tileObject.js";

const TILE_TYPES = {
  START: "start",
  FINISH: "finish",
  CHECKPOINT: "checkpoint",
  TP_IN: "tpIn",
  TP_OUT: "tpOut",
  BLANK: "blank",
};

// Eventually replace these with image files or possibly more complex vector graphics
const TILE_COLORS = {
  [TILE_TYPES.START]: "green",
  [TILE_TYPES.FINISH]: "red",
  [TILE_TYPES.CHECKPOINT]: "yellow",
  [TILE_TYPES.TP_IN]: "cyan",
  [TILE_TYPES.TP_OUT]: "blue",
  [TILE_TYPES.BLANK]: "gray",
};

// Represents a single Tile on the board
// Types: Start, Finish, Checkpoint, Teleport In/Out, Blank.
class Tile {
  constructor(x, y, stage, options, type = TILE_TYPES.BLANK, cpNum = 0, contents = null) {
    this.x = x;
    this.y = y;
    this.stage = stage;
    this.type = type;
    this.cpNum = cpNum; // Checkpoint number
    this.contents = contents;
    this.shape = new createjs.Shape();
    this.shape.addEventListener("click", () => this.handleClick(options.selectedTool));
    stage.addChild(this.shape);
  }

  // Returns true if this tile type can contain a tileObject and doesn't already have one
  isBuildable() {
    return this.contents == null &&
    (
      this.type === TILE_TYPES.BLANK
      || this.type === TILE_TYPES.TP_IN
      || this.type === TILE_TYPES.TP_OUT
    );
  }

  // Returns true if the tile can be pathed over, false otherwise
  isPathable() {
    return this.contents == null; // Assuming any type of content makes tile unpathable
  }

  // Change the tile type of this tile
  changeType(newType, cpNum = 0) {
    if (!Object.values(TILE_TYPES).includes(newType)) throw `Invalid tile type: ${newType}`;
    this.clearContents();
    this.type = newType;
    this.cpNum = cpNum;
  }

  addItem(item) {
    console.log(this.x, this.y);
    item == "wall" ? this.addWall() : item == "tower" ? this.addTower() : item == "rock" ? this.addRock() : this.clearContents();
  }

  addWall() {
    this.clearContents();
    this.contents = new Wall(this.stage);
  }

  addRock() {
    this.clearContents();
    this.contents = new Rock(this.stage);
  }

  addTower() {
    this.clearContents();
    this.contents = new Tower(this.stage);
  }

  // Remove any object on this tile (Wall, Rock, Tower)
  clearContents() {
    this.contents ? this.contents.clear() : null;
    this.contents = null;
  }

  // Reacts to being clicked. Tool should indicate the intent of the click.
  handleClick(tool) {
    if (this.isBuildable()) {
      this.addItem(tool);
    }

    if (!this.isBuildable() && tool == "sell") {
      this.clearContents();
    }

    this.render();
    this.stage.update();
  }

  // TODO: Maybe investigate caching for this?
  render(tileSize = this.tileSize) {
    this.tileSize = tileSize; // Store tileSize for later use
    // render tile (This will execute type dependant display code)
    this.shape.graphics.clear().beginStroke('black').beginFill(TILE_COLORS[this.type])
    .drawRect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);

    if (this.contents) {
      // render contents on tile (This executes the content's render method)
      this.contents.render(this.x * tileSize, this.y * tileSize, tileSize);
    }
  }
}

export { Tile, TILE_TYPES };
