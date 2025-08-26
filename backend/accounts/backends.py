
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):

    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to get the user by email
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            try:
                # If not found, try by username
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        # Verify password and ensure the user is active
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
