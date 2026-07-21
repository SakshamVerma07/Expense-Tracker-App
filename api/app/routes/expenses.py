from flask import Blueprint, request, jsonify

from app.models import User, Expense
from app.utils.auth import require_auth
import logging

logger = logging.getLogger(__name__)

expenses_bp = Blueprint(
    "expenses",
    __name__
)


@expenses_bp.route(
    "/api/expenses/<apikey>",
    methods=["GET"]
)
def return_expenses(apikey):

    user = User.query.filter_by(
        apiKey=apikey
    ).first()


    if not user:
        return jsonify({
            "error": "Invalid API key"
        }), 401


    expenses = Expense.query.filter_by(
        user_id=user.id
    ).all()


    return jsonify(
        [
            expense.to_dict()
            for expense in expenses
        ]
    )



@expenses_bp.route(
    "/api/expense",
    methods=["GET","POST"]
)
@expenses_bp.route(
    "/api/expense/<month>",
    methods=["GET","POST"]
)
@expenses_bp.route(
    "/api/expense/<month>/<year>",
    methods=["GET","POST"]
)
@require_auth
def expense(month=0, year=0):

    user = User.query.filter_by(
        provider_uid=request.user_id
    ).first()


    if not user:
        return jsonify({
            "error":"User not found"
        }),404


    page = request.args.get(
        "page",
        1,
        type=int
    )


    expense_query = Expense.query.filter(
        Expense.user_id == user.id
    ).order_by(
        Expense.created_at.desc()
    ).paginate(
        page=page,
        per_page=25,
        max_per_page=50,
        error_out=False
    )


    transactions = [
        {
            "id": tx.id,
            "amount": tx.amount,
            "category": tx.category,
            "date": tx.created_at.strftime(
                "%d:%m:%Y:%H:%M:%S"
            ),
            "currency": tx.currency,
            "note": tx.note.capitalize()
            if tx.note else ""
        }

        for tx in expense_query.items
    ]


    return jsonify({

        "firstName":
            user.username.split(" ")[0].title(),

        "expenses":
            transactions,

        "current_page":
            expense_query.page,

        "isNotLastPage":
            expense_query.has_next,

        "profileIconIndex":
            user.profileIconIndex

    })