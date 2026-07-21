from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import User, Expense
from app.utils.auth import require_auth
from app.utils.helper import newApiKey

import logging

logger = logging.getLogger(__name__)

mobile_bp = Blueprint(
    "mobile",
    __name__
)

@mobile_bp.route(
    "/api/log/ANDROID",
    methods=["POST"]
)
@require_auth
def api_android():

    user = User.query.filter_by(
        provider_uid=request.user_id
    ).first()


    if not user:
        return jsonify({
            "error": "Unauthorized"
        }),401


    data = request.get_json()


    try:

        new_expense = Expense(
            amount=float(data["amount"]),
            category=data["category"],
            note=data.get("notes",""),
            user_id=user.id,
            currency=data.get(
                "currency",
                "INR"
            )
        )


        db.session.add(new_expense)
        db.session.commit()


        return jsonify({
            "message":
            "Expense logged successfully!",
            "id":new_expense.id
        }),201


    except ValueError as e:
        logger.exception(e)

        return jsonify({
            "error":
            "Invalid amount format"
        }),400