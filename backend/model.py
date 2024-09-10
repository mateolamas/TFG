from pydantic import BaseModel, constr, field_validator
import re

class User(BaseModel):
    username: constr(min_length=4, max_length=12)
    email: str
    password: constr(min_length=8)

    @field_validator("*")
    def no_whitespace(cls, v):
        if isinstance(v, str) and " " in v:
            raise ValueError("El valor no puede contener espacios en blanco")
        return v
    

    @field_validator("username")
    def username_length(cls, v):
        if len(v) < 4:
            raise ValueError("El nombre de usuario debe tener al menos 4 caracteres")
        if not re.match(r'^[a-zA-Z0-9\.\-_]+$', v):
            raise ValueError("El nombre de usuario solo puede contener letras, números, '.', '-' y '_'")
        return v
    

    @field_validator("email")
    def email_formatd(cls, v):
        pattern = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
        if not re.match(pattern, v):
            raise ValueError("El formato del correo electrónico es inválido")
        return v
    
    @field_validator("password")
    def password_complexity(cls, v):
        # al menos una minúscula, una mayúscula y un número en la contraseña
        if not any(c.islower() for c in v):
            raise ValueError("La contraseña debe contener al menos una letra minúscula")
        if not any(c.isupper() for c in v):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v

