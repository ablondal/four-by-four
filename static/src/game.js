// Contains gameState and logic for the game

// Will handle all network requests for iteself

var game;

function initGame() {
    game = {
        boardState : [],
        turn : 1, // 1 if its our turn
        color : 1, // 1 or -1
    };

    // Reset board to gray
    for (var i = 0; i < 64; i++) {
        game.boardState[i] = 0;
    }
    resetColors();
}

function takeTurn(index) {
    if ( game.turn === 1 ) {
        if ( game.boardState[index] === 0 ) {
            // Move is valid and available
            game.boardState[index] = game.color;
            changeColor(index, game.color===1 ? "red" : "blue");
            game.turn = 0;
            make_move().then((response) => {
                console.log(response);
                game.boardState = response.boardState.map(x => x);
                game.turn = 1;
                if (response.move[0]<64) {
                    changeColor(response.move[0], response.move[1]===1 ? "red" : "blue" );
                }
                if (response.message){
                    document.querySelector('[data-winning-message-text]').innerText = response.message
                    document.getElementById('winningMessage').classList.add('show')
                    game.turn = -1
                }
            });
        }
    }
}

async function make_move() {
    const response = await fetch('/make_move', {
        method: 'POST',
        // mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            boardState: game.boardState
        })
    });
    return response.json();
}