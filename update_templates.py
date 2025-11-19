#!/usr/bin/env python
"""
Script to update HTML templates with Django static tags
Run this after moving HTML files to templates/ directory
"""
import os
import re
from pathlib import Path

# Paths
TEMPLATES_DIR = Path(__file__).parent / 'templates'
STATIC_PATTERNS = [
    (r'href="/css/([^"]+)"', r"href='{% static 'css/\1' %}'"),
    (r'src="/css/([^"]+)"', r"src='{% static 'css/\1' %}'"),
    (r'href="/js/([^"]+)"', r"href='{% static 'js/\1' %}'"),
    (r'src="/js/([^"]+)"', r"src='{% static 'js/\1' %}'"),
    (r'src="/images/([^"]+)"', r"src='{% static 'images/\1' %}'"),
    (r'url\(/images/([^)]+)\)', r"url({% static 'images/\1' %})"),
]

def update_template(file_path):
    """Update a single template file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add {% load static %} if not present
    if '{% load static %}' not in content:
        # Insert after <head> tag
        content = re.sub(r'(<head[^>]*>)', r'\1\n  {% load static %}', content)
    
    # Replace static file references
    for pattern, replacement in STATIC_PATTERNS:
        content = re.sub(pattern, replacement, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated: {file_path}")

if __name__ == '__main__':
    if TEMPLATES_DIR.exists():
        for html_file in TEMPLATES_DIR.glob('*.html'):
            update_template(html_file)
        print("Templates updated successfully!")
    else:
        print(f"Templates directory not found: {TEMPLATES_DIR}")
        print("Please create it and move HTML files there first.")

