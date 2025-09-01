import os
from django.core.management.base import BaseCommand
from accounts.utils import setup_user_groups

class Command(BaseCommand):
    help = 'Set up user groups and permissions'

    def handle(self, *args, **options):
        setup_user_groups()
        self.stdout.write(self.style.SUCCESS('Successfully set up user groups and permissions'))

