"""
URL configuration for ableconnect_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.views_frontend import index_view, homepage_view, client_view, tubonge_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Frontend routes
    path('', index_view, name='index'),
    path('homepage.html', homepage_view, name='homepage'),
    path('client.html', client_view, name='client'),
    path('tubonge.html', tubonge_view, name='tubonge'),
]

# Serve static and media files in development
if settings.DEBUG:
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

