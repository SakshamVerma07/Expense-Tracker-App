from app.extensions import db
from uuid import uuid4


def genUuid():
    return str(uuid4())


class User(db.Model):

    id = db.Column(
        db.String(50),
        primary_key=True,
        default=genUuid
    )

    provider_uid = db.Column(
        db.String(255),
        unique=True,
        nullable=False
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False
    )

    username = db.Column(
        db.String(80),
        nullable=False
    )

    profileIconIndex = db.Column(
        db.Integer,
        default=1,
        nullable=False
    )

    apiKey = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    firstName = db.Column(
        db.String(50),
        nullable=False
    )

    lastName = db.Column(
        db.String(50),
        nullable=False
    )

    country = db.Column(
        db.String(5),
        nullable=False
    )

    currency = db.Column(
        db.String(120),
        nullable=False
    )

    impUpdates = db.Column(
        db.Boolean,
        default=False
    )

    monthlyUpdates = db.Column(
        db.Boolean,
        default=False
    )

    betaTesting = db.Column(
        db.Boolean,
        default=False
    )


    expenses = db.relationship(
        "Expense",
        backref="owner",
        lazy=True
    )


    def to_dict(self):
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }