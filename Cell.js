// Cell class
export class Cell {
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
