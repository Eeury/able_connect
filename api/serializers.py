from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, TubongePost, PostComment, Gig, Service,
    Bid, Booking, Message
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'phone', 'disability', 
                  'skills', 'client_type', 'profile_picture', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'user_type', 
                  'phone', 'disability', 'skills', 'client_type']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=[('pwd', 'PWD'), ('client', 'Client')], required=False)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    raise serializers.ValidationError('Invalid email or password.')
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                attrs['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid email or password.')
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs


class TubongePostSerializer(serializers.ModelSerializer):
    """Serializer for Tubonge posts"""
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True, required=False)
    like_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    text = serializers.CharField(required=False, allow_blank=True)
    likes = UserSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = TubongePost
        fields = ['id', 'author', 'author_id', 'text', 'media_file', 'media_type', 
                  'link', 'like_count', 'comments_count', 'likes', 'comments', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_comments(self, obj):
        """Get comments for this post"""
        comments = obj.comments.select_related('author').all()[:10]  # Limit to 10 most recent
        return PostCommentSerializer(comments, many=True).data
    
    def validate(self, attrs):
        """Ensure at least text, media_file, or link is provided"""
        text = attrs.get('text', '').strip() if attrs.get('text') else ''
        media_file = attrs.get('media_file')
        link = attrs.get('link', '').strip() if attrs.get('link') else ''
        
        if not text and not media_file and not link:
            raise serializers.ValidationError('Post must have at least text, media file, or link.')
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('author_id', None)
        return super().create(validated_data)


class PostCommentSerializer(serializers.ModelSerializer):
    """Serializer for post comments"""
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = PostComment
        fields = ['id', 'post', 'author', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']


class GigSerializer(serializers.ModelSerializer):
    """Serializer for Gigs"""
    client = UserSerializer(read_only=True)
    
    class Meta:
        model = Gig
        fields = ['id', 'client', 'title', 'description', 'price', 'timeframe', 
                  'requirements', 'document', 'status', 'views', 'created_at', 'updated_at']
        read_only_fields = ['id', 'views', 'created_at', 'updated_at']


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Services"""
    client = UserSerializer(read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'client', 'title', 'description', 'price', 'duration', 
                  'requirements', 'document', 'status', 'views', 'created_at', 'updated_at']
        read_only_fields = ['id', 'views', 'created_at', 'updated_at']


class BidSerializer(serializers.ModelSerializer):
    """Serializer for Bids"""
    bidder = UserSerializer(read_only=True)
    
    class Meta:
        model = Bid
        fields = ['id', 'gig', 'bidder', 'amount', 'proposal', 'document', 'created_at']
        read_only_fields = ['id', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Bookings"""
    booker = UserSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'service', 'booker', 'proposal', 'document', 'created_at']
        read_only_fields = ['id', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Messages"""
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'text', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.Serializer):
    """Serializer for conversation between two users"""
    user = UserSerializer()
    last_message = MessageSerializer(required=False, allow_null=True)
    unread_count = serializers.IntegerField()

