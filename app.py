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
    i = 0
    for i in range(len(state)):
        if state[i] == 0:
            state[i] = -1
            break;
    # sleep(5) # was only here to simulate a delay and see if the program still worked fine
    return {'boardState' : state, 'move' : [i, -1]}

@app.route('/')
def index():
    return render_template("main.html")

if __name__ == "__main__":
    app.run()
