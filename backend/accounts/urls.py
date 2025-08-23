
from django.urls import path
from .views import RegisterView, VerifyEmailView
#, VerifyEmailView, LoginView, LogoutView

app_name = 'accounts'

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify/<uidb64>/<token>/", VerifyEmailView.as_view(), name="verify-email"),
    #path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    #path("login/", LoginView.as_view(), name="login"),
    #path("logout/", LogoutView.as_view(), name="logout"),
]
