import praw
from fastapi import HTTPException
import os
import repository

reddit_instances = {}

def update_instances(session_id, reddit):
    reddit_instances[session_id] = reddit

def delete_instance(session_id):
    if session_id in reddit_instances:
        del reddit_instances[session_id]


def auth_user(request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="No se proporcionó el id de sesión de autorización")
    
    if session_id in reddit_instances:
        reddit = reddit_instances[session_id]
    else:
        reddit = repository.get_reddit_instance(session_id)
    try:
        reddit.user.me()
    except:
        raise HTTPException(status_code=401, detail="Sesión no válida")
    
    return reddit
