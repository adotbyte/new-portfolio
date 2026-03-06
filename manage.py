#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def ensure_files_exist():
    # This finds the exact folder your manage.py is in
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    txt_path = os.path.join(BASE_DIR, 'brain_sync.txt')
    db_path = os.path.join(BASE_DIR, 'chroma_db')

    # Create the text file if it's missing
    if not os.path.exists(txt_path):
        with open(txt_path, 'w') as f:
            f.write("Initial sync data\n")
        print(f"✅ Created missing file at: {txt_path}")

    # Create the database folder if it's missing
    if not os.path.exists(db_path):
        os.makedirs(db_path, exist_ok=True)
        print(f"✅ Created missing folder at: {db_path}")

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