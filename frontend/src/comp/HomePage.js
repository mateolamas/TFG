import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

const HomePage = React.memo(() => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    // Verificar si existe la cookie 'sessionId'

    const cookies = new Cookies();
    const sessionId = cookies.get('session_id'); 

    if (sessionId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);


  const headerStyle = {
    backgroundImage: `url(${require('./img/difuminada.jpg')})`, 
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    padding: '235px 0', 
    color: 'white',
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
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link">Mi perfil</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/logout" className="nav-link">Cerrar sesión</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/signup" className="nav-link">Registrarse</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">Iniciar sesión</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <header className="masthead text-center text-white" style={headerStyle}>
        <div className="masthead-content">
          <div className="container px-5">
            <h1 id="masthead-heading" className="masthead-heading mt-2 mb-4 display-4" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)'}}>MODIT</h1> 
            <h2 id="masthead-subheading" className="masthead-subheading mb-0 display-4" style={{ color: 'white'}}>Modera cómodamente tus foros de Reddit</h2> 
            <a className="btn btn-secondary btn-xl rounded-pill mt-5" href="#scroll">Saber más</a>
          </div>
        </div>
      </header>
      <section id="scroll">
        <div className="container px-5">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-6 order-lg-2">
              <div className="p-5"><img className="img-fluid rounded-circle" src={require('./img/p1.jpeg')} alt="..." /></div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="p-5">
                <h2 className="display-4 justificado">El desafío de la Moderación de las RRSS</h2>
                <p className="justificado">En un mundo interconectado, las redes sociales como Reddit son vitales para el intercambio de ideas, pero enfrentan el desafío de los comentarios tóxicos. Los moderadores son clave para mantener el orden y la cordialidad, aunque manejar el alto volumen de publicaciones es difícil sin herramientas adecuadas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container px-5">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-6">
              <div className="p-5"><img className="img-fluid rounded-circle" src={require('./img/p2.jpeg')} alt="..." /></div>
            </div>
            <div className="col-lg-6">
              <div className="p-5">
                <h2 className="display-4 justificado">!Eres bienvenido!</h2>
                <p className="justificado"> Si eres moderador de algún subreddit con un gran volumen de comentarios, esta página es para ti. Haciendo uso de diversos modelos de clasificación podrás hacer de la labor de moderación algo mucho más cómodo, eficaz y rápido</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container px-5">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-6 order-lg-2">
              <div className="p-5"><img className="img-fluid rounded-circle" src={require('./img/fondo-2.jpg')} alt="..." /></div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="p-5">
                <h2 className="display-4 justificado mb-3">Empieza ya mismo</h2>
                <p className="justificado">Presiona el botón REGISTRARSE de arriba a la derecha, podrás crear una cuenta en MODIT y vincularla con tu cuenta de Reddit y eso sería todo. ¡A moderar esos foros! </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-5 bg-black">
        <div className="container px-5"><p className="m-0 text-center text-white small">MODIT - TFG Mateo Lamas</p></div>
      </footer>
    </div>
  );
});

export default HomePage;
