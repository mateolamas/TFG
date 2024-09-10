import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


function LoginPage() {

  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const [serverResponse, setServerResponse] = useState(''); 


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/log_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        const cookies = new Cookies();
        cookies.set('session_id', data.session_id, { path: '/', domain: 'localhost' }); // Guardar el session_id en una cookie con Universal Cookie

        setServerResponse(data.message);
        navigate('/profile');
      } else {
        await response.json(); // Si hay un error, tratamos de leer el mensaje de error del servidor
        setServerResponse('Credenciales incorrectas'); // Establecer la respuesta de error en el estado para mostrarla en la interfaz
      }
    } catch (error) {
      setServerResponse('Error de red'); 
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
            <h2 className="text-center mb-4">Inicia sesión en MODIT</h2>
            <div className="container d-flex justify-content-center">
              <div className="col-md-7">
                <form onSubmit={handleLogin}>
                  <div className="form-group mb-3">
                    <label htmlFor="username">Nombre de usuario:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
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
                      required
                    />
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn btn-secondary btn-xl rounded-pill mt-4">Iniciar sesión</button>
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

export default LoginPage;
