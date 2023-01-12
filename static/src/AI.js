class Board {
    constructor(bstate, nextplay) {
        this.board = bstate;
        this.evals = [state_eval(bstate, nextplay)];
        this.nx = nextplay;
        this.mvs = [];
        this.reeval = [[]];
    }

    l_sc(i){
        l = lines[i].map(x => this.board[x]);
        let cts = [0, 0, 0];
        for (var i=0; i<l.length; i++) {
            cts[l[i]+1]++;
        }
        if (cts[0] > 0 && cts[2] > 0) return 0;
        else if (cts[0] == 4) return -100000;
        else if (cts[2] == 4) return 100000;
        else return cts[2]*cts[2] - cts[0]*cts[0];
    }

    make_move(i) {
        this.mvs.push(i);
        let leval = this.evals[this.evals.length-1];
        this.reeval.push([]);
        for(let j=0; j<i2l[i].length; j++){
            leval -= this.l_sc(i2l[i][j]);
        }
        this.board[i] = this.nx;
        this.nx *= -1;
        for(let j=0; j<i2l[i].length; j++){
            leval += this.l_sc(i2l[i][j]);
        }
        this.evals.push(leval);
    }

    rollback() {
        if (this.mvs.length == 0) return;
        let lmv = this.mvs.pop();
        this.board[lmv] = 0;
        this.evals.pop();
        this.reeval.pop();
        this.nx *= -1;
    }

    eval() {
        return this.evals[this.evals.length-1];
    }
}

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

function line_eval(line_index, board, nextplay){
    l = lines[line_index].map(x => board[x]);
    let cts = [0, 0, 0];
    for (var i=0; i<l.length; i++) {
        cts[l[i]+1]++;
    }
    if (cts[0] > 0 && cts[2] > 0) return 0;
    if (cts[nextplay+1] == 3){
        console.log('hi2');
        return nextplay*100000;
    }
    else return cts[2]*cts[2] - cts[0]*cts[0];
}

function state_eval(board, nextplay){
    let w = check_win(board);
    let score = w * 10000;
    evals = lines.map( (l, i) => line_eval(i, board, nextplay));
    score += evals.reduce((a, b) => a+b, 0);
    // console.log(score);
    return score;
}

function minimax(board, depth, alpha, beta, nextplay){
    if (Math.abs(board.eval()) > 1000 || depth == 0) {
        return [board.eval(), -1];
    }

    // Check the basic scores of all next moves
    // mvs = []
    // for (var mv = 0; mv < 64; mv++){
    //     if (board.board[mv] != 0) continue;
    //     board.make_move(mv);
    //     sc = board.eval();
    //     board.rollback();
    //     mvs.push([sc, mv]);
    // }

    let move = -1;
    if (nextplay == -1) { // AI next
        let value = 1000000;
        // mvs.sort((a, b) => a[0]-b[0]);
        // for (var i = 0; i < mvs.length; i++){
        //     mv = mvs[i][1];
        for (var mv = 0; mv < 64; mv++) {
            if (board.board[mv] != 0) continue;
            board.make_move(mv);
            mvsc = minimax(board, depth-1, alpha, beta, -1 * nextplay);
            board.rollback();
            if (mvsc[0] < value) {
                value = mvsc[0];
                move = mv;
            }
            if (value < alpha) {
                break;
            }
            beta = Math.min(beta, value);
        }
        return [value, move];
    } else {
        let value = -1000000;
        // mvs.sort((a, b) => b[0]-a[0]);
        // for (var i = 0; i < mvs.length; i++){
        //     mv = mvs[i][1];
        for (var mv = 0; mv < 64; mv++) {
            if (board.board[mv] != 0) continue;
            board.make_move(mv);
            mvsc = minimax(board, depth-1, alpha, beta, -1 * nextplay);
            board.rollback();
            if (mvsc[0] > value) {
                value = mvsc[0];
                move = mv;
            }
            if (value > beta) {
                break;
            }
            alpha = Math.max(alpha, value);
        }
        return [value, move];
    }
}

function mediumAI(board){
    // Try to find a winning move
    let move = find_win(board, -1);
    if (move != -1) return move;

    // See if any opponent's move will win
    move = find_win(board, 1);
    if (move != -1) return move;

    let b = new Board(board, -1);

    mvsc = minimax(b, 3, -10000000, 10000000, -1);
    console.log(mvsc[0]);
    return mvsc[1];
}

function hardAI(board){
    // Try to find a winning move
    let move = find_win(board, -1);
    if (move != -1) return move;

    // See if any opponent's move will win
    move = find_win(board, 1);
    if (move != -1) return move;

    let b = new Board(board, -1);

    mvsc = minimax(b, 6, -10000000, 10000000, -1);
    console.log(mvsc[0]);
    return mvsc[1];
}