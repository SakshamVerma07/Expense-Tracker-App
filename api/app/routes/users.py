from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import User
from app.utils.auth import require_auth

from app.utils.helper import newApiKey 

import logging

logger = logging.getLogger(__name__)


users_bp = Blueprint(
    "users",
    __name__
)



@users_bp.route(
    "/api/users",
    methods=["GET"]
)
def return_users():

    users = User.query.all()

    return jsonify(
        [
            user.to_dict()
            for user in users
        ]
    )


@users_bp.route(
    "/api/users/delete/<userId>",
    methods=["POST"]
)
def delete_users(userId):

    user = User.query.get_or_404(
        userId
    )

    db.session.delete(user)
    db.session.commit()


    return jsonify({
        "message":"deleted"
    }),200



@users_bp.route(
    "/api/new_user",
    methods=["POST"]
)
def new_user():

    data = request.get_json()
    if not data:
        return jsonify({
            "error":"Missing data"
        }),400
    apiKey = newApiKey()


    user = User(
        username=data["username"],
        provider_uid=data["provider_uid"],
        email=data["email"],
        apiKey=apiKey,
        profileIconIndex=data["profileIcon"],
        firstName=data["firstName"],
        lastName=data["lastName"],
        country=data["country"],
        currency=data["currency"],
        impUpdates=data["impUpdates"],
        monthlyUpdates=data["monthlyUpdates"],
        betaTesting=data["betaTesting"]
    )


    db.session.add(user)
    db.session.commit()


    return jsonify({
        "msg":"New user created",
        "apiKey":apiKey
    }),200



@users_bp.route(
    "/api/homepage",
    methods=["POST", "GET"]
)
@require_auth
def homepageData():

    user = User.query.filter_by(
        provider_uid=request.user_id
    ).first()


    if not user:

        try:

            user = User(
                provider_uid=request.user_id,
                email=request.user_email,
                username=request.user_email.split("@")[0],
                apiKey=newApiKey()
            )


            db.session.add(user)
            db.session.commit()


        except Exception as e:
            logger.exception(e)
            db.session.rollback()

            return jsonify({
                "error":
                "Failed to sync user profile"
            }),500


    return jsonify({
        "profileIconIndex":
        user.profileIconIndex
    })