
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