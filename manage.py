#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def ensure_files_exist():
    """Check for missing files/folders before Django starts."""
    # Create the text file if it's missing
    if not os.path.exists('brain_sync.txt'):
        with open('brain_sync.txt', 'w') as f:
            f.write("Initial sync data\n")
        print("✅ Created missing brain_sync.txt")

    # Create the database folder if it's missing
    if not os.path.exists('chroma_db'):
        # exist_ok=True prevents an error if the folder was created 1 second ago
        os.makedirs('chroma_db', exist_ok=True) 
        print("✅ Created missing chroma_db directory")

def main():
    """Run administrative tasks."""
    # RUN THE CHECK HERE
    ensure_files_exist()

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