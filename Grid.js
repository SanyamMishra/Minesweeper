import {Cell} from './Cell.js';

// Grid class
export class Grid {
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
      if (isRevealed === 1) {
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
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
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
