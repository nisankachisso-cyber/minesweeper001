const board = document.getElementById("board");
const message = document.getElementById("message");
const flagCounter = document.getElementById("flag-counter");
const difficulty = document.getElementById("difficulty");
const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const openModeButton =
document.getElementById("open-mode-button");
const flagModeButton =
document.getElementById("flag-mode-button");
const treasureCounter =
document.getElementById("treasure-counter");
const startTreasurePoints =
document.getElementById("start-treasure-points");
const shieldButton =
document.getElementById("shield-button");
const open3x3Button =
document.getElementById("open3x3-button");
const boardContainer =
document.getElementById("board-container");
/* ポップアップ */
const settingsButton =
    document.getElementById("settings-button");
const settingsPopupOverlay =
    document.getElementById(
        "settings-popup-overlay"
    );
const closeSettingsButton =
    document.getElementById(
        "close-settings-button"
    );
const returnStartButton =
    document.getElementById(
        "return-start-button"
    );
const saveCodeInput =
    document.getElementById(
        "save-code-input"
    );
const loadSaveCodeButton =
    document.getElementById(
        "load-save-code-button"
    );
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
let treasurePoints =
    Number(
        localStorage.getItem(
            "treasurePoints"
        )
    ) || 0;
/* =========================
スキルの状態
========================= */
/* シールド */
let shieldActive = false;
/* 3×3開放 */
let open3x3Active = false;
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
    
/* お宝ポイントを保存 */
localStorage.setItem(
    "treasurePoints",
    treasurePoints
);
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
    openModeButton.classList.add(
        "active"
    );
    flagModeButton.classList.remove(
        "active"
    );
}
/* 旗モード */
if (mode === "flag") {
    flagModeButton.classList.add(
        "active"
    );
    openModeButton.classList.remove(
        "active"
    );
    /*
    3×3開放はマスを開くスキルなので、
    旗モードに切り替えたら解除
    */
    if (
        open3x3Active === true
    ) {
        deactivateOpen3x3();
    }
}
}
/* =========================
開くモードボタン
========================= */
openModeButton.addEventListener(
"click",
function() {
    setMode("open");
}
);
/* =========================
旗モードボタン
========================= */
flagModeButton.addEventListener(
"click",
function() {
    setMode("flag");
}
);
/* =========================
シールドをOFFにする
========================= */
function deactivateShield() {
shieldActive = false;
shieldButton.classList.remove(
    "active"
);
}
/* =========================
3×3開放をOFFにする
========================= */
function deactivateOpen3x3() {
open3x3Active = false;
open3x3Button.classList.remove(
    "active"
);
/* 盤面の暗転を解除 */
boardContainer.classList.remove(
    "skill-targeting"
);
}
/* =========================
3×3開放をONにする
========================= */
function activateOpen3x3() {
open3x3Active = true;
open3x3Button.classList.add(
    "active"
);
/* 盤面を暗くする */
boardContainer.classList.add(
    "skill-targeting"
);
/*
3×3開放を使用するときは
マスを開くモードにする
*/
setMode("open");
}
/* =========================
シールドボタン
========================= */
shieldButton.addEventListener(
"click",
function() {
    /* すでにONならOFFにする */
    if (
        shieldActive === true
    ) {
        deactivateShield();
        return;
    }
    /*3×3開放がON中ならシールドはONにできない */
    if (
        open3x3Active === true
    ) {
        return;
    }
    /*お宝ポイントが50未満なら使用できない*/
    if (
        treasurePoints < 50
    ) {
        return;
    }
    /* ONにする */
    shieldActive = true;
    /* 見た目をON状態にする */
    shieldButton.classList.add(
        "active"
    );
}
);
/* =========================
3×3開放ボタン
========================= */
open3x3Button.addEventListener(
"click",
function() {
    /*
    すでにONならOFFにする
    */
    if (
        open3x3Active === true
    ) {
        deactivateOpen3x3();
        return;
    }
    /*
    お宝ポイントが
    160未満なら使用できない
    */
    if (
        treasurePoints < 160
    ) {
        return;
    }
    /* ONにする */
    activateOpen3x3();
}
);
/* =========================
難易度ごとのお宝出現確率
========================= */
function getTreasureChance() {
const selectedDifficulty =
    difficulty.value;
if (
    selectedDifficulty === "beginner"
) {
    return 0.08;
}
if (
    selectedDifficulty === "intermediate"
) {
    return 0.14;
}
if (
    selectedDifficulty === "advanced"
) {
    return 0.20;
}
return 0;
}
/* =========================
お宝を出現させる
========================= */
function showTreasure(cell) {
/*
treasure1〜treasure5から
ランダムで選ぶ
*/
const treasureNumber =
    Math.floor(
        Math.random() * 5
    ) + 1;
/* お宝画像 */
const treasureImage =
    document.createElement("img");
treasureImage.src =
    `pictures/treasure${treasureNumber}.png`;
treasureImage.alt =
    "お宝";
treasureImage.classList.add(
    "treasure-image"
);
/* マスの上に追加 */
cell.appendChild(
    treasureImage
);
/* お宝ポイント +10 */
treasurePoints += 10;
updateTreasurePoints();
/* アニメーション終了後に削除 */
treasureImage.addEventListener(
    "animationend",
    function() {
        treasureImage.remove();
    }
);
}
/* =========================
ゲーム開始
========================= */
function startGame() {
/* 選択された難易度 */
const selectedDifficulty =
    difficulty.value;
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
/* シールドをOFF */
deactivateShield();
/* 3×3開放をOFF */
deactivateOpen3x3();
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
========================= */
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
        cell.classList.add(
            "cell"
        );
        cell.dataset.row = row;
        cell.dataset.col = col;
        board.appendChild(
            cell
        );
        /* =========================
           マスをタップ
        ========================= */
        cell.addEventListener(
            "click",
            function() {
                /* ゲーム終了後 */
                if (
                    gameOver === true
                ) {
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
                /*
                =========================
                3×3開放がONの場合
                =========================
                */
                if (
                    open3x3Active === true
                ) {
                    /*
                    すでに開いているマスでは
                    発動しない
                    */
                    if (
                        cell.dataset.opened === "true"
                    ) {
                        return;
                    }
                    /*
                    最初のクリックなら
                    先に爆弾を配置
                    */
                    if (
                        firstClick === true
                    ) {
                        placeMines(
                            row,
                            col
                        );
                        firstClick = false;
                    }
                    /*
                    タップしたマスを中心に
                    3×3の安全な未開放マスを開く
                    */
                    open3x3Area(
                        row,
                        col
                    );
                    /* お宝ポイント -160 */
                    treasurePoints -= 160;
                    updateTreasurePoints();
                    /* 3×3開放をOFF */
                    deactivateOpen3x3();
                    return;
                }
                /* =========================
                   通常の開く処理
                ========================= */
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
                    /* シールドONならゲームオーバーにならない */
                    if (
                        shieldActive === true
                    ) {
                        /* =========================
                        シールド発動
                        ========================= */
                        /* お宝ポイント -50 */
                        treasurePoints -= 50;
                        updateTreasurePoints();
                        /*
                        爆弾マスを開く
                        */
                        cell.dataset.opened =
                            "true";
                        cell.style.backgroundColor =
                            "#df3b3b";
                        /*
                        シールドをOFF
                        */
                        deactivateShield();
                        /*
                        ゲームオーバーにはしない
                        */
                        return;
                    }
                    /*
                    シールドがなければ
                    通常通りゲームオーバー
                    */
                    message.textContent =
                        "GAME OVER!";
                    cell.style.backgroundColor =
                        "#df3b3b";
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
3×3の安全なマスを開く
========================= */
function open3x3Area(
centerRow,
centerCol
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
        const targetRow =
            centerRow + rowOffset;
        const targetCol =
            centerCol + colOffset;
        /* 盤面の外 */
        if (
            targetRow < 0 ||
            targetRow >= rows ||
            targetCol < 0 ||
            targetCol >= cols
        ) {
            continue;
        }
        const targetCell =
            document.querySelector(
                `[data-row="${targetRow}"][data-col="${targetCol}"]`
            );
        /*
        すでに開いているマスは無視
        */
        if (
            targetCell.dataset.opened ===
            "true"
        ) {
            continue;
        }
        /*
        爆弾は開かない
        */
        if (
            gameBoard[targetRow][targetCol].mine
            === true
        ) {
            continue;
        }
        /*
        安全な未開放マスだけ開く
        */
        openCell(
            targetRow,
            targetCol
        );
    }
}
checkClear();
}
/* =========================
旗を置く / 外す
========================= */
function toggleFlag(
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
/* 開いているマスには旗を置けない */
if (
    cell.dataset.opened === "true"
) {
    return;
}
/* =========================
   旗を外す
========================= */
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
========================= */
cell.textContent =
    "🚩";
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
    /*
    最初のマスと
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
    "#bebebe";
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
/* =========================
   お宝が出現するか抽選
========================= */
const treasureChance =
    getTreasureChance();
if (
    Math.random() <
    treasureChance
) {
    showTreasure(
        cell
    );
}
/* 周囲の爆弾数 */
const mineCount =
    countMines(
        row,
        col
    );
/* =========================
   数字を表示
========================= */
if (
    mineCount > 0
) {
    const numberElement =
        document.createElement(
            "span"
        );
    numberElement.textContent =
        mineCount;
    numberElement.classList.add(
        "mine-number"
    );
    cell.appendChild(
        numberElement
    );
}
/* =========================
   周囲に爆弾がない場合
========================= */
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
        /*
        爆弾ではなく、
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
/* =========================
ポップアップ
========================= */
/* 設定ボタンを押したらポップアップを開く */
settingsButton.addEventListener(
    "click",
    function() {
        settingsPopupOverlay.style.display =
            "flex";
    }
);
/* ×ボタンで閉じる */
closeSettingsButton.addEventListener(
    "click",
    function() {
        settingsPopupOverlay.style.display =
            "none";
    }
);
/* スタート画面に戻る */
returnStartButton.addEventListener(
    "click",
    function() {
        /*ポップアップを閉じる*/
        settingsPopupOverlay.style.display =
            "none";
        /*ゲーム画面を消す*/
        gameScreen.style.display =
            "none";
        /*スタート画面を表示*/
        startScreen.style.display =
            "flex";
        /* 最新のお宝ポイントを表示 */
        updateTreasurePoints();
    }
);
/* セーブコードを読み込む */
loadSaveCodeButton.addEventListener(
    "click",
    function() {
        /* =========================
           入力された文字を取得
        ========================= */
        const inputText =
            saveCodeInput.value.trim();
        /*
        空欄なら何もしない
        Number("") は 0 になってしまうため、
        数字に変換する前に確認する
        */
        if (
            inputText === ""
        ) {
            return;
        }
        /* =========================
           数字に変換
        ========================= */
        const inputValue =
            Number(
                inputText
            );
        /*
        数字として正常か確認
        例：
        "abc" → NaN
        */
        if (
            Number.isNaN(
                inputValue
            )
        ) {
            return;
        }
        /* =========================
           マイナスは禁止
        ========================= */
        if (
            inputValue < 0
        ) {
            return;
        }
        /* =========================
           小数点以下を切り捨て
        ========================= */
        treasurePoints =
            Math.floor(
                inputValue
            );
        /* =========================
           表示を更新
        ========================= */
        updateTreasurePoints();
        /* =========================
           入力欄を空にする
        ========================= */
        saveCodeInput.value =
            "";
        /* =========================
           ポップアップを閉じる
        ========================= */
        settingsPopupOverlay.style.display =
            "none";
    }
);