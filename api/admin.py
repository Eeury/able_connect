from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    User, TubongePost, PostComment, Gig, Service, 
    Bid, Booking, Message
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model"""
    list_display = ['username', 'email', 'user_type', 'client_type', 'phone', 'created_at']
    list_filter = ['user_type', 'client_type', 'created_at']
    search_fields = ['username', 'email', 'phone']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'client_type', 'phone', 'disability', 'skills', 'profile_picture')
        }),
    )


@admin.register(TubongePost)
class TubongePostAdmin(admin.ModelAdmin):
    """Admin for Tubonge posts with delete privilege"""
    list_display = ['id', 'author', 'text_preview', 'like_count', 'created_at', 'delete_button']
    list_filter = ['created_at', 'author']
    search_fields = ['text', 'author__username', 'author__email']
    readonly_fields = ['created_at', 'updated_at']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text'
    
    def delete_button(self, obj):
        return format_html(
            '<a class="button" href="/admin/api/tubongepost/{}/delete/">Delete</a>',
            obj.id
        )
    delete_button.short_description = 'Actions'


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'author', 'text_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['text', 'author__username']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text'


@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    """Admin for Gigs with delete privilege"""
    list_display = ['id', 'title', 'client', 'price', 'status', 'views', 'created_at', 'delete_button']
    list_filter = ['status', 'created_at', 'client']
    search_fields = ['title', 'description', 'client__username']
    readonly_fields = ['created_at', 'updated_at', 'views']
    
    def delete_button(self, obj):
        return format_html(
            '<a class="button" href="/admin/api/gig/{}/delete/">Delete</a>',
            obj.id
        )
    delete_button.short_description = 'Actions'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin for Services with delete privilege"""
    list_display = ['id', 'title', 'client', 'price', 'status', 'views', 'created_at', 'delete_button']
    list_filter = ['status', 'created_at', 'client']
    search_fields = ['title', 'description', 'client__username']
    readonly_fields = ['created_at', 'updated_at', 'views']
    
    def delete_button(self, obj):
        return format_html(
            '<a class="button" href="/admin/api/service/{}/delete/">Delete</a>',
            obj.id
        )
    delete_button.short_description = 'Actions'


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['id', 'gig', 'bidder', 'amount', 'created_at']
    list_filter = ['created_at', 'gig']
    search_fields = ['proposal', 'bidder__username']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'service', 'booker', 'created_at']
    list_filter = ['created_at', 'service']
    search_fields = ['proposal', 'booker__username']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin for Messages with ability to initiate chat"""
    list_display = ['id', 'sender', 'recipient', 'text_preview', 'is_read', 'created_at', 'initiate_chat_button']
    list_filter = ['is_read', 'created_at']
    search_fields = ['text', 'sender__username', 'recipient__username']
    readonly_fields = ['created_at']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text'
    
    def initiate_chat_button(self, obj):
        return format_html(
            '<a class="button" href="/admin/api/message/add/">Initiate New Chat</a>'
        )
    initiate_chat_button.short_description = 'Actions'
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Allow admin to select any user for sender/recipient
        form.base_fields['sender'].queryset = User.objects.all()
        form.base_fields['recipient'].queryset = User.objects.all()
        return form

