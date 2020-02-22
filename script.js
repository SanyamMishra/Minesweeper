'use strict';

// Cell class
class Cell {
  // cell icon
  static icons = {
    flag: '<i class="fas fa-flag"></i>',
    mine: '<i class="fas fa-mine"></i>'
  };

  // create a new cell
  constructor(x, y) {
    // set the cell coordinates
    this.x = +x;
    this.y = +y;

    // create the DOM representation of the cell
    this.domElement = document.createElement('div');
    this.domElement.className = 'cell';
    this.domElement.dataset.x = this.x;
    this.domElement.dataset.y = this.y;

    // add the cell to the UI
    document.querySelector('.minesweeper-grid').append(this.domElement);

    // set the cell flags
    this.mined = false;
    this.revealed = false;
    this.flagged = false;

    // setting the neighbourhood mines count
    this.mineCount = 0;
  }

  // return the X coordinate of the cell
  getX() {
    return this.x;
  }

  // return the Y coordinate of the cell
  getY() {
    return this.y;
  }

  // check if the cell is equal to the compareCell
  equals(compareCell) {
    if (this.x === compareCell.x && this.y === compareCell.y) {
      return true;
    }

    return false;
  }

  // check if the cell contains a mine
  isHavingMine() {
    return this.mined;
  }

  // check if the cell is flagged
  isFlagged() {
    return this.flagged;
  }

  // add a mine to the the cell
  addMine() {
    this.domElement.classList.add('containsMine');
    this.mined = true;
  }

  // mark this cell as flagged
  addFlag() {
    if (this.revealed || this.flagged) return;

    this.domElement.innerHTML = Cell.icons.flag;
    this.domElement.classList.add('flagged');
    this.flagged = true;
  }

  // remove flag from the cell
  removeFlag() {
    if (!this.flagged) return;

    this.domElement.innerHTML = '';
    this.domElement.classList.remove('flagged');
    this.flagged = false;
  }

  // reveal the cell
  reveal(revealIfFlagged = false) {
    // return -1 if the cell is already revealed
    if (this.revealed) return -1;

    // return 0 if the cell is flagged and cannot be revealed forcibly
    if (!revealIfFlagged && this.flagged) return 0;

    if (this.mined) {
      this.domElement.innerHTML = Cell.icons.mine;
      this.domElement.classList.add('mined');
    } else {
      if (this.mineCount) {
        this.domElement.innerHTML = this.mineCount;
      }
      this.domElement.classList.add('revealed');
    }
    this.revealed = true;

    // return 1 if the cell is revealed
    return 1;
  }

  // get the count of mines in the neighbourhood of the cell
  getMineCount() {
    return this.mineCount;
  }

  // set the count of mines in the neighbourhood of the cell
  setMineCount(mineCount) {
    if (mineCount > 0) {
      this.mineCount = mineCount;
    }
  }

  // check if the cell is in vicinity of the provided compareCell
  isNeighbourOf(compareCell) {
    if (Math.abs(this.x - compareCell.getX()) <= 1 && Math.abs(this.y - compareCell.getY()) <= 1) {
      return true;
    }

    return false;
  }

  // toggle the flag of the cell
  toggleFlag() {
    if (this.flagged) {
      this.removeFlag();
    } else {
      this.addFlag();
    } 
  }
}

// Grid class
class Grid {
  // create a new grid
  constructor(rowCount, columnCount, totalMines) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.totalMines = totalMines;

    // 2D array of cells
    this.grid = [...Array(this.rowCount)].map((row, rowIndex) => {
      return [...Array(this.columnCount)].map((cell, columnIndex) => { 
        return new Cell(rowIndex, columnIndex);
      });
    });

    this.mineCells = [];
    this.unrevealedCellsCount = rowCount * columnCount;
  }

  // loop through all the cells of the grid
  forEachCell(callback) {
    this.grid.forEach((gridRow) => {
      gridRow.forEach((cell) => {
        callback(cell);
      });
    });
  }

  // place mines on the grid at random
  placeMines(seedCell) {
    let totalMinesPlaced = 0;

    while (totalMinesPlaced < this.totalMines) {
      // select a new cell to mine at random
      const x = Math.floor(Math.random() * this.rowCount);
      const y = Math.floor(Math.random() * this.columnCount);
      const mineCell = this.grid[x][y];
      
      // select another cell to mine if current cell is already mined
      if (mineCell.isHavingMine()) continue;
      
      // select another cell to mine if current cell is the seed cell itself
      if (mineCell.equals(seedCell)) continue;

      // select another cell to mine if current cell is a neighbour of seed cell
      if (mineCell.isNeighbourOf(seedCell)) continue;

      // save current mine cell
      mineCell.addMine();
      this.mineCells.push(mineCell);
      totalMinesPlaced++;
    }

    // update mine counts of all the cells in the grid
    this.updateMineCounts();
  }

  // get a cell placed at (x,y) coordinates
  getCell(x, y) {
    return this.grid[x][y];
  }

  // get total mine count of the grid
  getTotalMines() {
    return this.totalMines;
  }

  // get all the mine cells of the grid
  getAllMineCells() {
    return this.mineCells;
  }

  // reveal all the mine cells of the grid
  revealAllMines(revealGapTime = 50) {
    this.mineCells.forEach((mineCell, index) => setTimeout(() => {
      // try to forcibly reveal the mine cell
      const isRevealed = mineCell.reveal(true);
      if(isRevealed === 1) {
        this.unrevealedCellsCount--;
      }
    }, index * revealGapTime));
  }

  // decrease the unrevealed cells counter
  decreaseUnrevealedCellsCount() {
    this.unrevealedCellsCount--;
  }

  // get the current unrevealed cells count
  getUnrevealedCellsCount() {
    return this.unrevealedCellsCount;
  }

  // loop through the neighbourhood of a cell, once for each cell
  forEachNeighbourhoodCell(cell, callback) {
    // getting the neighbourhood boundaries of the cell
    const cellX = cell.getX();
    const cellY = cell.getY();
    const minX = cellX === 0 ? 0 : cellX - 1;
    const minY = cellY === 0 ? 0 : cellY - 1;
    const maxX = cellX === (this.rowCount - 1) ? cellX : cellX + 1;
    const maxY = cellY === (this.columnCount - 1) ? cellY : cellY + 1;

    // looping through the neighbourhood
    for(let i = minX; i <= maxX; i++) {
      for(let j = minY; j <= maxY; j++) {
        // skipping the cell itself
        if (i === cellX && j === cellY) continue;

        // calling the callback once for each neighbourhood cell
        callback(this.grid[i][j]);
      }
    }
  }

  // update mine count of each cell in the grid
  updateMineCounts() {
    this.forEachCell((cell) => {
      let mineCount = 0;
      this.forEachNeighbourhoodCell(cell, neighbourCell => neighbourCell.isHavingMine() ? mineCount++ : '');
      cell.setMineCount(mineCount);
    });
  }
  
  // reset every cell in the grid
  reset() {
    this.forEachCell(cell => {
      cell.domElement.innerHTML = '';
      cell.domElement.className = 'cell';
    });
    
    this.mineCells = [];
  }
}

// Game class
class Game {
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

// handle the user action
function handleUserInteraction(cellDomElement, interactionType) {
  if (!cellDomElement) return;

  const x = cellDomElement.dataset.x;
  const y = cellDomElement.dataset.y;

  // initialise the game if not started already
  if (!game.isStarted()) game.init(x, y);
  
  // analyse the move of the user
  game.analyseMove({x, y}, interactionType);
}

document.querySelector('.minesweeper-grid').addEventListener('click', e => {
  handleUserInteraction(e.target.closest('.cell'));
});

document.querySelector('.minesweeper-grid').addEventListener('contextmenu', e => {
  e.preventDefault();
  handleUserInteraction(e.target.closest('.cell'), 'contextmenu');
});

// setting parameters for the game and creating UI
const game = new Game({
  gridSize: {
    rowCount: 10,
    columnCount: 10
  },
  totalMines: 15
});
