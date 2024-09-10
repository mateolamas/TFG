# TFG


El objetivo de este TFG es el análisis, diseño e implementación de una aplicación web que utiliza modelos de clasificación para agilizar y mejorar la eficiencia de la moderación de comentarios en la plataforma Reddit. Los modelos permiten identificar contenido inapropiado o comportamientos disruptivos, ayudando al usuario de este proyecto a regular sus foros. Este proyecto no pretende sustituír al resto de herramientas actualmente existentes, sino complementar las acciones de moderación de una manera sencilla y rápida para la persona moderadora. Los objetivos concretos son los siguientes:
- Crear un sistema de usuarios que permita iniciar sesión y registrarse de manera que los usuarios puedan vincular su cuenta de Reddit entre ambas plataformas.
- Agrupar todos los subreddit que el usuario modera.
- Visualizar y permitir el acceso a los posts de esos subreddits.
- Acceder a los posts y visualizar todos los comentario y su estado.
- Aceptar o denegar comentarios de manera instantánea.
- Filtrar y ordenar comentarios usando un modelo de clasificación de los disponibles elegido por el propio usuario.
- Banear usuarios de un subreddit.

Para ejecutar este proyecto se debe cubrir el fichero env_example con las claves de las APIS necesarias (Reddit, MongoDB, Groq, puerto en el que se ejecuta la API...). Una vez hecho esto, para arrancar la aplicación debemos:

- Situarnos en el directorio **backend** y ejecutar para arrancar el servidor FastAPI:
~~~
python3 main.py
~~~
- Situarnos en el directorio **frontend** y ejecutar para arrancar el cliente React:
~~~
npm start
~~~
