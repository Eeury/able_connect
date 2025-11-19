#!/usr/bin/env python
"""
Script to create or update Django admin superuser
Run: python manage.py shell < create_admin.py
Or: python create_admin.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ableconnect_backend.settings')
django.setup()

from api.models import User

def create_or_update_admin(username='admin', email='admin@ableconnect.com', password='admin123'):
    """Create or update admin superuser"""
    try:
        # Try to get existing admin user
        admin = User.objects.filter(username=username).first()
        
        if admin:
            # Update existing user
            admin.email = email
            admin.set_password(password)
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
            print(f'✓ Updated existing admin user: {username}')
        else:
            # Create new superuser
            admin = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                user_type='pwd'
            )
            print(f'✓ Created new admin user: {username}')
        
        print(f'  Email: {admin.email}')
        print(f'  Is Staff: {admin.is_staff}')
        print(f'  Is Superuser: {admin.is_superuser}')
        print(f'\nYou can now login at: http://localhost:8000/admin/')
        print(f'Username: {username}')
        print(f'Password: {password}')
        
    except Exception as e:
        print(f'✗ Error creating admin: {e}')

if __name__ == '__main__':
    import sys
    
    # Get credentials from command line or use defaults
    username = sys.argv[1] if len(sys.argv) > 1 else 'admin'
    email = sys.argv[2] if len(sys.argv) > 2 else 'admin@ableconnect.com'
    password = sys.argv[3] if len(sys.argv) > 3 else 'admin123'
    
    create_or_update_admin(username, email, password)

