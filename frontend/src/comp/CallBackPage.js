import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

function CallBackPage() {

  const { search } = useLocation(); // Desestructuración de location
  const cookies = new Cookies();
  const sessionId = cookies.get('session_id');

  const searchParams = new URLSearchParams(search); // Usar search en lugar de location.search

  const code = searchParams.get('code');

  const createInstance = async () => {
    try {
      console.log('-----------')
      console.log(sessionId);
      console.log('-----------')

      const response = await fetch('http://localhost:3001/create_instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }) 
      });
      if (response.ok) {
        console.log('Instancia creada con éxito');
      } else {
        console.error('Error al crear la instancia');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  createInstance();

  return (
    <div id="page-top">
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
        <div className="container px-5">
          <a className="navbar-brand" href="/">MODIT</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Cerrar sesión</Link>
            </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <div className="container" style={{ marginTop: '7rem' }}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow p-4">
              <div className="card-body text-center">
                <h4 className="card-title">La autorización ha sido exitosa</h4>
                <Link to="/profile" className="btn btn-secondary btn-xl rounded-pill mt-4">Ver mi perfil</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default CallBackPage;