import os
from pathlib import Path


GOOGLE_MAPS_API_KEY='AIzaSyC7BWgCzP-RbEa0GiDaBDuDnG5L32c7bi0'

DEFAULT_FROM_EMAIL='tdreyer62@gmail.com'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-server'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your@email.com'
EMAIL_HOST_PASSWORD = 'your-email-password'
DEFAULT_FROM_EMAIL='tdreyer62@gmail.com'


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ')mhr(jqjluqws2r6s=%_@598n5c0b=g+d002_inew9%8-y$2m-'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    'www.blumaps.com',
    'blumaps.com',
    '127.0.0.1',
    'localhost',
    
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'TaskManagementApp',
    'messaging_app',
 
   # Add your apps here
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'taskManagement.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['TaskManagementApp/templates'],
        'APP_DIRS': True,  # This line should be inside this dictionary
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'taskManagement.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'blumap_db',
        'USER': 'blumapdbmaster',
        'PASSWORD': '2025BlumapDBmaster#',
        'HOST': 'blumap-database-1.cfdjwarrwgrc.eu-west-2.rds.amazonaws.com',
        'PORT': '5432',
        'OPTIONS': {
            'connect_timeout': 10,  # Connection timeout in seconds
            'options': '-c statement_timeout=30000',  # Statement timeout (30 seconds)
        },
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

import os.path

import os

# Ensure that STATIC_URL is defined
STATIC_URL = '/static/'

# Add the directories where Django will look for static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'TaskManagementApp/static'),  # Adjust the path if needed
]

# Define where to collect static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # This is where collected files will go


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CSRF_COOKIE_SECURE = True

CSRF_USE_SESSIONS = False

SESSION_COOKIE_SECURE = True

SESSION_COOKIE_DOMAIN = '.blumaps.com'

CSRF_COOKIE_DOMAIN = '.blumaps.com'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

