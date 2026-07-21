# from flask import Flask, jsonify, request
# from flask_cors import CORS
# # from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
# from flask_sqlalchemy import SQLAlchemy
# from datetime import datetime, timedelta
import string, secrets, random
# from uuid import uuid4

# app = Flask("app")

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project.db'
# # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SQLALCHEMY_ECHO'] = True

# # app.config["JWT_SECRET_KEY"] = "change-this-to-a-super-secret-passphrase"

# db = SQLAlchemy(app)

# class User(db.Model):
#     id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
#     name = db.Column(db.String(80), unique=False, nullable=False)
#     apiKey = db.Column(db.String(120), unique=True, nullable=False)
#     expenses = db.relationship('Expense', backref='owner', lazy=True)

#     def to_dict(self):
#         return {"id": str(self.id), "username": self.name, "apiKey": self.apiKey}

# class Expense(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     amount = db.Column(db.Float, nullable=False)
#     category = db.Column(db.String(50), nullable=False)
#     note = db.Column(db.String(200), nullable=True)
#     # created_at = db.Column(db.DateTime, default=datetime.now())
#     created_at = db.Column(db.DateTime, nullable=False)
#     currency = db.Column(db.String(3), nullable=False)
    
#     # This foreign key links every expense to a specific user
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

#     def to_dict(self):
#         return {"id": self.id, "amount": self.amount, "category": self.category, "note":self.note, "created_at": self.created_at, "user_id": self.user_id, "currency": self.currency}

def newApiKey():
    chars = string.ascii_letters  + string.digits + string.punctuation
    # secret_key = ''.join(secrets.choice(chars) for _ in range(64))
    secret_key = secrets.token_hex(64)

    return secret_key





# @app.route("/api/log", methods=["POST", "GET"])
# def api():
#     data = request.get_json()
#     '''
#     data = {
#     }
#     '''
#     auth_header = request.headers.get('Authorization')
#     if not auth_header or not auth_header.startswith("Bearer "):
#         return jsonify({"error": "Missing or invalid token format"}), 401

#     token = auth_header.split(" ")[1]
#     user = User.query.filter_by(apiKey=token).first()
#     if not user:
#         return jsonify({"error": "Unauthorized token"}), 401

#     if not data or 'amount' not in data or 'category' not in data:
#         return jsonify({"error": "Bad Request. Amount and Category are required."}), 400
    
#     try:
#         new_expense = Expense(
#             amount=float(data['amount']),
#             category=data['category'],
#             note=data.get('notes', ''),
#             user_id=user.id,
#             currency = data.get("currency", "INR")           
#         )
#         db.session.add(new_expense)
#         db.session.commit()

#         return jsonify({"message": "Expense logged successfully!", "id": new_expense.id}), 201

#     except ValueError:
#         return jsonify({"error": "Invalid amount format"}), 400

# @app.route("/api/users", methods=["POST", "GET"])
# def return_users():
#     users = User.query.all()
#     return jsonify([user.to_dict() for user in users])

# @app.route("/api/expenses", methods=["POST", "GET"])
# def return_expenses():
#     expenses = Expense.query.all()
#     return jsonify([expense.to_dict() for expense in expenses])


# @app.route("/api/test_mode/<int:howMany>", methods=["GET","POST"])
# def new_user(howMany=3):
#     try:
#         users = ["John Doe", "Keenu", "Arpita Khare"]
#         for i in range(3):
#             personal_user = User(name=users[i], apiKey=newApiKey())
#             db.session.add(personal_user)
#             db.session.commit() 

#         return jsonify({"msg":"New user created", "apiKey": "apiKey"}), 200

#     except: 
#         return jsonify("Already Exists")
    
# @app.route("/api/gen_expenses", methods=["GET", "POST"])
# def gen_expenses():
#     apiKeys = ["Vli7AMenfYKuPXiZ"]
#     # users = ["John Doe", "Keenu", "Arpita Khare"]

    
#     for i in range(len(apiKeys)):
#         # user = User.query.one(apiKey=apiKeys[i])
#         user = User.query.filter_by(apiKey = apiKeys[i]).first()
#         for j in range(100):
#             amount = random.randint(10, 1000)
#             category = random.choice(["Food", "Grocery", "Entertainment", "Stationery", "Other"])
#             max_seconds = 30 * 24 * 60 * 60
#             random_seconds = random.randint(0, max_seconds)
            
#             # Subtract random time from the current moment
#             time = datetime.now() - timedelta(seconds=random_seconds)

#             new_expense = Expense(
#                 amount=float(amount),
#                 category=category,
#                 note="",
#                 created_at= time,
#                 user_id=user.id,
#                 currency = "INR"           
#             )
            
#             db.session.add(new_expense)
#             db.session.commit()
#     # i = 0
#     # j=0
#     return jsonify(f'Generated {j+1} expense entires for {i+1} users each.')


# try:
#     with app.app_context():
#         db.create_all()

#         # personal_user = User(name="your_name", apiKey="super_secret_personal_token_123")
#         # db.session.add(personal_user)
#         # db.session.commit()
#         # print("Database ready! Your Shortcut token is: super_secret_personal_token_123")




# except:
#     pass
# if __name__ == "__main__":
        
#     app.run(debug=True, host="0.0.0.0")

print(newApiKey())