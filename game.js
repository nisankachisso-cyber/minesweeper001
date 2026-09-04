const board = document.getElementById("board");
const message = document.getElementById("message");

const flagCounter = document.getElementById("flag-counter");

const difficulty = document.getElementById("difficulty");
const startButton = document.getElementById("start-button");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

const openModeButton = document.getElementById("open-mode-button");
const flagModeButton = document.getElementById("flag-mode-button");

const treasureCounter = document.getElementById("treasure-counter");
const startTreasurePoints = document.getElementById("start-treasure-points");




/* =========================
ゲームの状態
========================= */

let gameOver = false;

let firstClick = true;

/* 現在の操作モード

"open" → マスを開く
"flag" → 旗を置く
*/

let currentMode = "open";

let rows = 9;
let cols = 9;

let mineTotal = 10;

let remainingFlags = mineTotal;

/* お宝ポイント */

let treasurePoints = 0;

/* =========================
難易度設定
========================= */

const difficulties = {

beginner: {
    rows: 9,
    cols: 9,
    mines: 10
},


intermediate: {
    rows: 16,
    cols: 16,
    mines: 40
},


advanced: {
    rows: 16,
    cols: 30,
    mines: 99
}

};




/* =========================
ゲーム盤
========================= */

const gameBoard = [];




/* =========================
お宝ポイント表示更新
========================= */

function updateTreasurePoints() {

treasureCounter.textContent =
    "💰 " + treasurePoints;


startTreasurePoints.textContent =
    "💰 " + treasurePoints;

}




/* =========================
旗表示更新
========================= */

function updateFlagCounter() {

flagCounter.textContent =
    "🚩 残り：" + remainingFlags;

}




/* =========================
モード変更
========================= */

function setMode(mode) {

currentMode = mode;


/* 開くモード */

if (mode === "open") {

    openModeButton.classList.add("active");

    flagModeButton.classList.remove("active");

}


/* 旗モード */

if (mode === "flag") {

    flagModeButton.classList.add("active");

    openModeButton.classList.remove("active");

}

}




/* =========================
開くモードボタン
========================= */

openModeButton.addEventListener("click", function() {

setMode("open");

});




/* =========================
旗モードボタン
========================= */

flagModeButton.addEventListener("click", function() {

setMode("flag");

});




/* =========================
ゲーム開始
========================= */

function startGame() {

/* 選択された難易度 */

const selectedDifficulty = difficulty.value;

const settings =
    difficulties[selectedDifficulty];


rows = settings.rows;

cols = settings.cols;

mineTotal = settings.mines;


/* 盤面の列数 */

board.style.gridTemplateColumns =
    `repeat(${cols}, 40px)`;


/* 旗 */

remainingFlags = mineTotal;


/* ゲーム状態をリセット */

gameOver = false;

firstClick = true;


/* 最初は開くモード */

setMode("open");


/* 表示をリセット */

message.textContent = "";


updateFlagCounter();

updateTreasurePoints();


/* 古い盤面を消す */

board.innerHTML = "";


/* gameBoardを空にする */

gameBoard.length = 0;


/* =========================
   盤面を作る
========================== */

for (
    let row = 0;
    row < rows;
    row++
) {

    gameBoard[row] = [];


    for (
        let col = 0;
        col < cols;
        col++
    ) {


        /* マスのデータ */

        gameBoard[row][col] = {

            mine: false

        };


        /* HTMLのマス */

        const cell =
            document.createElement("div");


        cell.classList.add("cell");


        cell.dataset.row = row;

        cell.dataset.col = col;


        board.appendChild(cell);



        /* =========================
           マスをタップ
        ========================== */

        cell.addEventListener(
            "click",
            function() {


                /* ゲーム終了後 */

                if (gameOver === true) {

                    return;

                }


                /* -------------------------
                   旗モード
                ------------------------- */

                if (
                    currentMode === "flag"
                ) {

                    toggleFlag(
                        row,
                        col
                    );

                    return;

                }



                /* -------------------------
                   開くモード
                ------------------------- */


                /* 旗があるなら開かない */

                if (
                    cell.dataset.flagged === "true"
                ) {

                    return;

                }


                /* 最初のクリック */

                if (
                    firstClick === true
                ) {

                    placeMines(
                        row,
                        col
                    );


                    firstClick = false;

                }


                /* 爆弾なら */

                if (
                    gameBoard[row][col].mine === true
                ) {

                    message.textContent =
                        "💣 GAME OVER!";


                    cell.style.backgroundColor =
                        "red";


                    gameOver = true;


                } else {


                    /* 爆弾以外 */

                    openCell(
                        row,
                        col
                    );

                }


            }
        );


    }


}

}




/* =========================
旗を置く / 外す
========================= */

function toggleFlag(row, col) {

/* 盤面の外 */

if (
    row < 0 ||
    row >= rows ||
    col < 0 ||
    col >= cols
) {

    return;

}


const cell =
    document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );


/* 開いているマスには旗を置けない */

if (
    cell.dataset.opened === "true"
) {

    return;

}


/* =========================
   旗を外す
========================== */

if (
    cell.dataset.flagged === "true"
) {


    cell.textContent = "";


    cell.dataset.flagged =
        "false";


    remainingFlags++;


    updateFlagCounter();


    return;

}



/* =========================
   旗を置く
========================== */


cell.textContent = "🚩";


cell.dataset.flagged =
    "true";


remainingFlags--;


updateFlagCounter();

}




/* =========================
爆弾を設置
========================= */

function placeMines(
firstRow,
firstCol
) {

let mineCount = 0;


while (
    mineCount < mineTotal
) {


    const randomRow =
        Math.floor(
            Math.random() * rows
        );


    const randomCol =
        Math.floor(
            Math.random() * cols
        );


    /* 最初にクリックした場所との距離 */

    const rowDistance =
        Math.abs(
            randomRow - firstRow
        );


    const colDistance =
        Math.abs(
            randomCol - firstCol
        );


    /* 最初のマスと
       周囲8マスには爆弾を置かない
    */

    if (
        rowDistance <= 1 &&
        colDistance <= 1
    ) {

        continue;

    }


    /* まだ爆弾がない場合 */

    if (
        gameBoard[randomRow][randomCol].mine
        === false
    ) {


        gameBoard[randomRow][randomCol].mine =
            true;


        mineCount++;

    }


}

}




/* =========================
周囲の爆弾を数える
========================= */

function countMines(
row,
col
) {

let count = 0;


for (
    let rowOffset = -1;
    rowOffset <= 1;
    rowOffset++
) {


    for (
        let colOffset = -1;
        colOffset <= 1;
        colOffset++
    ) {


        /* 自分自身 */

        if (
            rowOffset === 0 &&
            colOffset === 0
        ) {

            continue;

        }


        const checkRow =
            row + rowOffset;


        const checkCol =
            col + colOffset;


        /* 盤面の外 */

        if (
            checkRow < 0 ||
            checkRow >= rows ||
            checkCol < 0 ||
            checkCol >= cols
        ) {

            continue;

        }


        /* 爆弾なら */

        if (
            gameBoard[checkRow][checkCol].mine
            === true
        ) {

            count++;

        }


    }


}


return count;

}




/* =========================
マスを開く
========================= */

function openCell(
row,
col
) {

/* 盤面の外 */

if (
    row < 0 ||
    row >= rows ||
    col < 0 ||
    col >= cols
) {

    return;

}


const cell =
    document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );


/* すでに開いている */

if (
    cell.dataset.opened === "true"
) {

    return;

}


/* 爆弾 */

if (
    gameBoard[row][col].mine === true
) {

    return;

}


/* マスを開く */

cell.dataset.opened =
    "true";


cell.style.backgroundColor =
    "lightgray";


/* 旗が立っていた場合 */

if (
    cell.dataset.flagged === "true"
) {


    cell.dataset.flagged =
        "false";


    cell.textContent = "";


    remainingFlags++;


    updateFlagCounter();


}



/* 周囲の爆弾数 */

const mineCount =
    countMines(
        row,
        col
    );


/* 数字を表示 */

if (
    mineCount > 0
) {


    cell.textContent =
        mineCount;


    cell.classList.add(
        "number-" + mineCount
    );


}



/* =========================
   周囲に爆弾がない場合
========================== */

if (
    mineCount === 0
) {


    for (
        let rowOffset = -1;
        rowOffset <= 1;
        rowOffset++
    ) {


        for (
            let colOffset = -1;
            colOffset <= 1;
            colOffset++
        ) {


            /* 自分自身 */

            if (
                rowOffset === 0 &&
                colOffset === 0
            ) {

                continue;

            }


            openCell(
                row + rowOffset,
                col + colOffset
            );


        }


    }


}


checkClear();

}




/* =========================
ゲームクリア判定
========================= */

function checkClear() {

for (
    let row = 0;
    row < rows;
    row++
) {


    for (
        let col = 0;
        col < cols;
        col++
    ) {


        const cell =
            document.querySelector(
                `[data-row="${row}"][data-col="${col}"]`
            );


        /* 爆弾ではなく、
           まだ開いていないマス
        */

        if (

            gameBoard[row][col].mine === false &&

            cell.dataset.opened !== "true"

        ) {

            return;

        }


    }


}


/* ここまで来たらクリア */

message.textContent =
    "🎉 GAME CLEAR!";


gameOver = true;

}




/* =========================
ゲーム開始ボタン
========================= */

startButton.addEventListener(
"click",
function() {

    /* 開始画面を消す */

    startScreen.style.display =
        "none";


    /* ゲーム画面を表示 */

    gameScreen.style.display =
        "block";


    /* ゲーム開始 */

    startGame();


}

);




/* =========================
最初の表示
========================= */

updateTreasurePoints();