import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { ClipLoader } from 'react-spinners';

function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [selectedSubredditData, setSelectedSubredditData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading_spinner_big, setLoading_spinner_big] = useState(true);
  const [loading_spinner_small, setLoading_spinner_small] = useState(false);
  

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    const cookies = new Cookies();
    const sessionId = cookies.get('session_id'); 

    if (sessionId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    // Realizar la solicitud al backend para obtener los datos del usuario(nombre usuario y sus subreddits)
    fetch('http://localhost:3001/profile', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        setLoading_spinner_big(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading_spinner_big(false);
      });
  }, []);

  const getPosts = (event) => {
    const selectedSubreddit = event.target.value;
    setLoading_spinner_small(true);
    // Realizar la solicitud al backend para obtener los posts del subreddit seleccionado
    fetch(`http://localhost:3001/subreddit_posts/${selectedSubreddit}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setSelectedSubredditData(data);
        setLoading_spinner_small(false);
      })
      .catch(error => {
        console.error('Error fetching subreddit data:', error);
        setLoading_spinner_small(false);
      });
  };

  return (
    <div>
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

      {loading_spinner_big && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <ClipLoader color="#FFA500" loading={true} size={150} />
        </div>
      )}

      {userData && (
        <header className="text-center mb-2 mt-5" style={{ padding: '40px' }}>
          <h1 id="masthead-heading">Bienvenido {userData.username}</h1> 
        </header>
      )}
      
      {userData && (
        <div className="text-center"> 
          <p className="text-center">Selecciona un subreddit de los que eres moderador:</p>
          <div className="d-flex justify-content-center">
            <div className="input-group w-50">
              <select className="form-select" onChange={getPosts}>
                <option value="">
                  Selecciona un subreddit 
                </option>
                {userData.moderator_subreddits.map((subreddit, index) => (
                  <option key={index} value={subreddit}>
                    {subreddit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading_spinner_small && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <ClipLoader color="#FFA500" loading={true} size={75} />
            </div>
          )}

          {selectedSubredditData && selectedSubredditData.length < 1 && !loading_spinner_small && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <p>No hay posts en este subreddit</p>
            </div>
          )}

          {selectedSubredditData && selectedSubredditData.length > 0 && !loading_spinner_small && (
            <div className="container mt-4">
              {selectedSubredditData.map((post, index) => {
                const encodedTitle = encodeURIComponent(post.title);
                return (
                  <NavLink key={index} to={`/post/${post.id}&${encodedTitle}`} className="card mb-4" 
                  style={{
                    borderRadius: '5px',
                    marginBottom: '1rem',
                    textDecoration: 'none',
                  }}>
                    <div className="card-body">
                      <h5 className="card-title">{post.title}</h5>
                      <p className="card-text">Autor: {post.author}</p>
                      <p className="card-text">Número de comentarios: {post.num_comments}</p>
                      <p className="card-text">Hora creación: {post.created_utc}</p>
                      {post.content && (
                        <p className="card-text">Descripción: {post.content}</p>
                      )}
                      <a href={post.url} className="card-link">Enlace a Reddit</a>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
