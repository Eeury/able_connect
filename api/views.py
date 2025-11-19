from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth import login
from django.db.models import Q, Count, Max
from django.shortcuts import get_object_or_404
from .models import (
    User, TubongePost, PostComment, Gig, Service,
    Bid, Booking, Message
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    TubongePostSerializer, PostCommentSerializer,
    GigSerializer, ServiceSerializer,
    BidSerializer, BookingSerializer,
    MessageSerializer, ConversationSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User operations"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create' or self.action == 'register':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """User registration endpoint"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({
                'message': 'Registration successful',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """User login endpoint"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class TubongePostViewSet(viewsets.ModelViewSet):
    """ViewSet for Tubonge posts"""
    queryset = TubongePost.objects.all()
    serializer_class = TubongePostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = TubongePost.objects.select_related('author').prefetch_related('likes', 'comments')
        return queryset.annotate(comments_count=Count('comments')).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like/unlike a post"""
        post = self.get_object()
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            return Response({'liked': False, 'like_count': post.like_count})
        else:
            post.likes.add(request.user)
            return Response({'liked': True, 'like_count': post.like_count})
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """Add a comment to a post"""
        post = self.get_object()
        comment = PostComment.objects.create(
            post=post,
            author=request.user,
            text=request.data.get('text')
        )
        serializer = PostCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get all comments for a post"""
        post = self.get_object()
        comments = post.comments.select_related('author').all()
        serializer = PostCommentSerializer(comments, many=True)
        return Response(serializer.data)


class GigViewSet(viewsets.ModelViewSet):
    """ViewSet for Gigs"""
    queryset = Gig.objects.all()
    serializer_class = GigSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Gig.objects.select_related('client')
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    @action(detail=True, methods=['post'])
    def bid(self, request, pk=None):
        """Place a bid on a gig"""
        gig = self.get_object()
        if request.user.user_type != 'pwd':
            return Response({'error': 'Only PWD users can place bids'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = BidSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gig=gig, bidder=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for Services"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Service.objects.select_related('client')
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    @action(detail=True, methods=['post'])
    def book(self, request, pk=None):
        """Book a service"""
        service = self.get_object()
        if request.user.user_type != 'pwd':
            return Response({'error': 'Only PWD users can book services'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(service=service, booker=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Messages"""
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see messages they sent or received
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        ).select_related('sender', 'recipient')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get all conversations for the current user"""
        user = request.user
        
        # Get all unique users the current user has conversed with
        conversations = Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).values('sender', 'recipient').annotate(
            last_message_time=Max('created_at')
        )
        
        conversation_list = []
        user_ids = set()
        
        for conv in conversations:
            other_user_id = conv['recipient'] if conv['sender'] == user.id else conv['sender']
            if other_user_id not in user_ids:
                user_ids.add(other_user_id)
                other_user = User.objects.get(id=other_user_id)
                
                # Get last message
                last_message = Message.objects.filter(
                    Q(sender=user, recipient=other_user) | Q(sender=other_user, recipient=user)
                ).order_by('-created_at').first()
                
                # Get unread count
                unread_count = Message.objects.filter(
                    sender=other_user, recipient=user, is_read=False
                ).count()
                
                conversation_data = {
                    'user': UserSerializer(other_user).data,
                    'last_message': MessageSerializer(last_message).data if last_message else None,
                    'unread_count': unread_count
                }
                conversation_list.append(conversation_data)
        
        # Serialize each conversation
        serialized_conversations = []
        for conv in conversation_list:
            serializer = ConversationSerializer(conv)
            serialized_conversations.append(serializer.data)
        
        return Response(serialized_conversations)
    
    @action(detail=False, methods=['get'])
    def with_user(self, request):
        """Get messages with a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        other_user = get_object_or_404(User, id=user_id)
        messages = Message.objects.filter(
            Q(sender=request.user, recipient=other_user) |
            Q(sender=other_user, recipient=request.user)
        ).select_related('sender', 'recipient').order_by('created_at')
        
        # Mark messages as read
        Message.objects.filter(sender=other_user, recipient=request.user, is_read=False).update(is_read=True)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def admin_send(self, request):
        """Admin endpoint to send message to any user"""
        sender_id = request.data.get('sender_id')
        recipient_id = request.data.get('recipient_id')
        text = request.data.get('text')
        
        if not all([sender_id, recipient_id, text]):
            return Response({'error': 'sender_id, recipient_id, and text are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        sender = get_object_or_404(User, id=sender_id)
        recipient = get_object_or_404(User, id=recipient_id)
        
        message = Message.objects.create(sender=sender, recipient=recipient, text=text)
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

