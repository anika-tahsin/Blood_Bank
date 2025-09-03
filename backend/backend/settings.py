
from pathlib import Path
from datetime import timedelta
import os
import environ
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-change-me")
DEBUG = True
ALLOWED_HOSTS = ['blood-bank-backend-upcq.onrender.com',
    'localhost',"127.0.0.1",
]
FRONTEND_URL = "https://blood-bank-frontend-2qog.onrender.com" 

# Initialise environment variables
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))
load_dotenv() 

# --- Apps ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd party
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",

    # local
    "accounts",
]

# --- Middleware (corsheaders BEFORE CommonMiddleware) ---
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# --- Database: SQLite for development ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# (Optional) MySQL config for later:
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.mysql",
#         "NAME": "blood_bank",
#         "USER": "root",
#         "PASSWORD": "yourpassword",
#         "HOST": "127.0.0.1",
#         "PORT": "3306",
#         "OPTIONS": {"charset": "utf8mb4"},
#     }
# }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF + JWT ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

# --- Custom User Model ---
AUTH_USER_MODEL = "accounts.User"

AUTHENTICATION_BACKENDS = [
    "accounts.backends.EmailOrUsernameModelBackend",  # custom backend
    "django.contrib.auth.backends.ModelBackend",      # default
]



from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}

# --- CORS (frontend at Vite default port) ---
CORS_ALLOWED_ORIGINS = [
    "https://blood-bank-frontend-2qog.onrender.com",
    "http://127.0.0.1:5173","http://localhost:5173",
    "blood-bank-backend-upcq.onrender.com"
]
CSRF_TRUSTED_ORIGINS = [
    "https://blood-bank-frontend-2qog.onrender.com",
    "blood-bank-backend-upcq.onrender.com",
    "http://127.0.0.1:5173","http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True


# Email backend

EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")