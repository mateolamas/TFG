# service/user_service.py
from fastapi import HTTPException
import repository
import uuid
from fastapi.responses import JSONResponse
from classificationModels import sort_filter_messages_model
from groqModel import groq_message_model

async def sign_up_user(user):
    if repository.check_user_exists(user.username, user.email):
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    return repository.create_user(user)

async def get_auth_api():
    reddit = repository.create_temp_instance()

    scopes = ['identity', 'modcontributors', 'modposts','mysubreddits','read','report']
    state = '...'
    auth_url = reddit.auth.url(scopes, state, 'permanent')

    return JSONResponse(content=auth_url)


async def create_reddit_instance(request, code):
    reddit = repository.create_temp_instance()

    token = reddit.auth.authorize(code)
    session_id = request.cookies.get("session_id")

    if not session_id:
        HTTPException(status_code=401, detail="No está autenticado")

    repository.update_token(session_id, token, reddit)
    return {"message": "Instancia creada"}


async def login_user(username, password):
    repository.check_user_login(username, password)
    session_id = str(uuid.uuid4())
    repository.update_user_session_id(username, session_id)
    return {"message": "Inicio de sesión exitoso", "session_id": session_id}


async def logout_user(request):
    session_id = request.cookies.get("session_id")

    if not session_id:
        raise HTTPException(status_code=401, detail="No se proporcionó el id de sesión de autorización")
    
    repository.delete_user_session(session_id)

    return None


async def get_profile(request):
    reddit = repository.reddit_utils.auth_user(request)

    username, moderator_subreddits = repository.get_user_and_subreddits(reddit)

    response_data = {
        "username": str(username),
        "moderator_subreddits": moderator_subreddits
    }

    return JSONResponse(content=response_data)

async def get_subreddit_posts(subreddit_name, request):
    reddit = repository.reddit_utils.auth_user(request)

    posts = repository.get_subreddit_posts(reddit, subreddit_name)

    return JSONResponse(content=posts)

async def get_subreddit_post_messages(post_id, request):
    reddit = repository.reddit_utils.auth_user(request)

    messages_dict = repository.get_subreddit_post_messages(reddit, post_id)

    return JSONResponse(content=messages_dict)


async def approve_message(request, messageId):
    reddit = repository.reddit_utils.auth_user(request)
    data = repository.approve_message(reddit, messageId)
    return JSONResponse(content=data)


async def deny_message(request, messageId):
    reddit = repository.reddit_utils.auth_user(request)
    data = repository.deny_message(reddit, messageId)
    return JSONResponse(content=data)

async def ban_user(request, userId, postId):
    reddit = repository.reddit_utils.auth_user(request)
    return repository.ban_user(reddit, userId, postId)
     
async def sort_filter_messages_service(modelo_c, valor_sort_filter, request, messages_model):
    repository.reddit_utils.auth_user(request)
    messages_model_filtered =  sort_filter_messages_model(modelo_c, valor_sort_filter, messages_model)
    return JSONResponse(content=messages_model_filtered)

async def groq_filter_messages_service(valor_sort_filter, request, messages_model):
    repository.reddit_utils.auth_user(request)
    messages_model_filtered = groq_message_model(valor_sort_filter, messages_model)
    return JSONResponse(content=messages_model_filtered)
