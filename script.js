'use strict';

let options = {
  gridRows: 10,
  gridColumns: 10,
  mineCount: 15,
  maxNeighbourMines: 3
};

let gameState = {
  started: false,
  markedCorrect: 0,
};

let icons = {
  flag: '<i class="fas fa-flag"></i>',
  bomb: '<i class="fas fa-bomb"></i>'
};

let mineCells = [];

for (let i = 0; i < options.gridRows; i++) {
  for (let j = 0; j < options.gridColumns; j++) {
    let div = document.createElement('div');
    div.className = 'cell';
    div.dataset.x = i;
    div.dataset.y = j;
    document.querySelector('.minesweeper-grid').append(div);
  }
}

function getCellElement(x, y) {
  return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function initGrid(seedCell) {
  let seedCellNeighbours = getCellNeighbours(+seedCell.dataset.x, +seedCell.dataset.y);
  let totalMinesPlaced = 0;

  while (totalMinesPlaced < options.mineCount) {
    // create new mine cell
    let newMineCell = getCellElement(Math.floor(Math.random() * options.gridRows), Math.floor(Math.random() * options.gridColumns));
    
    // create another mine cell if current mine cell is already mined
    if (newMineCell.classList.contains('bomb')) continue;

    // create another mine cell if current mine cell is the seed cell
    if (newMineCell === seedCell) continue;

    // create another mine cell if current mine cell is a 
    // direct neighbour of seed cell
    let neighbourFlag = false;
    for (let neighbour of seedCellNeighbours) {
      if (neighbour !== newMineCell) continue;

      neighbourFlag = true;
      break;
    }
    if (neighbourFlag) continue;

    // create another mine cell if current mine cell has
    // reached the maxNeighbourMines threshold
    let newMineCellNeighbours = getCellNeighbours(+newMineCell.dataset.x, +newMineCell.dataset.y);
    let neighbourMinesThresholdFlag = false;
    for (let neighbour of newMineCellNeighbours) {
      if (getMinesCount(neighbour) < options.maxNeighbourMines) continue;

      neighbourMinesThresholdFlag = true;
      break;
    }
    if (neighbourMinesThresholdFlag) continue;

    // save current mine cell
    newMineCell.classList.add('bomb');
    mineCells.push(newMineCell);
    totalMinesPlaced++;
  }

  gameState.started = true;
}

function getMinesCount(seedCell) {
  let cellNeighbours = getCellNeighbours(+seedCell.dataset.x, +seedCell.dataset.y);
  let minesCount = 0;

  cellNeighbours.forEach(cellNeighbour => {
    if (cellNeighbour.classList.contains('bomb')) minesCount++;
  });

  return minesCount;
}

function analyseCell(x, y) {
  let seedCellElement = getCellElement(x, y);

  if (seedCellElement.classList.contains('revealed') || seedCellElement.classList.contains('flagged')) return;

  if (seedCellElement.classList.contains('bomb')) {
    revealAllBombs(seedCellElement, () => {
      // setTimeout(resetGrid, 5000);
    });
    return;
  }

  seedCellElement.classList.add('revealed');

  let minesCount = getMinesCount(seedCellElement);

  if (!minesCount) analyseCellNeighbours(x, y);
  else seedCellElement.innerHTML = minesCount;
}

function analyseCellNeighbours(x, y) {
  let cellNeighbours = getCellNeighbours(x, y);

  cellNeighbours.forEach(cellNeighbour => analyseCell(+cellNeighbour.dataset.x, +cellNeighbour.dataset.y));
}

function getCellNeighbours(x, y) {
  let seedCellElement = getCellElement(x, y);

  let X = x === 0 ? 0 : x - 1;
  let Y = y === 0 ? 0 : y - 1;
  let maxX = x === (options.gridRows - 1) ? x : x + 1;
  let maxY = y === (options.gridColumns - 1) ? y : y + 1;

  let cellNeighbours = [];
  for (let i = X; i <= maxX; i++) {
    for (let j = Y; j <= maxY; j++) {
      let cellElement = getCellElement(i, j);
      if (cellElement === seedCellElement) continue;

      cellNeighbours.push(cellElement);
    }
  }

  return cellNeighbours;
}

function markCell(seedCell) {
  if (seedCell.classList.contains('flagged')) {
    seedCell.innerHTML = '';
    seedCell.classList.remove('flagged');
    if (seedCell.classList.contains('bomb')) {
      gameState.markedCorrect--;
    }
  } else {
    seedCell.innerHTML = icons.flag;
    seedCell.classList.add('flagged');
    if (seedCell.classList.contains('bomb')) {
      gameState.markedCorrect++;
    }
  } 
}

function resetGrid() {
  for (let cell of document.querySelectorAll('.minesweeper-grid .cell')) {
    cell.innerHTML = '';
    cell.className = 'cell';
  }
  gameState = {
    started : false,
    markedCorrect: 0,
  };
  mineCells = [];
}

function checkForSuccess() {
  if (gameState.markedCorrect === options.mineCount) {
    alert('Congratulations! You Won!');
    // resetGrid();
  }
}

function revealAllBombs(seedCellElement, callback) {
  seedCellElement.innerHTML = icons.bomb;
  seedCellElement.classList.add('bombed');
  for (let i = 0; i < options.mineCount; i++) {
    setTimeout(() => {
      mineCells[i].innerHTML = icons.bomb;
      mineCells[i].classList.add('bombed');
    }, i*50);
  }
  callback();
}

document.querySelector('.minesweeper-grid').addEventListener('click', e => {
  let cell = e.target.closest('.cell');
  if (!cell) return;

  if (!gameState.started) initGrid(cell);
  
  let [cellX, cellY] = [+cell.dataset.x, +cell.dataset.y];
  
  analyseCell(cellX, cellY);

  checkForSuccess();
});

document.querySelector('.minesweeper-grid').addEventListener('contextmenu', e => {
  e.preventDefault();

  let cell = e.target.closest('.cell');
  if (!cell) return;

  if (!gameState.started) initGrid(cell);

  markCell(cell);

  checkForSuccess();
});
