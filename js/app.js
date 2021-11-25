'use strict';
const FLAG_IMG = '&#x1F6A9;';
const MINE_IMG = '&#x1F4A3;';
const EMPTY = ''

// Global Variables
var gBoard;
var gClicks = 0;
var gLives = 3;
var gSafeClick = 3;

var gLevel = {
  SIZE: 4,
  MINES: 2,
};

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0
};

function init() {
  restartGame()
  gBoard = buildBoard();
  renderBoard(gBoard);
}


//BOARD FUNCS
function setLevel(size, mines) {
  gLevel.SIZE = size
  gLevel.MINES = mines
  switch (size) {
    case 12: var elContainer = document.querySelector('.container')
      elContainer.style.width = '550px'
      break;
    case 8: var elContainer = document.querySelector('.container')
      elContainer.style.width = '450px'
      break;
    case 4: var elContainer = document.querySelector('.container')
      elContainer.style.width = '300px'
      break;
  }
  return init()
}


function buildBoard() {
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: null,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  return board;
}

function renderBoard(board) {
  var elBoard = document.querySelector('.board');
  var strHTML = '';

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';

    for (var j = 0; j < board.length; j++) {
      var currCell = board[i][j];
      var className = 'cell-' + i + '-' + j;

      if (!currCell.isShown) className += ' hidden';

      strHTML += `<td class="cell ${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, event, ${i}, ${j})"></td>`;
    }

    strHTML += '</tr>';
  }
  elBoard.innerHTML = strHTML;
}

//MINES FUNCS
function setMinesNegsCount(board, row, col) {
  var minesNegsCount = 0;

  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;

    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j > board[i].length - 1) continue;
      if (i === row && j === col) continue;

      if (board[i][j].isMine) minesNegsCount++;
    }
  }

  return minesNegsCount;
}

function setMinesOnBoard(board, amount) {
  for (var i = 0; i < amount; i++) {
    var row = getRandomInt(0, board.length);
    var col = getRandomInt(0, board[0].length);

    if (board[row][col].isMine) i--;
    console.log('BOMBS', row, col);

    board[row][col].isMine = true;
  }
}

//LEFT/RIGHT CLICK CELL FUNCS
function cellClicked(cell, i, j) {
  if (!gGame.isOn) return;

  var clickedCell = gBoard[i][j];

  if (clickedCell.isShown) return;
  if (clickedCell.isMarked) return;

  gGame.shownCount++
  console.log('gGame.shownCount:', gGame.shownCount);

  clickedCell.isShown = true;
  gClicks++
  if (clickedCell.isMine) {
    return endGame();
  }

  if (gClicks === 1) {
    startTimer()
    setMinesOnBoard(gBoard, gLevel.MINES);
  }
  var minesNegsCount = setMinesNegsCount(gBoard, i, j);
  if (minesNegsCount > 0) cell.innerHTML = minesNegsCount;
  cell.classList.remove('hidden');
  cell.style.color = colorizeCell(minesNegsCount);

  if (!minesNegsCount) expandShown(i, j);

  if (checkVictory()) return endGame(true);
}


function cellMarked(cell, event, i, j) {
  event.preventDefault();

  if (!gGame.isOn) return;

  var clickedCell = gBoard[i][j];
  clickedCell.isMarked = !clickedCell.isMarked;

  if (clickedCell.isShown) return;

  if (clickedCell.isMarked) {
    gGame.markedCount++
    if (gGame.markedCount > gLevel.MINES) return;
    console.log('gGame.markedCount:', gGame.markedCount);
    cell.innerHTML = FLAG_IMG
  } else {
    cell.innerHTML = EMPTY
    gGame.markedCount--
    console.log('gGame.markedCount:', gGame.markedCount);

  }
  if (checkVictory()) return endGame(true);
}


//START/END GAME FUNCS
function restartGame() {
  resetTimer()
  gGame.isOn = true
  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gClicks = 0
  gLives = 3
  gSafeClick = 3
  var elSmile = document.querySelector('.smiley')
  elSmile.innerText = '😃'
  var elSpan = document.querySelector('.safe span')
  elSpan.innerText = gSafeClick
  closeModal()
}

function checkVictory() {
  if (gGame.shownCount + gGame.markedCount === gBoard.length ** 2 ||
    gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES) return true
  else return false

}

function endGame(isWin = false) {
  var elSmile = document.querySelector('.smiley')
  // var elLives = document.querySelector('.lives')
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var currCell = gBoard[i][j];

      if (currCell.isMine) {
        var elCell = document.querySelector(`.cell-${i}-${j}`);

        if (!isWin) {
          elCell.classList.remove('hidden');
          elCell.innerHTML = MINE_IMG
          elSmile.innerText = '🤯'
          resetTimer()
          openModal('Sorry...You LOST')

        } else {
          elCell.innerHTML = FLAG_IMG
          elSmile.innerText = '😎'
          resetTimer()
          openModal('🎊You Won!🎊')
        }

      }
    }
  }
  gClicks = 0
  gGame.isOn = false;
}


//MODAL
function openModal(str) {
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'block'
  elModal.innerText = str
}

function closeModal() {
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'none'
}


//RECURSION
function expandShown(row, col) {
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j > gBoard[i].length - 1) continue;
      if (i === row && j === col) continue;

      var minesNegsCount = setMinesNegsCount(gBoard, i, j);

      if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.classList.remove('hidden');
        elCell.style.color = colorizeCell(minesNegsCount);

        if (minesNegsCount > 0) elCell.innerHTML = minesNegsCount;

        gBoard[i][j].isShown = true;
        gGame.shownCount++
        // console.log(' gGame.shownCount:', gGame.shownCount);

        if (!minesNegsCount) expandShown(i, j);
      }
    }
  }
}

//COLORING
function colorizeCell(num) {
  var color = '';

  switch (num) {
    case 1:
      color = 'blue';
      break;
    case 2:
      color = 'green';
      break;
    case 3:
      color = 'red';
      break;
    case 4:
      color = 'black';
      break;
    default:
      color = '#fafafa';
      break;
  }

  return color;
}

//TIMER
var gIntrevalTimer;
var gSeconds = 0;
function startTimer() {
  gIntrevalTimer = setInterval(function () {
    var elTime = document.querySelector('.time span');
    gSeconds += 1
    gGame.secsPassed = gSeconds
    elTime.innerText = gSeconds
  }, 1000)

}
function resetTimer() {
  var elTime = document.querySelector('.time span');
  gSeconds = 0
  elTime.innerText = gSeconds;
  clearInterval(gIntrevalTimer)
}

//SAFE CLICK - NO MINE NO SHOWN
function safeClick() {
  if (!gGame.isOn) return
  if (!gSafeClick) return
  var rndi = getRandomInt(0, gBoard.length)
  var rndj = getRandomInt(0, gBoard.length)
  console.log('i,j:', rndi, rndj);
  if (gBoard[rndi][rndj].isMine || gBoard[rndi][rndj].isShown) safeClick()
  else {
    var elCell = document.querySelector(`.cell-${rndi}-${rndj}`)
    // console.log('elCell:', elCell);
    elCell.classList.remove('hidden');
    var elSpan = document.querySelector('.safe span')
    gSafeClick--
    elSpan.innerText = gSafeClick
    setTimeout(() => {
      elCell.classList.add('hidden');
    }, 700)

  }
}

