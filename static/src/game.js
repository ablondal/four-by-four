// Contains gameState and logic for the game

// Will handle all network requests for itself

var game;
var settings;

function difficulty() {
    diffs = document.getElementsByName('difficulty')
    for (var i=0; i<diffs.length; i+=1) {
        if (diffs[i].checked){
            return diffs[i].value;
        }
    }
}

function turnOrder() {
    opts = document.getElementsByName('turnorder')
    for (var i=0; i<opts.length; i+=1) {
        if (opts[i].checked){
            return opts[i].value;
        }
    }
}

function initGame() {
    game = {
        boardState : [],
        turn : 0, // Starts at 0
        playerTurn : parseInt(turnOrder())
    };

    // Reset board to gray
    for (var i = 0; i < 64; i++) {
        game.boardState[i] = 0;
    }
    resetColors();

    // If not player turn, launch AI:
    if (game.playerTurn === 1) {
        setTimeout(AI_take_move, 0 );
    }
}

function takeTurn(index, player){
    // Player: 0 for player, 1 for AI
    if (game.turn === -1) {
        return;
    }
    if ( (game.turn%2)^game.playerTurn === player ) {
        if ( game.boardState[index] === 0 ) {
            game.boardState[index] = 1 - 2*player;
            changeColor(index, player ? "blue": "red");
            game.turn += 1;
            if (player === 0) {
                setTimeout(AI_take_move, 1000 );
            }
        }
    }
}

function gameEnd(result) {
    document.querySelector('[data-winning-message-text]').innerText = result;
    document.getElementById('winningMessage').classList.add('show');
    game.turn = -1;
}

function AI_take_move() {
    mv = AI_get_move();
    console.log(mv);
    takeTurn(mv.move[0], 1);
}

function AI_get_move() {
    let boardState = game.boardState.map(x => x) // Shallow copy
    return random_move(boardState)
}

// function takeTurn(index) {
//     if ( game.turn % 2 === 0 ) {
//         if ( game.boardState[index] === 0 ) {
//             // Move is valid and available
//             game.boardState[index] = game.color;
//             changeColor(index, game.color===1 ? "red" : "blue");
//             game.turn += 1;
//             make_move().then((response) => {
//                 console.log(response);
//                 game.boardState = response.boardState.map(x => x);
//                 game.turn += 1;
//                 if (response.move[0]<64) {
//                     changeColor(response.move[0], response.move[1]===1 ? "red" : "blue" );
//                 }
//                 if (response.message){
//                     document.querySelector('[data-winning-message-text]').innerText = response.message
//                     document.getElementById('winningMessage').classList.add('show')
//                     game.turn = null
//                 }
//             });
//         }
//     }
// }


// async function make_move() {
//     const response = await fetch('/make_move', {
//         method: 'POST',
//         // mode: 'cors',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             boardState: game.boardState
//         })
//     });
//     return response.json();
// }