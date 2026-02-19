# your_app/chatbot_logic.py
from .models import ChatHistory # Replace with your actual model name

def get_chatbot_context(query_keyword=None):
    """
    This replaces 'reading the JSON file'. 
    It pulls the latest data directly from your Django Database.
    """
    if query_keyword:
        # Search for specific info based on what the user asked
        results = ChatHistory.objects.filter(content__icontains=query_keyword)
    else:
        # Just get the latest 10 updates
        results = ChatHistory.objects.all().order_by('-id')[:10]

    # Format the database objects into a string the chatbot can understand
    context = ""
    for item in results:
        context += f"Topic: {item.title}\nInfo: {item.content}\n\n"
    
    return context