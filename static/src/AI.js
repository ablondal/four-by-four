
function check_win(board){
    for (var j=0; j<lines.length; j++) {
        const l = lines[j];
        let col = board[l[0]];
        for (var i=0; i<4; i++) {
            if (col != board[l[i]]) {
                col = 0;
            }
        }
        if (col != 0) {
            return col;
        }
    }
    return 0;
}

function random_move(board){
    let rand = -1
    while(rand < 0 || board[rand] !== 0){
        rand = Math.floor(Math.random()*64)
    }
    board[rand] = -1
    return {
        boardState: board,
        move: [rand, -1]
    }
}