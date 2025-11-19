from django.shortcuts import render


def index_view(request):
    """Landing page"""
    return render(request, 'index.html')


def homepage_view(request):
    """PWD user homepage"""
    return render(request, 'homepage.html')


def client_view(request):
    """Client dashboard"""
    return render(request, 'client.html')


def tubonge_view(request):
    """Tubonge social feed"""
    return render(request, 'tubonge.html')

