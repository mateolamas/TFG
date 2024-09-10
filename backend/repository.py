from fastapi import HTTPException
from pymongo import MongoClient
from hashlib import sha256
from datetime import datetime
import os
import praw
import uuid
from dotenv import load_dotenv
import reddit_utils


load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client['Cluster-TFG']



#funciones reddit_utils

def refresh_reddit_instance(refresh_token, session_id):
    reddit = praw.Reddit(
        client_id=os.getenv("CLIENT_ID"),
        client_secret=os.getenv("CLIENT_SECRET"),
        user_agent=os.getenv("USER_AGENT"),
        refresh_token=refresh_token,
        check_for_async=False
    )
    reddit_utils.update_instances(session_id, reddit)
    return reddit

def get_reddit_instance(session_id):
    user = db.users.find_one({"id_session": session_id})
    reddit = refresh_reddit_instance(user.get("instance_token"), session_id)

    return reddit
    

def check_user_exists(username, email):
    return db.users.find_one({"username": username}) or db.users.find_one({"email": email})

def create_user(user):
    session_id = str(uuid.uuid4())
    user_DB = user.model_dump(exclude_unset=True)
    user_DB['password'] = sha256(user.password.encode()).hexdigest()
    user_DB['id_session'] = session_id
    user_DB['instance_token'] = None
    db.users.insert_one(user_DB)
    return {"message": "Usuario registrado exitosamente", "session_id": session_id}


def create_temp_instance():
    reddit = praw.Reddit(
        client_id= os.getenv("CLIENT_ID"),
        client_secret= os.getenv("CLIENT_SECRET"),
        user_agent= os.getenv("USER_AGENT"),
        redirect_uri= os.getenv("REDIRECT_URI"),
        check_for_async=False
    )

    return reddit
    

def update_token(session_id, token, reddit):    
    db.users.update_one(
        {"id_session": session_id},
        {"$set": {"instance_token": token}}
    )

    reddit_utils.update_instances(session_id, reddit)
    


def check_user_login(username, password):
    user = db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    stored_password = user.get("password")
    hashed_password = sha256(password.encode()).hexdigest()
    
    if stored_password != hashed_password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")


def update_user_session_id(username, session_id):
    db.users.update_one({"username": username}, {"$set": {"id_session": session_id}})


def delete_user_session(session_id):
    reddit_utils.delete_instance(session_id)
    db.users.update_one(
        {"id_session": session_id},
        {"$set": {"id_session": None}}
    )
    
    
def get_user_and_subreddits(reddit):
    username = reddit.user.me()
    moderator_subreddits = [subreddit.display_name for subreddit in reddit.user.moderator_subreddits(limit=None)]
    
    return username, moderator_subreddits


def get_subreddit_posts(reddit, subreddit_name):
    subreddit = reddit.subreddit(subreddit_name)

    posts = []

    for submission in subreddit.new(limit=None):
        post = {
            'id': submission.id,
            'title': submission.title,
            'author': str(submission.author),
            'num_comments' : submission.num_comments,
            'created_utc' : str(datetime.fromtimestamp(submission.created_utc)),
            'content': submission.selftext,
            'url': submission.url
        }
        posts.append(post)
    
    return posts

def get_subreddit_users(reddit, post_id):

    submission = reddit.submission(id=post_id)

    # Obtén el objeto Subreddit
    subreddit = submission.subreddit

    # Obtén la lista de baneos
    banned_users = set()
    for ban in subreddit.banned(limit=None): 
        banned_users.add(ban.name)

    print('Usuarios baneados:', banned_users)

    return banned_users


def get_subreddit_post_messages(reddit, post_id):
    post = reddit.submission(id=post_id)

    # Crear un diccionario para guardar los comentarios
    messages_dict = {}

    # buscar usuarios baneados del subreddit con el post_id
    banned_users = get_subreddit_users(reddit, post_id)

    # Iterar sobre todos los comentarios del post
    post.comments.replace_more(limit=None)
    for comment in post.comments.list():
        messages_dict[comment.id] = {
            'author': comment.author.name if comment.author else '[deleted]',
            'body': comment.body,
            'created_utc': str(datetime.fromtimestamp(comment.created_utc).strftime('%d/%m/%Y %H:%M')),
            'created_compare' : comment.created_utc,
            'ups': comment.ups,
            'downs': comment.downs,
            'permalink': str('https://reddit.com' + comment.permalink),
            'author_is_banned': "yes" if comment.author.name in banned_users else "no",
            'id': comment.id,
            'approved': 'yes' if comment.approved else 'no',
            'approved_at_utc': str(datetime.fromtimestamp(comment.approved_at_utc).strftime('%d/%m/%Y %H:%M')) if comment.approved_at_utc else None,
            'approved_by': comment.approved_by,
            'banned_by': comment.banned_by,
            'mod_reason_by' : comment.mod_reason_by,
            'mod_reason_title' : comment.mod_reason_title,
            'spam': 'yes' if comment.spam else 'no',
            'banned_at_utc': str(datetime.fromtimestamp(comment.banned_at_utc).strftime('%d/%m/%Y %H:%M')) if comment.banned_at_utc else None,
            'removal_reason': comment.removal_reason,
            'mod_reports': comment.mod_reports,
            'num_reports': comment.num_reports,
            'locked': 'yes' if comment.locked else 'no'

        }

        if 'ban_note' in vars(comment):
            messages_dict[comment.id]['ban_note'] = comment.ban_note
        else:
            messages_dict[comment.id]['ban_note'] = None
    
    return messages_dict 


def approve_message(reddit, messageId):
    # Obtén el comentario utilizando el ID
    comment = reddit.comment(messageId)
    # Aprobar el comentario
    comment.mod.approve()

    data = {
        "user_aprobador": comment.approved_by,
        "hora_aprobado": str(datetime.fromtimestamp(comment.approved_at_utc).strftime('%d/%m/%Y %H:%M'))
    }

    return data


def deny_message(reddit, messageId):
    # Obtén el comentario utilizando el ID
    comment = reddit.comment(messageId)
    # Denegar el comentario
    comment.mod.remove()

    data = {
        "user_denegador": comment.banned_by,
        "hora_denegado": str(datetime.fromtimestamp(comment.banned_at_utc).strftime('%d/%m/%Y %H:%M'))
    }

    return data

def ban_user(reddit, userId, postId):
    # usamos el id(postId) para obtener el subreddit
    submission = reddit.submission(id=postId)
    subreddit = submission.subreddit

    # Bannear al usuario a partir del subreddit y el userId
    subreddit.banned.add(userId, ban_reason='Baneado por MODIT')
