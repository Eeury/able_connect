from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator


class User(AbstractUser):
    """Custom user model for both PWD and Client users"""
    USER_TYPE_CHOICES = [
        ('pwd', 'PWD'),
        ('client', 'Client'),
    ]
    
    CLIENT_TYPE_CHOICES = [
        ('gig', 'Gig'),
        ('service', 'Service'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='pwd')
    phone = models.CharField(max_length=20, blank=True)
    disability = models.CharField(max_length=100, blank=True)
    skills = models.JSONField(default=list, blank=True)
    client_type = models.CharField(max_length=10, choices=CLIENT_TYPE_CHOICES, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class TubongePost(models.Model):
    """Posts in the Tubonge social feed"""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tubonge_posts')
    text = models.TextField()
    media_file = models.FileField(
        upload_to='tubonge_media/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'])]
    )
    media_type = models.CharField(max_length=10, choices=[('image', 'Image'), ('video', 'Video')], blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Tubonge Post'
        verbose_name_plural = 'Tubonge Posts'
    
    def __str__(self):
        return f"Post by {self.author.username} - {self.text[:50]}"
    
    @property
    def like_count(self):
        return self.likes.count()


class PostComment(models.Model):
    """Comments on Tubonge posts"""
    post = models.ForeignKey(TubongePost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
    
    def __str__(self):
        return f"Comment by {self.author.username} on post {self.post.id}"


class Gig(models.Model):
    """Gigs posted by clients"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_gigs', limit_choices_to={'user_type': 'client'})
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    timeframe = models.CharField(max_length=100)
    requirements = models.TextField()
    document = models.FileField(
        upload_to='gig_documents/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])]
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Gig'
        verbose_name_plural = 'Gigs'
    
    def __str__(self):
        return f"{self.title} by {self.client.username}"


class Service(models.Model):
    """Services posted by clients"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_services', limit_choices_to={'user_type': 'client'})
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=100)
    requirements = models.TextField()
    document = models.FileField(
        upload_to='service_documents/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])]
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
    
    def __str__(self):
        return f"{self.title} by {self.client.username}"


class Bid(models.Model):
    """Bids on gigs by PWD users"""
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gig_bids', limit_choices_to={'user_type': 'pwd'})
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    proposal = models.TextField()
    document = models.FileField(
        upload_to='bid_documents/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Bid'
        verbose_name_plural = 'Bids'
    
    def __str__(self):
        return f"Bid by {self.bidder.username} on {self.gig.title}"


class Booking(models.Model):
    """Bookings for services by PWD users"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    booker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_bookings', limit_choices_to={'user_type': 'pwd'})
    proposal = models.TextField()
    document = models.FileField(
        upload_to='booking_documents/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
    
    def __str__(self):
        return f"Booking by {self.booker.username} for {self.service.title}"


class Message(models.Model):
    """Chat messages between users"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        indexes = [
            models.Index(fields=['sender', 'recipient', 'created_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"

