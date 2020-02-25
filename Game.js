import {Grid} from './Grid.js';

// Game class
export class Game {
  // create a new game environment
  constructor(options) {
    this.grid = new Grid(options.gridSize.rowCount, options.gridSize.columnCount, options.totalMines);
    this.gameState = {
      started: false,
      over: false
    };
  }

  // initiate the game by placing the mines
  init(x, y) {
    const seedCell = this.grid.getCell(+x, +y);
    this.grid.placeMines(seedCell);
    this.gameState.started = true;
  }

  // check whether the game has started
  isStarted() {
    return this.gameState.started;
  }

  // check whether the game has finished successfully
  checkForSuccess() {
    const areAllMinedCellsFlagged = this.grid.getAllMineCells().reduce((prev, mineCell) => prev ? mineCell.isFlagged() : prev, true);
    if (areAllMinedCellsFlagged || this.grid.getUnrevealedCellsCount() === this.grid.getTotalMines()) {
      this.gameState.over = true;
      alert('Congratulations! You Won!');
      // this.reset();
    }
  }

  // analyse the move of the player
  analyseMove(cellCoordinates, interactionType = 'click') {
    // get the cell from the coordinates
    const cell = this.grid.getCell(+cellCoordinates.x, +cellCoordinates.y);

    if (interactionType === 'click') {
      const isRevealed = cell.reveal();
      if (isRevealed !== 1) return;

      this.grid.decreaseUnrevealedCellsCount();

      // if cell is mined then reveal all the mines of the grid
      // GAME OVER
      if (cell.isHavingMine()) {
        // reveal all mines
        this.gameState.over = true;
        this.grid.revealAllMines();
        return;
      }

      // if there was no mine in the neighbourhood of the cell,
      // then look for mines in the neighbourhood of the neighbouring cells
      if (!cell.getMineCount()) {
        this.grid.forEachNeighbourhoodCell(cell, neighbourCell => this.analyseMove({x: neighbourCell.getX(), y: neighbourCell.getY()}));
      }
    } else if (interactionType === 'contextmenu') {
      cell.toggleFlag();
    }

    if (!this.gameState.over) {
      this.checkForSuccess();
    }
  }

  // reset the game
  reset() {
    this.grid.reset();
    this.gameState = {
      started : false,
      over: false
    };
  }
}
