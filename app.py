from flask import Flask, escape, request, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
# from flask_heroku import Heroku
from time import sleep
from config import Config

app = Flask(__name__,
    static_folder='static/')

app.config.from_object(Config)
# heroku = Heroku(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

from models import Game

@app.route('/make_move', methods=['POST'])
def make_move():
    # print(request.get_json());
    req = request.get_json()
    state = req['boardState']
    # print(state)

    #i = 0
    #for i in range(len(state)):
    #    if state[i] == 0:
    #        state[i] = -1
    #        break;
    
    bestStart = 0
    bestDifference = 0
    bestRank = 0
    for k in range(0,16):
        newStart = 4*k # X rows
        newDifference = 1
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

        newStart = k # Z rows
        newDifference = 16 
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

    for k in range(0,4):
        for j in range(0,4):
            newStart = 16*j + k # Y Rows
            newDifference = 4
            bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)
        
        newStart = 16*k # XY Diagonals
        newDifference = 5
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

        newStart = 16*k + 6
        newDifference = 3
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

        newStart = 4*k # XZ Diagonals
        newDifference = 17
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)
        
        newStart = 4*k + 3
        newDifference = 15
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

        newStart = k # XY Diagonals
        newDifference = 20
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

        newStart = k + 12
        newDifference = 12
        bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

    newStart = 0 # Space Diagonals
    newDifference = 21
    bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

    newStart = 15
    newDifference = 11
    bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

    newStart = 3
    newDifference = 19
    bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

    newStart = 12
    newDifference = 13
    bestStart , bestDifference , bestRank = evaluate_line(newStart,newDifference,bestStart, bestDifference, bestRank, state)

    print(bestRank)
    for k in range(0,3):
        i = bestStart + k*bestDifference
        if state[i] == 0:
            print(i)
            state[i] == -1
            break;

    # sleep(5) # was only here to simulate a delay and see if the program still worked fine
    return {'boardState' : state, 'move' : [i, -1]}

@app.route('/')
def index():
    return render_template("main.html")

if __name__ == "__main__":
    app.debug = True
    app.run()

def evaluate_line(startIndex, commonDifference,bestStart,bestDifference,bestRank,state):
    index1 = startIndex
    index2 = index1 + commonDifference
    index3 = index2 + commonDifference
    index4 = index3 + commonDifference
    
    xx = state[index1] +state[index2] +state[index3] +state[index4]
    yy = abs(state[index1]) +abs(state[index2]) +abs(state[index3]) +abs(state[index4])

    rank = (xx*xx + xx/10 +1/10)*(4-yy)
    if rank > bestRank:
        return startIndex , commonDifference , rank
    else:
        return bestStart , bestDifference , bestRank