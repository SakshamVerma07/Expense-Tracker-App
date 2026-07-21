import jwt
from flask import request, jsonify
from functools import wraps
import os
from app.config import Config


SUPABASE_URL = Config.SUPABASE_URL
SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"


def require_auth(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({
                "error": "Missing or malformed Authorization header"
            }), 401


        token = auth_header.split(" ")[1]


        try:

            jwks_client = jwt.PyJWKClient(
                JWKS_URL,
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
                }
            )


            signing_key = jwks_client.get_signing_key_from_jwt(token)


            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256"],
                audience="authenticated",
                leeway=10
            )


            request.user_id = payload.get("sub")
            request.user_email = payload.get("email")


        except jwt.ExpiredSignatureError:

            return jsonify({
                "error": "Token expired"
            }),401


        except Exception:

            return jsonify({
                "error": "Authentication failed"
            }),401


        return f(*args, **kwargs)


    return decorated