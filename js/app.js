'use strict'

var MINE_IMG = "💣"
var EMPTY = ' '
var FLAG = '🚩'

var gIntrevalTimer
var gSeconds = 0
var gClicks = 0
var gBoard;
var gLevel = {
  SIZE: 4,
  MINES: 2
};
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0
}

function init() {
  closeModal()
  gBoard = createBoard(gLevel.SIZE, gLevel.MINES)
  renderBoard(gBoard)
  gGame.isOn = true

  // placeMines(gBoard, gLevel.MINES)
}

function setLevel(size, mines) {
  gLevel.SIZE = size
  gLevel.MINES = mines
  gBoard = createBoard(size)
  renderBoard(gBoard)

}

function createBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board.push([])
    for (var j = 0; j < size; j++) {
      var cell = {
        minesAroundCount: 4,
        isShown: false,
        isMine: false,
        isMarked: false
      }
      board[i][j] = cell
    }
  }


  console.table(board)
  return board;
}


function renderBoard(board) {
  var strHTML = ''
  // console.table(board);
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      var countMine = setMinesNegsCount(i, j, board)
      board[i][j].minesAroundCount = countMine

      var tdId = `cell-${i}-${j}`
      var cell = board[i][j]
      var className;

      if (!cell.isShown) cell = EMPTY

      strHTML += `
      <td class ="cell" id="${tdId}" data-i="${i}" data-j="${j}" onclick="cellClicked(this)" oncontextmenu="cellMarked(this)">
      ${cell}
      </td>
      `
    }
    strHTML += '</tr>'
  }
  var elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function setMinesNegsCount(cellI, cellJ, mat) {
  var countMine = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j > mat[i].length - 1) continue;
      if (i === cellI && j === cellJ) continue;
      var cell = mat[i][j];
      if (cell.isMine) countMine++

    }
  }
  return countMine;
}





function placeMines(board, amount) {
  for (var i = 0; i < amount; i++) {
    var randI = getRandomInt(0, board.length)
    var randJ = getRandomInt(0, board.length)
    console.log(randI, randJ)
    if (!gBoard[randI][randJ].isMine && !gBoard[randI][randJ].isShown) {
      board[randI][randJ].isMine = true;
    } else {
      i--;
    }
  }
}



//RIGHT CLICK FUNC
function cellMarked(elCell) {
  var cellCoord = getCellCoord(elCell)
  var clicked = gBoard[cellCoord.i][cellCoord.j]
  // console.log('clicked:', clicked);
  document.addEventListener('contextmenu', event => event.preventDefault());

  if (clicked.isShown) return

  if (clicked.isMarked) {
    clicked.isMarked = false
    renderCell(cellCoord.i, cellCoord.j, EMPTY)
    console.log(clicked.isMarked);

  } else {
    clicked.isMarked = true
    renderCell(cellCoord.i, cellCoord.j, FLAG)
    console.log(clicked.isMarked);
  }

  if (clicked.isMine && clicked.isMarked) {
    gGame.markedCount++
    console.log(' gGame.markedCount:', gGame.markedCount);
    checkVictory()
  }
}

//LEFT CLICK FUNC
function cellClicked(elCell) {
  var cellCoord = getCellCoord(elCell)
  var clicked = gBoard[cellCoord.i][cellCoord.j]
  elCell.classList.add('shown')
  gClicks++
  clicked.isShown = true

  if (gClicks === 1) {
    placeMines(gBoard, gLevel.MINES)
    startTimer()
  }

  if (clicked.isMine) {
    renderCell(cellCoord.i, cellCoord.j, MINE)
    resetTimer()
  } else {
    var negs = setMinesNegsCount(cellCoord.i, cellCoord.j, gBoard)
    if (negs) renderCell(cellCoord.i, cellCoord.j, negs)
    checkVictory()
  }

  gGame.shownCount++
  console.log('gGame.shownCount:', gGame.shownCount);

}







function openModal(str) {
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'block'
  elModal.innerText = str
}

function closeModal() {
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'none'
}

function checkVictory() {
  if (gGame.markedCount + gGame.shownCount === (gLevel.SIZE ** 2)) {
    openModal('We Got a Winner')
    resetTimer()
  }
  // console.log('Winner')
}

function getCellCoord(elCell) {
  var i = elCell.dataset.i
  var j = elCell.dataset.j
  var coord = { i, j }
  return coord
}

function renderCell(i, j, value) {
  var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
  // console.log('elCell', elCell);
  elCell.innerText = value;
}

//TIMER
var gStartTime, gEndTime;
function startTimer() {
  gIntrevalTimer = setInterval(function () {
    var elTime = document.querySelector('.time span');
    gSeconds += 1
    gGame.secsPassed = gSeconds
    elTime.innerText = gSeconds
  }, 1000)

}

function resetTimer() {
  var elTime = document.querySelector('.time');
  gSeconds = 0
  elTime.innerText = gSeconds;
}