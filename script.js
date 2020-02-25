'use strict';

import {Game} from './Game.js';

// setting parameters for the game and creating UI
const game = new Game({
  gridSize: {
    rowCount: 10,
    columnCount: 10
  },
  totalMines: 15
});

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
