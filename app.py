from flask import Flask, escape, request, render_template, send_from_directory

app = Flask(__name__,
    static_folder='static/')

@app.route('/')
def index():
    return render_template("main.html")

if __name__ == "__main__":
    app.run()