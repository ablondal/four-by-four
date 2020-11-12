
function evaluate_line(start_index,common_difference){

    index1 = start_index;
    index2 = index1 + common_difference;
    index3 = index2 + common_difference;
    index4 = index3 + common_difference;
    // These four indexes should now contain the indices [0,63] of a line
    // From here, we should be able to check if this line is a win for one of the players,
    //      or rank how good this line is to play in.
    // I'm thinking about a greedy algorithm for the computer player.

    
}

for (var k=0 ; k<16 ; k++){
    // X rows
    evaluate_line(4*k , 1);

    // Z rows
    evaluate_line(k , 16);
}

for(var k=0 ; k<4; k++){
    for(var j=0; j<4; j++){
        // Y rows
        evaluate_line(16*j+k , 4);
    }

    // XY diagonals
    evaluate_line(16*k , 5);
    evaluate_line(16*k+6 , 3);

    // XZ diagonals
    evaluate_line(4*k , 17);
    evaluate_line(4*k+3 , 15);

    // YZ diagonals
    evaluate_line(k , 20);
    evaluate_line(k+12 , 12);
}

// Space Diagonals
evaluate_line(0 , 21);
evaluate_line(15 , 11);
evaluate_line(3 , 19);
evaluate_line(12 , 13);
