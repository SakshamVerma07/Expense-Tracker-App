from flask import Blueprint, request, jsonify

from datetime import datetime, timedelta, date, time
from sqlalchemy import func
import calendar

from app.extensions import db
from app.models import User, Expense
from app.utils.auth import require_auth

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)

def get_current_week_bounds():

    today = date.today()

    start_of_week = today - timedelta(
        days=today.weekday()
    )

    end_of_week = start_of_week + timedelta(
        days=6
    )

    return start_of_week, end_of_week

def get_last_monday_range(month_int, year=None):

    if year is None:
        year = datetime.now().year


    month_cal = calendar.monthcalendar(
        year,
        month_int
    )


    for week in reversed(month_cal):

        day = week[calendar.MONDAY]

        if day != 0:

            start = datetime.combine(
                datetime(
                    year,
                    month_int,
                    day
                ),
                time.min
            )


            end = start + timedelta(
                days=6,
                hours=23,
                minutes=59,
                seconds=59
            )


            return start, end
        
@dashboard_bp.route(
    "/api/dashboard",
    methods=["GET","POST"]
)

@dashboard_bp.route(
    "/api/dashboard/<month>",
    methods=["GET","POST"]
)

@dashboard_bp.route(
    "/api/dashboard/<month>/<year>",
    methods=["GET","POST"]
)

@require_auth
def dashboard(
    month=0,
    year=0
):

    user = User.query.filter_by(
        provider_uid=request.user_id
    ).first()


    if not user:

        return jsonify({
            "error":"User not found"
        }),404
    
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