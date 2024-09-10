from fastapi import FastAPI, HTTPException, Request, Body

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
import os
from model import User
import service 
from typing import Dict

# Crea una instancia de FastAPI
app = FastAPI()

origin = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  
    allow_headers=["*"],
)

@app.post("/sign_up")
async def sign_up(user: User):
    return await service.sign_up_user(user)

# obtener URL de autorizacion
@app.get("/auth_api")
async def auth_api():
    return await service.get_auth_api()
     

# Ruta de redirección después de la autorización
@app.post('/create_instance')
async def create_instance(request: Request, code: str = Body(..., embed=True)):
    return await service.create_reddit_instance(request, code)
   
@app.post("/log_in")
async def log_in(username: str = Body(..., embed=True), password: str = Body(..., embed=True)):
    return await service.login_user(username, password)

@app.get("/log_out")
async def log_out(request: Request):
    return await service.logout_user(request)

@app.get('/profile/', response_class=HTMLResponse)
async def profile(request: Request):
    return await service.get_profile(request)

@app.get('/subreddit_posts/{subreddit_name}', response_class=HTMLResponse)
async def subreddit_posts(subreddit_name, request: Request):
    return await service.get_subreddit_posts(subreddit_name, request)

@app.get('/subreddit_post_messages/{post_id}', response_class=HTMLResponse)
async def subreddit_post_messages(post_id, request: Request):
    return await service.get_subreddit_post_messages(post_id, request)

@app.post('/approve_message/', response_class=HTMLResponse)
async def approve_message(request: Request, messageId: str = Body(..., embed=True)):
    return await service.approve_message(request, messageId)

@app.post('/deny_message/', response_class=HTMLResponse)
async def deny_message(request: Request, messageId: str = Body(..., embed=True)):
    return await service.deny_message(request, messageId)

@app.post('/ban_user/', response_class=HTMLResponse)
async def ban_user(request: Request, userId: str = Body(..., embed=True), postId: str = Body(..., embed=True)):
    return await service.ban_user(request, userId, postId)

@app.post('/sort_filter_messages/{modelo_c}/{valor_sort_filter}', response_class=HTMLResponse)
async def sort_filter_messages(modelo_c, valor_sort_filter, request: Request, messages_model: Dict[str, str] = Body(..., embed=True)):
    return await service.sort_filter_messages_service(modelo_c, valor_sort_filter, request, messages_model)

@app.post('/groq_filter_messages/{valor_sort_filter}', response_class=HTMLResponse)
async def groq_filter_messages(valor_sort_filter, request: Request, messages_model: Dict[str, str] = Body(..., embed=True)):
    return await service.groq_filter_messages_service(valor_sort_filter, request, messages_model)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("API_PORT")))
