from flask import Flask, escape, request, render_template, send_from_directory
from time import sleep

app = Flask(__name__,
    static_folder='static/')

@app.route('/make_move', methods=['POST'])
def make_move():
    # print(request.get_json());
    req = request.get_json()
    state = req['boardState']
    # print(state)

    i = 0 # This for loop should now be a safety net in a case where the ai fails to play, 
    for i in range(len(state)):
        if state[i] == 0:
            break;
    
    # The following code finds the best line to play in
    winState = 0
    bestStart = 0  
    bestDifference = 0
    bestRank = 0
    for k in range(0,16):
        newStart = 4*k # X rows
        newDifference = 1
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

        newStart = k # Z rows
        newDifference = 16 
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

    for k in range(0,4):
        for j in range(0,4):
            newStart = 16*j + k # Y Rows
            newDifference = 4
            bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)
        
        newStart = 16*k # XY Diagonals
        newDifference = 5
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

        newStart = 16*k + 3
        newDifference = 3
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

        newStart = 4*k # XZ Diagonals
        newDifference = 17
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)
        
        newStart = 4*k + 3
        newDifference = 15
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

        newStart = k # XY Diagonals
        newDifference = 20
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

        newStart = k + 12
        newDifference = 12
        bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

    newStart = 0 # Space Diagonals
    newDifference = 21
    bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

    newStart = 15
    newDifference = 11
    bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

    newStart = 3
    newDifference = 19
    bestStart , bestDifference , bestRank , winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

    newStart = 12
    newDifference = 13
    bestStart , bestDifference , bestRank, winState = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state, winState)

    print(bestRank)
    for k in range(0,4): # Determines a valid poistion to play in the best line. If no best line can be found, the program will revert to
                            # using the safety net state[i] that was found in the first for loop at the start of this function
        bestPos = bestStart + k*bestDifference
        if state[bestPos] == 0:
            print(bestPos)
            i = bestPos
            break;
    
    if winState == 1: # Win handling, display calls for winning should be put here
        print("Game Declares The Player Has Won")
    if winState == -1:
        print("Gamer Declares The Player Has Lost")

    state[i] = -1 # This should be the only place where state[i] is updated

    # sleep(5) # was only here to simulate a delay and see if the program still worked fine
    return {'boardState' : state, 'move' : [i, -1]}

@app.route('/')
def index():
    return render_template("main.html")

if __name__ == "__main__":
    app.run()

def evaluate_line(startIndex, commonDifference,bestStart,bestDifference,bestRank,state, winState): # This function give each line a rank, and updates the best line if it finds a higher rank
    index1 = startIndex
    index2 = index1 + commonDifference
    index3 = index2 + commonDifference
    index4 = index3 + commonDifference
    
    xx = state[index1] +state[index2] +state[index3] +state[index4]
    yy = abs(state[index1]) +abs(state[index2]) +abs(state[index3]) +abs(state[index4])

    rank = (xx*xx - xx/10 + 1/10)*(4-yy)

    if xx == 4: # display calls for the win should NOT be put here
        #print("winner")
        winState = 1
        # Note that in the current setup, the ai could feasibly play one more turn, allowing the win and lose
        # conditions to both be printed. There needs to be a condition that stops the ai from playing
        # if the player has already won

        # I have resolved this by passing the variable winState, there may be a more effective solution
    if xx == -3:
        if winState == 0:
            winState = -1
            #print("loser")

    if rank > bestRank:
        return startIndex , commonDifference , rank , winState
    else:
        return bestStart , bestDifference , bestRank , winState