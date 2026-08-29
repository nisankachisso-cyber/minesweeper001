const board = document.getElementById("board");//HTMLの中にある「board」という場所を見つける
const message = document.getElementById("message");//HTMLの中にある「message」という場所を見つける
const flagCounter = document.getElementById("flag-counter");
const difficulty = document.getElementById("difficulty");
const startButton = document.getElementById("start-button");

let gameOver = false;
let firstClick = true;
let longPress = false;//スマホ用設定
let pressTimer;//スマホ用設定

let rows = 9;
let cols = 9;
let mineTotal = 10;

let remainingFlags = mineTotal;

// ゲームの難易度設定
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

// ゲーム盤を作る
const gameBoard = [];

// ゲームを開始する関数
function startGame() {

    // 選択された難易度を取得
    const selectedDifficulty = difficulty.value;
    const settings = difficulties[selectedDifficulty];

    rows = settings.rows;
    cols = settings.cols;
    mineTotal = settings.mines;

    board.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

    remainingFlags = mineTotal;

    gameOver = false;
    firstClick = true;
    longPress = false;

    message.textContent = "";
    flagCounter.textContent = "🚩 残り：" + remainingFlags;

    // 古い盤面を消す
    board.innerHTML = "";

    // gameBoardを空にする
    gameBoard.length = 0;

    // ゲーム盤を作る
    for (let row = 0; row < rows; row++) {

        gameBoard[row] = [];

        for (let col = 0; col < cols; col++) {

            gameBoard[row][col] = {
                mine: false
            };

            const cell = document.createElement("div");//div(さっき並べたもの)にcellという名前を付ける
            cell.classList.add("cell");//cellをboardの中に入れる

            cell.dataset.row = row;
            cell.dataset.col = col;

            board.appendChild(cell);//boardにcellを追加

            //もし、このマスがクリックされたら
            cell.addEventListener("click", function() {

                if (longPress === true) {//スマホ用設定
                    longPress = false;
                    return;
                }

                if (gameOver === true) {// ゲームオーバーなら何もしない
                    return;
                }

                if (cell.dataset.flagged === "true") {//旗が立っていたら何もしない
                    return;
                }

                if (firstClick === true) {//最初のクリックなら爆弾を配置する
                    placeMines(row, col);
                    firstClick = false;
                }

                if (gameBoard[row][col].mine === true) {//もし爆弾なら
                    message.textContent = "💣 GAME OVER!";
                    cell.style.backgroundColor = "red";

                    gameOver = true;

                } else {//爆弾じゃないなら
                    openCell(row, col);

                }

            });

            //右クリックで旗を立てる
            cell.addEventListener("contextmenu", function(event) {

                event.preventDefault();//右クリックしたときに、ブラウザの普通の右クリックメニューを出さない

                if (gameOver === true) {
                    return;
                }

                if (cell.dataset.opened === "true") {//すでに開いたマスには旗を立てられない
                    return;
                }

                if (cell.textContent === "🚩") {//旗を立てる設定
                    cell.textContent = "";
                    cell.dataset.flagged = "false";

                    remainingFlags++;//旗の残りカウント設定
                    flagCounter.textContent = "🚩 残り：" + remainingFlags;

                } else {

                    cell.textContent = "🚩";
                    cell.dataset.flagged = "true";//このマスには旗が立っているとする

                    remainingFlags--;//旗の残りカウント設定
                    flagCounter.textContent = "🚩 残り：" + remainingFlags;
                }

            });

            //スマホ用設定
            cell.addEventListener("touchstart", function() {

                pressTimer = setTimeout(function() {

                    longPress = true;

                    if (gameOver === true) {
                        return;
                    }

                    if (cell.dataset.opened === "true") {
                        return;
                    }

                    if (cell.dataset.flagged === "true") {
                        cell.textContent = "";
                        cell.dataset.flagged = "false";

                        remainingFlags++;//旗の残りカウント設定
                        flagCounter.textContent = "🚩 残り：" + remainingFlags;

                    } else {
                        cell.textContent = "🚩";
                        cell.dataset.flagged = "true";

                        remainingFlags--;//旗の残りカウント設定
                        flagCounter.textContent = "🚩 残り：" + remainingFlags;

                    }

                }, 500);//0.5秒押し続ける

            });

            cell.addEventListener("touchend", function() {
                clearTimeout(pressTimer);
            });

            cell.addEventListener("touchmove", function() {
                clearTimeout(pressTimer);
            });

        }
    }
}


// 爆弾を設置する関数
function placeMines(firstRow, firstCol) {

    let mineCount = 0;

    while (mineCount < mineTotal) {//爆弾が指定された数になるまで、以下の処理を繰り返す

        const randomRow = Math.floor(Math.random() * rows);
        const randomCol = Math.floor(Math.random() * cols);

        //最初にクリックしたマスからの距離
        const rowDistance = Math.abs(randomRow - firstRow);
        const colDistance = Math.abs(randomCol - firstCol);

        if (rowDistance <= 1 && colDistance <= 1) {// 最初のマスと、その周囲8マスには爆弾を置かない
            continue;
        }

        if (gameBoard[randomRow][randomCol].mine === false) {//そこにまだ爆弾がないか

            gameBoard[randomRow][randomCol].mine = true;//ないなら設置

            mineCount++;//爆弾変数の数値を増やす
        }
    }
}


//周囲の爆弾を数える関数
function countMines(row, col) {

    let count = 0;

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {//クリックしたマスから、どれくらい離れたマスを見るか
        for (let colOffset = -1; colOffset <= 1; colOffset++) {//クリックしたマスから、どれくらい離れたマスを見るか

            // ただし、自分自身は調べない
            if (rowOffset === 0 && colOffset === 0) {
                continue;
            }

            const checkRow = row + rowOffset;
            const checkCol = col + colOffset;

            // 盤面の外なら無視。(存在しないマスを調べようとしてエラーになるから)
            if (checkRow < 0 || checkRow >= rows ||
                checkCol < 0 || checkCol >= cols) {
                continue;
            }

            if (gameBoard[checkRow][checkCol].mine === true) {
                count++;
            }
        }
    }

    return count;
}


//マスを開くときの処理
function openCell(row, col) {

    // 盤面の外なら何もしない
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return;
    }

    const cell = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );

    // すでに開いているマスなら何もしない
    if (cell.dataset.opened === "true") {
        return;
    }

    // 爆弾なら何もしない
    if (gameBoard[row][col].mine === true) {
        return;
    }

    // マスを開く
    cell.dataset.opened = "true";
    cell.style.backgroundColor = "lightgray";

    // 旗が立っていたら消す
    if (cell.dataset.flagged === "true") {
        cell.dataset.flagged = "false";
        cell.textContent = "";

        remainingFlags++;
        flagCounter.textContent = "🚩 残り：" + remainingFlags;
    }

    // 周囲の爆弾数を調べる
    const mineCount = countMines(row, col);

    // 0より大きいなら数字を表示
    if (mineCount > 0) {
        cell.textContent = mineCount;
        cell.classList.add("number-" + mineCount);
    }

    // 0なら周囲のマスも開く
    if (mineCount === 0) {

        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {

                if (rowOffset === 0 && colOffset === 0) {
                    continue;
                }

                openCell(row + rowOffset, col + colOffset);//もう一度openCellを実行
            }
        }
    }

    checkClear();
}


//ゲームクリア判定の関数
function checkClear() {

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            // 爆弾ではないのに、まだ開いていないマスがある
            if (
                gameBoard[row][col].mine === false &&
                document.querySelector(
                    `[data-row="${row}"][data-col="${col}"]`
                ).dataset.opened !== "true"
            ) {
                return;
            }
        }
    }

    // ここまで来たら、安全なマスが全部開いている
    message.textContent = "🎉 GAME CLEAR!";
    gameOver = true;//マスをクリックできないようにする処理
}


//ゲーム開始ボタン
startButton.addEventListener("click", function() {
    startGame();
});


//最初にゲームを開始する
startGame();