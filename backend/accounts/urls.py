
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'blood-requests', views.BloodRequestViewSet, basename='bloodrequest')
router.register(r'donation-history', views.DonationHistoryViewSet, basename='donationhistory')
router.register(r'profile', views.ProfileView, basename='profile')

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    # path('verify-email/<str:uid>/<str:token>/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('verify-email/<str:uidb64>/<str:token>/', views.VerifyEmailView.as_view(), name='verify_email'),
    
    # Profile endpoints --let's see
    # path('profile/', views.ProfileView.as_view(), name='profile'),
    
    # Dashboard and stats endpoints (function-based views don’t need .as_view())
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('available-donors/', views.available_donors, name='available_donors'),
    
    # Include router URLs (blood-requests/ and donation-history/)
    path('', include(router.urls)),
]
