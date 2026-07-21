import random
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
# from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta, date, time
import string, secrets, calendar
from uuid import uuid4
from sqlalchemy import func
import os, jwt, requests

load_dotenv()

app = Flask("app")
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

SUPABASE_URL = os.getenv("SUPABASE_URL") 
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

def genUuid():
    a = uuid4()
    return str(a)

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.String(50), primary_key=True, default=genUuid)
    provider_uid = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=False, nullable=False)
    profileIconIndex = db.Column(db.Integer, unique=False, nullable=False, default=1)
    apiKey = db.Column(db.String(120), unique=True, nullable=False)
    firstName = db.Column(db.String(50), unique=False, nullable=False)
    lastName = db.Column(db.String(50), unique=False, nullable=False)
    country = db.Column(db.String(5), unique=False, nullable=False)
    currency = db.Column(db.String(120), unique=False, nullable=False)
    impUpdates = db.Column(db.Boolean, unique=False, nullable=False, default=False)
    monthlyUpdates = db.Column(db.Boolean, unique=False, nullable=False, default=False)
    betaTesting = db.Column(db.Boolean, unique=False, nullable=False, default=False)
    expenses = db.relationship('Expense', backref='owner', lazy=True)

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    note = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    currency = db.Column(db.String(3), nullable=False)
    
    # This foreign key links every expense to a specific user
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {"id": self.id, "amount": self.amount, "category": self.category, "note":self.note, "created_at": self.created_at, "user_id": self.user_id, "currency": self.currency}

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
                audience="authenticated",
                leeway=10
            )

            request.user_id = payload.get("sub")
            request.user_email = payload.get("email")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except Exception as e:
            return jsonify({"error": f"Security verification failed"}), 401

        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

def newApiKey():
    chars = string.ascii_letters  + string.digits
    secret_key = ''.join(secrets.choice(chars) for _ in range(16))

    return secret_key

@app.route("/api/log/ANDROID", methods=["POST", "GET"])
@require_auth
def api_android():
    user = User.query.filter_by(provider_uid = request.user_id).first()
    if not user:
        return jsonify({"error": "Unauthorisez"}), 401

    data = request.get_json()

    if float(data['amount']) < 0 or float(data['amount']) > 1000000:
        return jsonify({"error": "Invalid Value"}), 400
    try:
            new_expense = Expense(
                amount=float(data['amount']),
                category=data['category'],
                note=data.get('notes', ''),
                user_id=user.id,
                currency = data.get("currency", "INR")           
            )
            db.session.add(new_expense)
            db.session.commit()

            return jsonify({"message": "Expense logged successfully!", "id": new_expense.id}), 201

    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400

@app.route("/api/log/IOS", methods=["POST", "GET"])
def api():
    data = request.get_json()
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token format"}), 401

    token = auth_header.split(" ")[1]
    user = User.query.filter_by(apiKey=token).first()
    if not user:
        if not user:
            return jsonify({"error": "Unauthorized token"}), 401

    if not data or 'amount' not in data or 'category' not in data:
        return jsonify({"error": "Bad Request. Amount and Category are required."}), 400
    
    if float(data['amount']) < 0 or float(data['amount']) > 1000000:
        return jsonify({"error": "Invalid Value"}), 400
    

    try:
        new_expense = Expense(
            amount=float(data['amount']),
            category=data['category'],
            note=data.get('notes', ''),
            user_id=user.id,
            currency = data.get("currency", "INR")           
        )
        db.session.add(new_expense)
        db.session.commit()

        return jsonify({"message": "Expense logged successfully!", "id": new_expense.id}), 201

    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400

@app.route("/api/users", methods=["POST", "GET"])
def return_users():
    users = User.query.all()
    print(User.metadata)
    

    return jsonify([user.to_dict() for user in users]), 200

@app.route("/api/users/delete/<userId>", methods=["POST", "GET"])
def delete_users(userId):
    db.session.delete(User.query.get_or_404(userId))
    db.session.commit()


    return jsonify("done"), 200

@app.route("/api/expenses/<apikey>", methods=["POST", "GET"])
def return_expenses(apikey):
    user = User.query.filter_by(apiKey=apikey).first()
    expenses = Expense.query.filter_by(user_id = user.id)
    return jsonify([expense.to_dict() for expense in expenses]), 200

# API ROUTES FOR APP ITSELF
@app.route("/api/homepage", methods=["POST", "GET"])
@require_auth
def homepageData():
    user = User.query.filter_by(provider_uid=request.user_id).first()
    if not user:
            try:
                user = User(
                    provider_uid=request.user_id, 
                    email=request.user_email,
                    username=request.user_email.split('@')[0],
                    apiKey=newApiKey()
                )
                db.session.add(user)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(e)
                return jsonify({"error": "Failed to sync user profile"}), 500

    returnData = {
        "profileIconIndex": user.profileIconIndex
    }

    return jsonify(returnData), 200


@app.route("/api/new_user", methods=["POST"])
def new_user():
    data = request.get_json()
    apiKey = newApiKey()

    new_user = User(
        username=data['username'], 
        provider_uid = data["provider_uid"],
        email=data["email"], 
        apiKey = apiKey, 
        profileIconIndex=data["profileIcon"],
        firstName = data["firstName"], 
        lastName = data["lastName"], 
        country=data["country"], 
        currency=data["currency"], 
        impUpdates=data["impUpdates"], 
        monthlyUpdates=data["monthlyUpdates"], 
        betaTesting = data["betaTesting"]
        )

    db.session.add(new_user)
    db.session.commit()
    print(data)

    return jsonify({"msg":"New user created", "apiKey": apiKey}), 200

def get_current_week_bounds():
    today = date.today()
    # today.weekday() returns 0 for Monday, 6 for Sunday
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    return start_of_week, end_of_week

def get_last_monday_range(month_int, year=None):
    if year is None:
        year = datetime.now().year
        
    # calendar.monthcalendar returns a matrix representing a month's calendar.
    # Rows are weeks; 0 represents days belonging to the previous/next month.
    month_cal = calendar.monthcalendar(year, month_int)
    
    # calendar.MONDAY is index 0. We iterate backward through the weeks 
    # to find the first week that has a valid day in that Monday column.
    for week in reversed(month_cal):
        day = week[calendar.MONDAY]
        if day != 0:
            for lastDay in reversed(week):
                # Create the end of that month (23:59:59.999999)
                if lastDay != 0:
                    end_of_week = datetime.combine(datetime(year, month_int, day) + timedelta(days=week.index(lastDay)+1), time.max)
            # Create the start of that day (00:00:00)
            start_of_week = datetime.combine(datetime(year, month_int, day), time.min)

            return start_of_week, end_of_week

@app.route("/api/dashboard", methods=["POST", "GET"])
@app.route("/api/dashboard/<month>", methods=["POST", "GET"])
@app.route("/api/dashboard/<month>/<year>", methods=["POST", "GET"])
@require_auth
def dashboard(year=0, month=0):
    user = User.query.filter_by(provider_uid=request.user_id).first()
    if not user:
            try:
                user = User(
                    provider_uid=request.user_id, 
                    email=request.user_email,
                    username=request.user_email.split('@')[0],
                    apiKey=newApiKey()
                )
                db.session.add(user)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(e)
                return jsonify({"error": "Failed to sync user profile"}), 500

    # WE HAVE THE USER NOW TO RETURN ITS DATA
    '''
        return value should be dict
        [Food, Grocery, Entertainment, Stationery, Other]
        {
            currentWeekSpendings: [daily spending of this week only],
            categorisedPastMonth: [amount per category],
            budget: set by user | 2500,
            recentTransactions: past 3 days | 25 (which ever is less)
        }
    '''
    today = date.today()
    current_year = today.year if year == 0 else int(year)
    current_month = today.month if month == 0 else int(month)
    isCurrentMonthSame = (current_month == today.month and current_year == today.year)

    # ----------------------------------------------------
    # 1. Current Week
    # ----------------------------------------------------

    start_wk, end_wk= None, None 
    week_wise_spendings = []
    week_wise_comparison = []
    for i in range(9):
        if isCurrentMonthSame:
            start_wk, end_wk = get_current_week_bounds()
            week_query = db.session.query(
                func.date(Expense.created_at).label('date'),
                func.sum(Expense.amount).label('total')
            ).filter(
                Expense.user_id == user.id,
                Expense.created_at >= (start_wk - timedelta(days=7*i)),
                Expense.created_at <= (datetime.combine(end_wk, datetime.max.time()) - timedelta(days=7*i))
            ).group_by(func.date(Expense.created_at)).all()

        if not isCurrentMonthSame:
            start_wk, end_wk = get_last_monday_range(current_month, year=current_year)
            week_query = db.session.query(
                func.date(Expense.created_at).label('date'),
                func.sum(Expense.amount).label('total')
            ).filter(
                Expense.user_id == user.id,
                Expense.created_at >= (start_wk - timedelta(days=7*i)),
                Expense.created_at <= (datetime.combine(end_wk, datetime.max.time()) - timedelta(days=7*i))
            ).group_by(func.date(Expense.created_at)).all()

        # Map the dynamic query rows to a dict lookup {"2026-07-06": 705.0}
        daily_map = {str(row.date): float(row.total) for row in week_query}
        
        # Create the rigid list [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
        
        current_week_spendings = []
        for j in range(7):
            day_date = ((start_wk - timedelta(days=7*i)) + timedelta(days=j)).strftime("%Y-%m-%d")
            current_week_spendings.append(daily_map.get(str(day_date), 0.0))
            # currentWeekSum += daily_map.get(str(day_date), 0.0)
        week_wise_spendings.append(current_week_spendings)

    for i in range(len(week_wise_spendings) - 1):
        currentWeekSum, currentWeekAvg = 0,0
        prevWeekSum, prevWeekAvg = 0,0
        for spend in week_wise_spendings[i]:
            currentWeekSum += spend
            
        for spend in week_wise_spendings[i+1]:
            prevWeekSum += spend

        if i == 0:
            currentWeekAvg = round(currentWeekSum / (today.weekday() + 1), 2)
        else:
            currentWeekAvg = round(currentWeekSum / 7, 2)
        prevWeekAvg = round(prevWeekSum / 7, 2)

        week_wise_comparison.append( prevWeekAvg > currentWeekAvg)



    # ----------------------------------------------------
    # 2. CATEGORISED PAST MONTH (Current Calendar Month)
    # ----------------------------------------------------
    categories = ["Food", "Grocery", "Entertainment", "Stationery", "Other"]
    
    month_query = db.session.query(
        Expense.category,
        func.sum(Expense.amount).label('total')
    ).filter(
        Expense.user_id == user.id,
        func.extract('year', Expense.created_at) == current_year,
        func.extract('month', Expense.created_at) == current_month
    ).group_by(Expense.category).all()

    category_map = {row.category: float(row.total) for row in month_query}
    
    # Force alignment with your ordered list constraint
    categorised_past_month = [category_map.get(cat, 0.0) for cat in categories]

    # ----------------------------------------------------
    # 3. BUDGET (Fallback placeholder)
    # ----------------------------------------------------
    budget_val = 30000 

    # ----------------------------------------------------
    # 4. RECENT TRANSACTIONS (Past 3 days capped at 25)
    # ----------------------------------------------------
    if isCurrentMonthSame:
        three_days_ago = today - timedelta(days=3)
        
        # Utilizing Flask-SQLAlchemy's clean .query syntax helper
        recent_tx_query = Expense.query.filter(
            Expense.user_id == user.id,
            Expense.created_at >= three_days_ago
        ).order_by(Expense.created_at.desc()).limit(25).all()

    elif not isCurrentMonthSame:
        # Utilizing Flask-SQLAlchemy's clean .query syntax helper
        recent_tx_query = Expense.query.filter(
            Expense.user_id == user.id,
            Expense.created_at <= end_wk
        ).order_by(Expense.created_at.desc()).limit(25).all()

    recent_transactions = [{
        "id": tx.id,
        "amount": tx.amount,
        "category": tx.category,
        "date": tx.created_at.strftime("%d:%m:%Y:%H:%M:%S"),
        "currency": tx.currency,
        "note": tx.note
    } for tx in recent_tx_query]


    # ----------------------------------------------------
    # RETURN AGGREGATED RESPONSE DOCK
    # ----------------------------------------------------
    return jsonify({
        "firstName": user.username.split(" ")[0].title(),
        "profileIconIndex": user.profileIconIndex,
        "dataOfMonth": current_month,
        "categories": categories,
        "currentWeekSpendings": week_wise_spendings,
        "categorisedPastMonth": categorised_past_month,
        "budget": budget_val,
        "recentTransactions": recent_transactions,
        "prevWeekBetterAvg": week_wise_comparison
    }), 200



@app.route("/api/expense", methods=["POST", "GET"])
@app.route("/api/expense/<month>", methods=["POST", "GET"])
@app.route("/api/expense/<month>/<year>", methods=["POST", "GET"])
@require_auth
def expense(month=0, year=0):

    user = User.query.filter_by(provider_uid=request.user_id).first()

    # if not user:
    #     try:
    #         user = User(
    #             provider_uid=request.user_id, 
    #             email=request.user_email,
    #             username=request.user_email.split('@')[0],
    #             apiKey=newApiKey()
    #         )
    #         db.session.add(user)
    #         db.session.commit()
    #     except Exception as e:
    #         db.session.rollback()
    #         return jsonify({"error": "Failed to sync user profile"}), 500


    page = request.args.get('page', 1, type=int)
    expense_query = Expense.query.filter(
            Expense.user_id == user.id
        ).order_by(Expense.created_at.desc()).paginate(page=page, per_page=25, max_per_page=50, error_out=False)

    recent_transactions = [{    
        "id": tx.id,
        "amount": tx.amount,
        "category": tx.category,
        "date": tx.created_at.strftime("%d:%m:%Y:%H:%M:%S"),
        "currency": tx.currency,
        "note": tx.note.capitalize()
    } for tx in expense_query.items]


    return_value = {
        "firstName": user.username.split(" ")[0].title(),
        "expenses" : recent_transactions,
        "current_page" : expense_query.page,
        "isNotLastPage" : expense_query.has_next,
        "profileIconIndex": user.profileIconIndex
    }
    
    return jsonify(return_value),200



@app.route("/api/setup", methods=["POST", "GET"])
@require_auth
def setup():
    user = User.query.filter_by(provider_uid=request.user_id).first()

    return jsonify(user.apiKey), 200   



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
#                 currency = user.currency.split(" ")[0]          
#             )
            
#             db.session.add(new_expense)
#             db.session.commit()
#     # i = 0
#     # j=0
#     return jsonify(f'Generated {j+1} expense entires for {i+1} users each.')

try:
    with app.app_context():
        db.create_all()

except:
    pass
if __name__ == "__main__":
        
    app.run(debug=False, host="0.0.0.0")