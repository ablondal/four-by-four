
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
    return rand;
}

function find_win(board, player) {
    for (let i=0; i<64; i++) {
        if (board[i] == 0) {
            board[i] = player;
            w = check_win(board);
            board[i] = 0;
            if (w == player) {
                return i;
            }
        }
    }
    return -1;
}

function try_not_to_lose(board){
    // Try to find a winning move
    let move = find_win(board, -1);
    if (move != -1) return move;

    // See if any opponent's move will win
    move = find_win(board, 1);
    if (move != -1) return move;
    
    // Find a line to play on
    linescores = []
    for (let i=0; i<lines.length; i++){
        const l = lines[i];
        score = 0;
        nzero = 0.1;
        for (let j=0; j<l.length; j++){
            score += board[l[j]];
            nzero += Math.abs(board[l[j]]);
        }
        if (nzero == 4.1) {
            score = -1;
        }
        linescores.push([score/nzero, l]);
    }
    linescores.sort((a,b) => b[0]-a[0]);
    // Choose the line with the highest importance
    const l = linescores[0][1];
    // Choose one possible move from the line
    move = l.filter(x => board[x]==0)[0];
    return move;
}