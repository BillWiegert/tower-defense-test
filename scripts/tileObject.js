const OBJ_SCALE = 0.9;

// Represents a game object contained on a tile (Rock, Wall, Turret).
class TileObject {
  constructor(stage) {
    this.shape = new createjs.Shape();
    stage.addChild(this.shape);
  }

  clear() {
    this.shape.graphics.clear();
  }

  render(x, y, tileSize) {
    this.shape.graphics.clear().beginStroke("black").beginFill(this.fillColor).drawRoundRect(x + tileSize * ((1 - OBJ_SCALE) / 2), y + tileSize * ((1 - OBJ_SCALE) / 2), tileSize * OBJ_SCALE, tileSize * OBJ_SCALE, tileSize/3);
  }
}

class Rock extends TileObject {
  constructor(...args) {
    super(...args);
    this.fillColor = "#654321";
  }
}

class Wall extends TileObject {
  constructor(...args) {
    super(...args);
    this.fillColor = "#048";
  }
}

class Tower extends TileObject {
  constructor(...args) {
    super(...args);
    this.fillColor = "#639";
  }
}

export { Rock, Wall, Tower };
