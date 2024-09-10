from transformers import pipeline

def sort_filter_messages_model(modelo_c, valor_sort_filter, messages):
    model_name = ""
    values_dict={}

    if modelo_c == 'multilingual':
        model_name = "lxyuan/distilbert-base-multilingual-cased-sentiments-student"
    elif modelo_c == 'twitter':
        model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    elif modelo_c == 'martin-toxic':
        model_name = "martin-ha/toxic-comment-model"
    elif modelo_c == 'jonatan-spanish':
        model_name = "JonatanGk/roberta-base-bne-finetuned-cyberbullying-spanish"
    elif modelo_c == 'emotions':
        model_name = "j-hartmann/emotion-english-distilroberta-base"

    model_classifier = pipeline(
        model=model_name,
        top_k=None
    )   

    if modelo_c == 'multilingual' or modelo_c == 'twitter':
        positive, neutral, negative = 0.0, 0.0, 0.0

        for id, comentario in messages.items():
            result = model_classifier(comentario)
            for item in result[0]:
                if item['label'] == 'positive':
                    positive = item['score']
                if item['label'] == 'neutral':
                    neutral = item['score']
                if item['label'] == 'negative':
                    negative = item['score']
            values_dict[id] = {'Positivo': round(positive*100, 2), 'Neutral': round(neutral*100, 2), 'Negativo': round(negative*100, 2)}
        
        filtered_values_dict = {k: v for k, v in values_dict.items() if v['Negativo'] > float(valor_sort_filter)}

        return filtered_values_dict
    
    elif modelo_c == 'martin-toxic':
        toxic, non_toxic = 0.0, 0.0

        for id, comentario in messages.items():
            result = model_classifier(comentario)
            for item in result[0]:
                if item['label'] == 'toxic':
                    toxic = item['score']
                if item['label'] == 'non-toxic':
                    non_toxic = item['score']
            values_dict[id] = {'toxic': round(toxic*100, 2), 'non_toxic': round(non_toxic*100, 2)}
        
        filtered_values_dict = {k: v for k, v in values_dict.items() if v['toxic'] > float(valor_sort_filter)}

        return filtered_values_dict
    
    elif modelo_c == 'jonatan-spanish':
        bullying, not_bullying = 0.0, 0.0

        for id, comentario in messages.items():
            result = model_classifier(comentario)
            for item in result[0]:
                if item['label'] == 'Bullying':
                    bullying = item['score']
                    values_dict[id] = {'bullying': round(bullying*100, 2), 'not_bullying': round(100-round(bullying*100, 2),2)}

                if item['label'] == 'not_bullying':
                    not_bullying = item['score']
                    values_dict[id] = {'bullying': round(100-round(not_bullying*100, 2),2), 'not_bullying': round(not_bullying*100, 2)}
        
        filtered_values_dict = {k: v for k, v in values_dict.items() if v['bullying'] > float(valor_sort_filter)}
        return filtered_values_dict
        
    elif modelo_c == 'emotions':

        for id, comentario in messages.items():
            valor_maximo = 0
            id_maximo = None
            result = model_classifier(comentario)
            for item in result[0]:
                if item['score'] > valor_maximo:
                    valor_maximo = item['score']
                    id_maximo = item
                

            if id_maximo['label'] == valor_sort_filter:
                value = id_maximo['score']
                values_dict[id] = {'emotion': round(value*100, 2)}
            
        return values_dict

    else: return None




