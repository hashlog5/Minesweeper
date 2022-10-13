const gridWidth = 10;
const gridHeight = 10;
const numberOfSquares = gridWidth * gridHeight;

const numberOfMines = 15;
const numberOfBlanks = numberOfSquares - numberOfMines;

const gameGrid = document.querySelector('#game-grid');
function createGameGrid() {
  for (let i = 0; i < numberOfSquares; i++) {
    gameGrid.innerHTML += `<div class="square" data-index="${i}" data-square="blank" data-adj-mines="0" data-status="hidden"></div>`;
  }
}
createGameGrid();

const timeCounter = document.querySelector('#time-counter');
const flagsCounter = document.querySelector('#flags-counter');
const resetGameBtn = document.querySelector('#reset-game-btn');
const squares = document.querySelectorAll('.square');

let gameInitiated;
let revealedSquares;
let flags;
let adjMines;

let sec;
let min;
let hr;
let secDisplay;
let minDisplay;
let hrDisplay;

let countTimeId;
let checkAdjSquaresId;
let youWinId;
let gameOverId;

resetGameBtn.addEventListener('click', resetGame);
squares.forEach((square) => {
  square.addEventListener('contextmenu', flagSquare);
  square.addEventListener('click', () => {
    checkSquare(parseInt(square.getAttribute('data-index')));
  });
});

function resetGame() {
  gameInitiated = false;
  revealedSquares = 0;
  flags = numberOfMines;
  sec = 0;
  min = 0;
  hr = 0;

  flagsCounter.textContent = flags;
  timeCounter.textContent = `00:00:00`;

  clearInterval(countTimeId);
  clearTimeout(checkAdjSquaresId);
  clearTimeout(youWinId);
  clearTimeout(gameOverId);

  setMines();
  countAdjMines();
  gameGrid.classList.remove('disabled');
}
resetGame();

function setMines() {
  const mineTiles = Array(numberOfMines).fill('mine');
  const blankTiles = Array(numberOfBlanks).fill('blank');
  const tiles = mineTiles.concat(blankTiles);

  tiles.sort(() => Math.random() - 0.5);
  for (let i = 0; i < numberOfSquares; i++) {
    squares[i].setAttribute('data-square', tiles[i]);
    squares[i].setAttribute('data-status', 'hidden');
    squares[i].textContent = '';
  }
}

function countAdjMines() {
  for (let i = 0; i < numberOfSquares; i++) {
    if (squares[i].getAttribute('data-square') === 'blank') {
      adjMines = 0;

      const leftEdge = i % gridWidth === 0;
      const rightEdge = i % gridWidth === gridWidth - 1;

      if (!leftEdge && squares[i - 1]?.getAttribute('data-square') === 'mine')
        adjMines++;
      if (!rightEdge && squares[i + 1]?.getAttribute('data-square') === 'mine')
        adjMines++;

      if (squares[i - gridWidth]?.getAttribute('data-square') === 'mine')
        adjMines++;
      if (squares[i + gridWidth]?.getAttribute('data-square') === 'mine')
        adjMines++;

      if (
        !leftEdge &&
        squares[i - gridWidth - 1]?.getAttribute('data-square') === 'mine'
      )
        adjMines++;
      if (
        !rightEdge &&
        squares[i - gridWidth + 1]?.getAttribute('data-square') === 'mine'
      )
        adjMines++;

      if (
        !leftEdge &&
        squares[i + gridWidth - 1]?.getAttribute('data-square') === 'mine'
      )
        adjMines++;
      if (
        !rightEdge &&
        squares[i + gridWidth + 1]?.getAttribute('data-square') === 'mine'
      )
        adjMines++;

      squares[i].setAttribute('data-adj-mines', adjMines);
    }
  }
}

function flagSquare(e) {
  e.preventDefault();

  if (this.getAttribute('data-status') === 'hidden') {
    this.setAttribute('data-status', 'flagged');
    this.textContent = '🚩';
    removeFlagCount();
  } else if (this.getAttribute('data-status') === 'flagged') {
    this.setAttribute('data-status', 'hidden');
    this.textContent = '';
    addFlagCount();
  }
}

function checkSquare(i) {
  if (squares[i].getAttribute('data-status') === 'revealed') return;
  if (squares[i].getAttribute('data-status') === 'flagged') addFlagCount();

  if (squares[i].getAttribute('data-square') === 'mine') {
    if (gameInitiated) {
      squares[i].setAttribute('data-status', 'blown');
      gameOver();
    } else {
      resetGame();
      checkSquare(i);
    }
  } else {
    if (!gameInitiated) {
      gameInitiated = true;
      countTimeId = setInterval(countTime, 1000);
    }

    revealedSquares++;
    if (squares[i].getAttribute('data-adj-mines') === '0') {
      squares[i].textContent = '';
      squares[i].setAttribute('data-status', 'revealed');

      checkAdjSquares(i);
    } else {
      squares[i].textContent = squares[i].getAttribute('data-adj-mines');
      squares[i].setAttribute('data-status', 'revealed');
    }

    if (revealedSquares === numberOfBlanks) youWin();
  }
}

function checkAdjSquares(i) {
  const leftEdge = i % gridWidth === 0;
  const rightEdge = i % gridWidth === gridWidth - 1;

  checkAdjSquaresId = setTimeout(() => {
    if (!leftEdge && squares[i - 1]?.getAttribute('data-square') === 'blank')
      checkSquare(i - 1);
    if (!rightEdge && squares[i + 1]?.getAttribute('data-square') === 'blank')
      checkSquare(i + 1);

    if (squares[i - gridWidth]?.getAttribute('data-square') === 'blank')
      checkSquare(i - gridWidth);
    if (squares[i + gridWidth]?.getAttribute('data-square') === 'blank')
      checkSquare(i + gridWidth);

    if (
      !leftEdge &&
      squares[i - gridWidth - 1]?.getAttribute('data-square') === 'blank'
    )
      checkSquare(i - gridWidth - 1);
    if (
      !rightEdge &&
      squares[i - gridWidth + 1]?.getAttribute('data-square') === 'blank'
    )
      checkSquare(i - gridWidth + 1);

    if (
      !leftEdge &&
      squares[i + gridWidth - 1]?.getAttribute('data-square') === 'blank'
    )
      checkSquare(i + gridWidth - 1);
    if (
      !rightEdge &&
      squares[i + gridWidth + 1]?.getAttribute('data-square') === 'blank'
    )
      checkSquare(i + gridWidth + 1);
  }, 10);
}

function youWin() {
  clearInterval(countTimeId);
  gameGrid.classList.add('disabled');

  squares.forEach((square) => {
    if (square.getAttribute('data-square') === 'mine') {
      square.textContent = '🚩';
    }
  });

  youWinId = setTimeout(() => {
    alert('You Win!');
  }, 100);
}

function gameOver() {
  clearInterval(countTimeId);
  gameGrid.classList.add('disabled');

  squares.forEach((square) => {
    if (square.getAttribute('data-square') === 'mine') {
      square.textContent = '💥';
    }
  });

  gameOverId = setTimeout(() => {
    alert('Game Over!');
  }, 100);
}

function addFlagCount() {
  flags++;
  flagsCounter.textContent = flags;
}

function removeFlagCount() {
  flags--;
  flagsCounter.textContent = flags;
}

function countTime() {
  sec++;

  if (sec === 60) {
    sec = 0;
    min++;

    if (min === 60) {
      min = 0;
      hr++;
    }
  }

  sec < 10 ? (secDisplay = `0${sec}`) : (secDisplay = sec);
  min < 10 ? (minDisplay = `0${min}`) : (minDisplay = min);
  hr < 10 ? (hrDisplay = `0${hr}`) : (hrDisplay = hr);
  timeCounter.textContent = `${hrDisplay}:${minDisplay}:${secDisplay}`;
}
