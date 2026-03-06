#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

### brain_sync.txt and chroma_db problem solved
def ensure_files_exist():
    # Create the text file if it's missing
    if not os.path.exists('brain_sync.txt'):
        with open('brain_sync.txt', 'w') as f:
            f.write("Initial sync data\n")
        print("✅ Created missing brain_sync.txt")

    # Create the database folder if it's missing
    if not os.path.exists('chroma_db'):
        os.makedirs('chroma_db')
        print("✅ Created missing chroma_db directory")