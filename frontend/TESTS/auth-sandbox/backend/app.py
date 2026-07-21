import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import jwt
import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 1. REPLACE THIS with your actual Supabase Reference URL (e.g., https://xyzabc.supabase.co)
SUPABASE_URL = "https://rskocxhnnjjwhizygtpe.supabase.co" 
# Change this line back to the full standard discovery path
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

SUPABASE_ANON_KEY = "sb_publishable_99AA7VHB8r39KWOMgqf41g_xDGAI8Ml"

db = SQLAlchemy(app)

# ----------------- DB MODEL -----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    provider_uid = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=True)

    def to_dict(self):
        return {"id": self.id, "email": self.email, "username": self.username}


# ----------------- SECURE ASYMMETRIC VERIFICATION -----------------
# Make sure your VITE_SUPABASE_ANON_KEY is available here!
# Paste your actual "Publishable/Anon" key string here:

def require_auth(f):
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed Authorization header"}), 401
        
        token = auth_header.split(" ")[1]
        
        try:
            # Create a PyJWKClient that includes the mandatory Supabase apikey header
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
                audience="authenticated"
            )
            
            request.user_id = payload.get("sub")
            request.user_email = payload.get("email")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except Exception as e:
            return jsonify({"error": f"Security verification failed: {str(e)}"}), 401

        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

# ----------------- PROTECTED ENDPOINT -----------------
@app.route('/api/dashboard', methods=['GET'])
@require_auth
def get_dashboard():
    user = User.query.filter_by(provider_uid=request.user_id).first()
    
    if not user:
        try:
            user = User(
                provider_uid=request.user_id, 
                email=request.user_email,
                username=request.user_email.split('@')[0]
            )
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to sync user profile"}), 500

    return jsonify({
        "status": "success",
        "message": "Flask successfully read your modern ECC-signed token!",
        "user": user.to_dict()
    }), 200

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)