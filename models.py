from app import db
from random import randrange
from sqlalchemy.sql import func

class Game(db.Model):
    __tablename__ = "quad_games"
    id = db.Column(db.Integer, primary_key=True) # Game id
    turn = db.Column(db.SmallInteger) # 1 for red, 2 for blue
    boardState = db.Column(db.String(64))
    p1id = db.Column(db.Integer)
    p2id = db.Column(db.Integer)
    lastEdit = db.Column(db.DateTime(timezone=True))

    def __init__(self, turn):
        self.turn = turn
        self.boardState = "0"*64
        self.p1id = randrange(2^15)
        self.p2id = randrange(2^15)

    def __repr__(self):
        return '<id {}, turn {}, p1id {}, p2id {}\n{}\nlast edit {}>'.format(
            self.id,self.turn,self.p1id,self.p2id,self.boardState,self.lastEdit
        )

def getGame(getID):
    game = Game.query.filter_by(id=getID).first()
    if game:
        return game
    else:
        return None

def newGame():
    newgame = Game(1)
    print(newgame)
    db.session.add(newgame)

    db.session.commit()
    return newgame
    # games = Game.query.all()
    # print("\n".join(g.__repr__() for g in games))