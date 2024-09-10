import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

function SignUpPage() {

  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [serverResponse, setServerResponse] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/sign_up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setServerResponse(data.message);
        const cookies = new Cookies();
        cookies.set('session_id', data.session_id, { path: '/', domain: 'localhost' });
        navigate('/authapi');
      } else if (response.status === 400) {
        setServerResponse('El nombre de usuario y/o correo electrónico ya están en uso');
      } else if (response.status === 422) {
        setServerResponse('Formato incorrecto');
      } else {
        setServerResponse('Error al enviar la solicitud');
      }
    } catch (error) {
      setServerResponse('Error al enviar la solicitud');
    }
  };

  return (
    <div id="page-top">
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
      <div className="container px-5">
        <a className="navbar-brand" href="/">MODIT</a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${menuVisible ? 'show' : ''}`} id="navbarResponsive">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/signup" className="nav-link">Registrarse</Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-link">Iniciar sesión</Link>
            </li>
          </ul>
        </div>
      </div>
      </nav>

      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="col-md-5">
          <div className="card shadow p-3">
            <h2 className="text-center mb-4">Regístrate en MODIT</h2>
            <div className="container d-flex justify-content-center">
              <div className="col-md-7">
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="username">Usuario:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      pattern=".{4,12}"
                      title="El nombre de usuario debe tener entre 4 y 12 caracteres"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      title="El formato del correo electrónico es inválido"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="password">Contraseña:</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                      title="La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y tener al menos 8 caracteres"
                      required
                    />
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn btn-secondary btn-xl rounded-pill mt-4">Registrarse</button>
                  </div>
                  
                  <div className="text-center mt-5 card shadow p-3">
                    <p>A continuación será redirigido a Reddit para conceder permisos a Modit para que podamos acceder a tu cuenta</p>
                  </div>
                </form>
              </div>
            </div>
            {serverResponse && <p className="mt-3 text-center">{serverResponse}</p>}
          </div>
        </div>
      </div>      
      <footer className="py-5 bg-black">
        <div className="container px-5"><p className="m-0 text-center text-white small">MODIT - TFG Mateo Lamas</p></div>
        <div className="container px-5"><p className="m-0 text-center text-white small">mateo.lamas@udc.es</p></div>
        <div className="container px-5"><p className="m-0 text-center text-white small">https://github.com/mateolamas</p></div>
        <div className="container px-5"><p className="m-0 text-center text-white small">www.linkedin.com/in/mateo-lamas</p></div>
      </footer>
    </div>

    );
  }

export default SignUpPage;
