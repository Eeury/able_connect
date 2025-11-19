"""
WSGI config for ableconnect_backend project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ableconnect_backend.settings')

application = get_wsgi_application()

app = application
