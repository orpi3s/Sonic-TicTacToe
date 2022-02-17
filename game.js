//Options JS
const options = document.querySelector(".options");
//All Buttons for Pre game opt's
const AIT = document.querySelector(".ai");
const friend = document.querySelector(".friend");
const x = document.querySelector(".x");
const o = document.querySelector(".o");
const play = document.querySelector(".play");

//End Game
const gameOverElement = document.querySelector(".gameover");

const player = new Object();
//let opp remain undefined need it for logic with functions:
//note come back to this after styling
let Opponent;

//Contains reults of player selection options
o.addEventListener("click", function () {
  player.ai = "X";
  player.friend = "X";
  player.you = "O";

  ActiveUser(x, o);
});

x.addEventListener("click", function () {
  player.ai = "O";
  player.friend = "O";
  player.you = "X";

  ActiveUser(o, x);
});

AIT.addEventListener("click", function () {
  Opponent = "ai";
  ActiveUser(friend, AIT);
});

friend.addEventListener("click", function () {
  Opponent = "friend";
  ActiveUser(AIT, friend);
});

play.addEventListener("click", function () {
  if (!Opponent) {
    AIT.style.backgroundColor = "blue";
    friend.style.backgroundColor = "blue";
    return;
  }

  if (!player.you) {
    o.style.backgroundColor = "blue";
    x.style.backgroundColor = "blue";
    return;
  }

  init(player, Opponent);
  options.classList.add("hide");
});

function ActiveUser(off, on) {
  off.classList.remove("active");
  on.classList.add("active");
}

//Main Game JS
function init(player, Opponent) {
  // Grab canvas tag for play screen
  const canvas = document.getElementById("board");
  const line = canvas.getContext("2d");

  //sitemusic add later
  //window.addEventListener("DOMContentLoaded", (event) => {
  //const audio = document.querySelector("audio");
  //audio.volume = 0.2;
  //audio.play();
  //});

  // board vars and array data
  let board = [];
  const Vert = 3;
  const Horz = 3;
  const Gaps = 150;
  let gameData = new Array(9);

  //default first move goes to person player not ai
  let currentPlayer = player.you;

  // load sonic & eggman images
  const ImgX = new Image();
  ImgX.src = "X.png";

  const ImgO = new Image();
  ImgO.src = "O.png";

  // Win-combos
  const combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // gameover
  let gameOver = false;

  //function to make the board along with the gaps
  function drawBoard() {
    let id = 0;
    for (let i = 0; i < Horz; i++) {
      board[i] = [];
      for (let j = 0; j < Vert; j++) {
        board[i][j] = id;
        id++;

        line.strokeStyle = "#000";
        line.strokeRect(j * Gaps, i * Gaps, Gaps, Gaps);
      }
    }
  }
  drawBoard();

  //Everything from this one logs players input: Section 1 Start
  canvas.addEventListener("click", function (event) {
    if (gameOver) return;

    // X & Y position of mouse click
    let X = event.clientX - canvas.getBoundingClientRect().x;
    let Y = event.clientY - canvas.getBoundingClientRect().y;

    //using math to input values on board and prevent double inputs
    let i = Math.floor(Y / Gaps);
    let j = Math.floor(X / Gaps);

    let id = board[i][j];
    if (gameData[id]) return;

    // this saves player move to gameData, logs it, and determins if the move wins. NOTE: in that exact order
    gameData[id] = currentPlayer;
    LogBoardMove(currentPlayer, i, j);

    if (isWinner(gameData, currentPlayer)) {
      showGameOver(currentPlayer);
      gameOver = true;
      return;
    }
    // tie game
    if (isTie(gameData)) {
      showGameOver("tie");
      gameOver = true;
      return;
    }
    // Section 1 End

    //ai portion used minimax will post a link in text script this goes in detail soon

    if (Opponent == "ai") {
      let id = mmLogic(gameData, player.ai).id;

      // store the ai's gameData, logs it, and determins if the move wins. NOTE: in that exact order
      gameData[id] = player.ai;

      let space = getIJ(id);
      LogBoardMove(player.ai, space.i, space.j);
      if (isWinner(gameData, player.ai)) {
        showGameOver(player.ai);
        gameOver = true;
        return;
      }
      //tie game
      if (isTie(gameData)) {
        showGameOver("tie");
        gameOver = true;
        return;
      }
    } else {
      // swap turns
      currentPlayer = currentPlayer == player.you ? player.friend : player.you;
    }
  });
  //https://www.youtube.com/watch?v=trKjYdBASyQ
  // minimax note: note the hell out of this it's confusing and i doubt it'll work
  //my OG js was running off loops and if statments quickly got confused and moved on to this method.
  function mmLogic(gameData, PLAYER) {
    if (isWinner(gameData, player.ai)) return { evaluation: +10 };
    if (isWinner(gameData, player.you)) return { evaluation: -10 };
    if (isTie(gameData)) return { evaluation: 0 };

    // scans for empty spaces, saves data, then evals them: Once again in that order
    let eSpace = getEmptySpaces(gameData);
    let moves = [];
    for (let i = 0; i < eSpace.length; i++) {
      // grabs id empty space
      let id = eSpace[i];

      // takes space and backups
      let backup = gameData[id];

      // moves player
      gameData[id] = PLAYER;

      // saves move above and then evals it
      let move = {};
      move.id = id;
      // after it finishes the above it does a move based off that eval
      if (PLAYER == player.ai) {
        move.evaluation = mmLogic(gameData, player.you).evaluation;
      } else {
        move.evaluation = mmLogic(gameData, player.ai).evaluation;
      }

      gameData[id] = backup;
      moves.push(move);
    }

    // mmLogic alg please note pulled all of the logic for MM from YT link
    let bestMove;
    //max
    if (PLAYER == player.ai) {
      let bestEvaluation = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].evaluation > bestEvaluation) {
          bestEvaluation = moves[i].evaluation;
          bestMove = moves[i];
        }
      }
    } else {
      //mini
      let bestEvaluation = +Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].evaluation < bestEvaluation) {
          bestEvaluation = moves[i].evaluation;
          bestMove = moves[i];
        }
      }
    }

    return bestMove;
  }

  // pulls empty spaces once again:
  function getEmptySpaces(gameData) {
    let EMPTY = [];

    for (let id = 0; id < gameData.length; id++) {
      if (!gameData[id]) EMPTY.push(id);
    }

    return EMPTY;
  }

  // i/j value of a space
  function getIJ(id) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] == id) return { i: i, j: j };
      }
    }
  }

  //winner?
  function isWinner(gameData, player) {
    for (let i = 0; i < combos.length; i++) {
      let won = true;

      for (let j = 0; j < combos[i].length; j++) {
        let id = combos[i][j];
        won = gameData[id] == player && won;
      }

      if (won) {
        return true;
      }
    }
    return false;
  }

  // Check for a tie game
  function isTie(gameData) {
    let isBoardFill = true;
    for (let i = 0; i < gameData.length; i++) {
      isBoardFill = gameData[i] && isBoardFill;
    }
    if (isBoardFill) {
      return true;
    }
    return false;
  }

  //Main game over function
  function showGameOver(player) {
    let message = player == "tie" ? "No Winner" : "The Winner is";
    let imgSrc = `${player}.png`;

    gameOverElement.innerHTML = `
            <h1>${message}</1>
            <img class="winner-img" src=${imgSrc} </img>
            <div class="play" onclick="location.reload()">Play Again!</div>
        `;

    gameOverElement.classList.remove("hide");
  }

  // draw on board
  function LogBoardMove(player, i, j) {
    let img = player == "X" ? ImgX : ImgO;

    // the x,y positon of the image are the x,y of the clicked space
    line.drawImage(img, j * Gaps, i * Gaps);
  }
}
