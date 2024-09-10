import pytest, os
from fastapi.testclient import TestClient
from main import app
from repository import db
from dotenv import load_dotenv
load_dotenv()

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    # Limpiar la colección de usuarios antes de cada prueba
    db.users.delete_many({})
    yield
    # Limpiar la colección de usuarios después de cada prueba
    db.users.delete_many({})

def test_sign_up():
    # Datos de prueba para un nuevo usuario
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Testpassword123"
    }
    response = client.post("/sign_up", json=user_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Usuario registrado exitosamente"
    assert "session_id" in response.json()

def test_sign_up_invalid_user():
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword"  # la contraseña no cumple los requisitos
    }
    response = client.post("/sign_up", json=user_data)

    # Extraer los detalles de error de la respuesta JSON
    error_details = response.json().get("detail", [])
    
    assert response.status_code == 422
    assert isinstance(error_details, list) and len(error_details) > 0
    
    # Verificar que el mensaje de error contiene el texto esperado
    assert error_details[0]["msg"].startswith("Value error, La contraseña debe contener al menos una letra mayúscula")
    assert error_details[0]["loc"] == ["body", "password"]


def test_sign_up_duplicate_user():
    # Crear un usuario por primera vez
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Testpassword123"
    }
    client.post("/sign_up", json=user_data)

    # Intentar crear el mismo usuario de nuevo
    response = client.post("/sign_up", json=user_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Username or email already registered"

def test_log_in():
    # Primero, registrar un usuario
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Testpassword123"
    }
    client.post("/sign_up", json=user_data)

    # Luego, iniciar sesión con las credenciales correctas
    login_data = {
        "username": "testuser",
        "password": "Testpassword123"
    }
    response = client.post("/log_in", json=login_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Inicio de sesión exitoso"
    assert "session_id" in response.json()

def test_log_in_wrong_password():
    # Primero, registrar un usuario
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Testpassword123"
    }
    client.post("/sign_up", json=user_data)

    # Intentar iniciar sesión con una contraseña incorrecta
    login_data = {
        "username": "testuser",
        "password": "wrongpassword"
    }
    response = client.post("/log_in", json=login_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales incorrectas"

def test_log_out():
    # Primero, registrar e iniciar sesión con un usuario
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Testpassword123"
    }
    sign_up_response = client.post("/sign_up", json=user_data)

    session_id = sign_up_response.json()["session_id"]
    cookies = {"session_id": session_id}

    # Luego, cerrar sesión
    response = client.get("/log_out", cookies=cookies)
    assert response.status_code == 200


def create_user_with_instance():
    db.users.insert_one({
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "hashed_password", 
        "id_session": "un_id_sesion_cualquiera",
        "instance_token": os.getenv("TOKEN_INSTANCIA_PRAW_TEST")
    })

def test_profile():
    create_user_with_instance()

    response = client.get('/profile/', cookies={"session_id": "un_id_sesion_cualquiera"})

    assert response.status_code == 200
    json_response = response.json()
    assert "username" in json_response
    assert "moderator_subreddits" in json_response
    assert isinstance(json_response["moderator_subreddits"], list)

def test_subreddit_posts():

    create_user_with_instance()

    response = client.get('/subreddit_posts/ComunidadTFG', cookies={"session_id": "un_id_sesion_cualquiera"})

    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    if json_response:
        assert 'id' in json_response[0]
        assert 'title' in json_response[0]
        assert 'author' in json_response[0]
        assert 'num_comments' in json_response[0]
        assert 'created_utc' in json_response[0]
        assert 'content' in json_response[0]
        assert 'url' in json_response[0]

def test_multilingual_model():
    modelo_c = 'multilingual'  
    valor_sort_filter = '50'  

    messages_model =  {
        "messages_model": {
        "1": "Bravo pour ton travail, c’est excellent!",
        "2": "Nice job on the report!",
        "3": "te quiero hacer daño, eres malo",
        "4": "i will kill you tomorrow, idiot"
        }
    }

    response = client.post(
        f'/sort_filter_messages/{modelo_c}/{valor_sort_filter}',
        json=messages_model,
        cookies={"session_id": "un_id_sesion_cualquiera"}
    )
    
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, dict)
    assert len(json_response) == 2


def test_cardiffnlp_model():
    modelo_c = 'twitter'  
    valor_sort_filter = '50'  

    messages_model =  {
        "messages_model": {
        "1": "i want to kill u",
        "2": "Nice job on the report!",
        "3": "i love you, wanna hang out?",
        "4": "its a beatiful day"
        }
    }

    response = client.post(
        f'/sort_filter_messages/{modelo_c}/{valor_sort_filter}',
        json=messages_model,
        cookies={"session_id": "un_id_sesion_cualquiera"}
    )
    
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, dict)
    assert len(json_response) == 1



def test_martin_toxic_model():
    modelo_c = 'martin-toxic'  
    valor_sort_filter = '50'  

    messages_model =  {
        "messages_model": {
        "1": "you are a piece of shit",
        "2": "Nice job on the report!",
        "3": "i love you, wanna hang out?",
        }
    }
    response = client.post(
        f'/sort_filter_messages/{modelo_c}/{valor_sort_filter}',
        json=messages_model,
        cookies={"session_id": "un_id_sesion_cualquiera"}
    )
    
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, dict)
    assert len(json_response) == 1


def test_jonatan_spanish_model():
    modelo_c = 'jonatan-spanish'  
    valor_sort_filter = '50'  

    messages_model =  {
        "messages_model": {
        "1": "te quiero mucho",
        "2": "me das asco, pezado de basura",
        "3": "te deseo lo mejor para estas navidades",
        "4": "¿por qué eres tan imbécil?"
        }
    }
    response = client.post(
        f'/sort_filter_messages/{modelo_c}/{valor_sort_filter}',
        json=messages_model,
        cookies={"session_id": "un_id_sesion_cualquiera"}
    )
    
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, dict)
    assert len(json_response) == 2



def test_emotions_model():
    valor_sort_filter = 'surprise'
    modelo_c = 'emotions'
    messages_model =  {
        "messages_model": {
        "1": "im really agressive, i wanna kill someone",
        "2": "Oh wow. I didn't know that."
        }
    }


    response = client.post(
        f'/sort_filter_messages/{modelo_c}/{valor_sort_filter}',
        json=messages_model,
        cookies={"session_id": "un_id_sesion_cualquiera"}
    )
    
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, dict)
    assert len(json_response) == 1


def test_groq_model():
    valor_sort_filter = '2'
    messages_model =  {
        "messages_model": {
        "1": "you are a piece of shit",
        "2": "Nice job on the report!",
        "3": "i love you, wanna hang out?",
        }
    }

    response = client.post(
        f'/groq_filter_messages/{valor_sort_filter}',
        json=messages_model,
        cookies={"session_id": "un_id_sesion_cualquiera"}
    )
    
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, dict)
