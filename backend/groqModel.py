import os
from dotenv import load_dotenv
from groq import Groq
load_dotenv()
key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=key)

def groq_message_model(valor_sort_filter, messages):

    keys_to_delete = []
    # "Very Toxic" = 3 
    # "Toxic" = 2  
    # "Slightly Toxic" = 1 
    # "Not Toxic" = 0
    for id, comentario in messages.items():
        if int(valor_sort_filter) != classify_message(comentario):
            keys_to_delete.append(id)
    
    # Eliminar los elementos marcados
    for key in keys_to_delete:
        del messages[key]

    return messages


def classify_message(text):

    prompt = f'''
        Please classify the following message into one of the four categories based on its toxicity level: "Very Toxic", "Toxic", "Slightly Toxic", or "Not Toxic". Only respond with the category name and nothing else. Here is the message:
        "{text}"
        Category:
    '''

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt
            },
        ],
        model="llama3-8b-8192",
    )

    result = chat_completion.choices[0].message.content.lower()
    print(result)

    #tener en cuenta el orden de las comparaciones
    if 'very toxic' in result:
        return 3
    elif 'not toxic' in result:
        return 0
    elif 'slightly toxic' in result:
        return 1
    elif  'toxic' in result:
        return 2
    else:
        return -1

