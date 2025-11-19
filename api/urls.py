from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, TubongePostViewSet, GigViewSet,
    ServiceViewSet, MessageViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'tubonge-posts', TubongePostViewSet, basename='tubonge-post')
router.register(r'gigs', GigViewSet, basename='gig')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]

