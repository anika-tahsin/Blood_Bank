
from django.urls import path
from .views import RegisterView, VerifyEmailView, CurrentUserView, LogoutView, CustomTokenObtainPairView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/<uidb64>/<token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("logout/", LogoutView.as_view(), name="logout"),
]


