import json
import os
from bs4 import BeautifulSoup

def update_json_from_html():
    html_path = 'templates/my_knowledge.html'
    json_path = 'static/resume_data.json'
    
    if not os.path.exists(html_path):
        print("HTML file not found!")
        return

    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Example: Finding all <div> elements with class 'achievement'
    # You will need to change 'div' and 'achievement' to match your HTML tags!
    achievements_list = []
    
    # Let's assume your HTML has <div class="item"><h4>Category</h4><p>Details</p></div>
    items = soup.find_all('div', class_='achievements-item') 
    
    for item in items:
        category = item.find('h4').get_text(strip=True)
        details = item.find('p').get_text(strip=True)
        
        achievements_list.append({
            "category": category,
            "details": details
        })

    # OVERWRITE the JSON file
    data = {"achievements-item": achievements_list}
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print("JSON has been overwritten with new HTML content.")