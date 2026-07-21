from app.extensions import db
from datetime import datetime


class Expense(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    amount = db.Column(
        db.Float,
        nullable=False
    )

    category = db.Column(
        db.String(50),
        nullable=False
    )

    note = db.Column(
        db.String(200)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.now
    )

    currency = db.Column(
        db.String(3),
        nullable=False
    )


    user_id = db.Column(
        db.String(50),
        db.ForeignKey("user.id"),
        nullable=False
    )


    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "category": self.category,
            "note": self.note,
            "created_at": self.created_at,
            "user_id": self.user_id,
            "currency": self.currency
        }