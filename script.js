'use strict';

let options = {
  gridRows: 10,
  gridColumns: 10,
  mineCount: 25
};

let gameState = {
  started: false,
  markedCorrect: 0,
  markedWrong: 0
}

gameState.started = false;

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
  let mineCells = [];

  while(mineCells.length < options.mineCount) {
    let newMineCell = getCellElement(Math.floor(Math.random() * options.gridRows), Math.floor(Math.random() * options.gridColumns));

    if (newMineCell === seedCell) continue;

    let neighbourFlag = false;
    for(let neighbour of seedCellNeighbours) {
      if (neighbour !== newMineCell) continue;

      neighbourFlag = true;
      break;
    }
    if(neighbourFlag) continue;

    if (mineCells.find(mineCell => mineCell === newMineCell)) continue;

    mineCells.push(newMineCell);
  }

  mineCells.forEach(mineCell => mineCell.classList.add('bombed'));

  gameState.started = true;
}

function analyseCell(x, y) {
  let seedCellElement = getCellElement(x, y);

  if (seedCellElement.classList.contains('revealed')) return;

  if (seedCellElement.classList.contains('bombed')) {
    alert('BOOM! Game Over!');
    resetGrid();
    return;
  }

  seedCellElement.classList.add('revealed');

  let cellNeighbours = getCellNeighbours(x, y);
  
  let mineCount = 0;
  cellNeighbours.forEach(cellNeighbour => {
    if (cellNeighbour.classList.contains('bombed')) mineCount++;
  });

  if (!mineCount) analyseCellNeighbours(x, y);
  else seedCellElement.innerHTML = mineCount;
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
  if (seedCell.classList.contains('bombed')) {
    seedCell.innerHTML = 'R';
    gameState.markedCorrect++;
  }
  else {
    seedCell.innerHTML = 'W';
    gameState.markedWrong++;
  }
}

function resetGrid() {
  for(let cell of document.querySelectorAll('.minesweeper-grid .cell')) {
    cell.innerHTML = '';
    cell.className = 'cell';
    gameState = {
      started : false,
      markedCorrect: 0,
      markedWrong: 0
    };
  }
}

function checkForSuccess() {
  if (gameState.markedCorrect === options.mineCount) {
    alert('Congratulations! You Won!');
    resetGrid();
  }
}

document.querySelector('.minesweeper-grid').addEventListener('click', e => {
  let cell = e.target.closest('.cell');
  if(!cell) return;

  if(!gameState.started) initGrid(cell);
  
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