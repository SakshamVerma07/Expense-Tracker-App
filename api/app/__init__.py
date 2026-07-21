from flask import Flask, request
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate
from .logging_config import setup_logging
from flask_talisman import Talisman

import logging

logger = logging.getLogger(__name__)



def create_app():
    setup_logging()

    app = Flask(__name__)

    app.config.from_object(Config)


    # Talisman(
    #     app,
    #     force_https=False
    # )

    CORS(
        app,
        origins=[
            "https://expense-tracker-app-mu-pied.vercel.app"
        ]
    )


    db.init_app(app)
    migrate.init_app(app,db)
    
    from .errors import register_error_handlers
    register_error_handlers(app)

    from .extensions import limiter

    limiter.init_app(app)


    from . import models
    from .routes.mobile import mobile_bp
    from .routes.users import users_bp
    from .routes.expenses import expenses_bp
    from .routes.dashboard import dashboard_bp

    app.register_blueprint(
        mobile_bp
    )
    app.register_blueprint(
        users_bp
    )
    app.register_blueprint(
        expenses_bp
    )
    app.register_blueprint(
        dashboard_bp
    )

    @app.before_request
    def log_request():

        logger.info(
            "%s %s",
            request.method,
            request.path
        )
    return app

