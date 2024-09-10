import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faLink, faCircleCheck, faCircleXmark, faUser, faCircleInfo, faArrowLeft, faThumbTack, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import Popover from './Popover';
import { ClipLoader } from 'react-spinners';


function PostMessages() {
  const { idAndTitle } = useParams();
  const [id, encodedTitle] = idAndTitle.split(/&(.*)/).filter(Boolean);
  const title = decodeURIComponent(encodedTitle);
  
  // todos los mensajes del subreddit
  const [messages, setMessages] = useState(null);
  // backup de mensajes usado al usar los modelos
  const [messagesBackUp, setmessagesBackUp] = useState(null);
  
  // filtro de aprobado,denegado... y ordenamiento más antiguos, más gustados...
  const [filter, setFilter] = useState({ status: 'all', sortBy: 'default', sortModelBy: '-'});

  // selección del modelo a usar
  const [selectedFirstOption, setSelectedFirstOption] = useState('');
  // selección del tipo de filtrado a usar
  const [selectedSecondOption, setSelectedSecondOption] = useState('-');
  // opciones de filtrado para cada modelo
  const [secondOptions, setSecondOptions] = useState([]);

  const [firstOptionGlobal, setfirstOptionGlobal] = useState(null);

  // paginación de mensajes
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10); // Número de mensajes por página

  const [loading_spinner, setLoading_spinner] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);


  useEffect(() => {
    //peticion para cargar mensajes de ese subreddit

    const fetchPostData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/subreddit_post_messages/${id}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('No se pudo obtener los datos');
        }
        const data = await response.json();
        setMessages(data);
        setmessagesBackUp(data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchPostData();
  }, [id]);

  // actualizar estado en React (no en backend) del mensaje a aceptado o denegado
  const updateMessageStatus = (messageId, action, message) => {
    setMessages(prevMessages => {
      return {
        ...prevMessages,
        [messageId]: {
          ...prevMessages[messageId],
          approved: action === 'approve' ? 'yes' : 'no',
          ban_note: action === 'deny' ? 'remove not spam' : '',
          approved_by: message.user_aprobador,
          approved_at_utc: message.hora_aprobado,
          banned_by: message.user_denegador,
          banned_at_utc: message.hora_denegado
        }
      };
    });
  };

  // peticion al backend para aceptar un mensaje
  const approveMessage = async (messageId) => {
    try {
      const response = await fetch('http://localhost:3001/approve_message/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });

      if (!response.ok) {
        throw new Error('Error en la petición');
      }
      const data = await response.json();
      updateMessageStatus(messageId, 'approve', data);
    } catch (error) {
      console.error(error);
    }
  }; 

  // peticion al backend para banear un usuario del subreddit
  const denyMessage = async (messageId) => {
    try {
      const response = await fetch('http://localhost:3001/deny_message/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId})
      });

      if (!response.ok) {
        throw new Error('Error en la petición');
      }
      const data = await response.json();
      updateMessageStatus(messageId, 'deny', data);
    } catch (error) {
      console.error(error);
    }
  };

  // peticion al backend para banear un usuario
  const banUser = async (user, messageId) => {
    try {
      const response = await fetch('http://localhost:3001/ban_user/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user, postId: id })
      });

      if (!response.ok) {
        throw new Error('Error en la petición');
      }

      setMessages(prevMessages => {
        // Encontrar los IDs de los mensajes que corresponden al usuario
        const messageIdsToBan = Object.keys(prevMessages).filter(id => prevMessages[id].author === user);
        console.log(messageIdsToBan)
        // Actualizar esos mensajes en el estado
        const updatedMessages = { ...prevMessages };
        messageIdsToBan.forEach(id => {
          updatedMessages[id].author_is_banned = "yes";
        });
        
        return updatedMessages;
      }); 

      const data = await response.json();
     
    } catch (error) {
      console.error(error);
    }
  };

  // ejecutado cuando el usuario selecciona un modelo 
  // establecemos las opciones de filtrado para cada modelo
  const handleFirstDropdownChange = (event) => {
    const value = event.target.value;
    setSelectedFirstOption(value);

    if (value === 'multilingual') {
      setSecondOptions([
        'Mostrar valores para todos los comentarios',
        'Filtrar valor negativo > 90%',
        'Filtrar valor negativo > 75%',
        'Filtrar valor negativo > 50%',
        'Filtrar valor negativo > 25%',
        'Filtrar valor negativo > 15%'
      ]);
    } else if (value === 'twitter') {
      setSecondOptions([
        'Mostrar valores para todos los comentarios',
        'Filtrar valor negativo > 90%',
        'Filtrar valor negativo > 75%',
        'Filtrar valor negativo > 50%',
        'Filtrar valor negativo > 25%',
        'Filtrar valor negativo > 15%'
      ]);
    } else if (value === 'martin-toxic') {
      setSecondOptions([
        'Mostrar valores para todos los comentarios',
        'Filtrar valor tóxico > 90%',
        'Filtrar valor tóxico > 75%',
        'Filtrar valor tóxico > 50%',
        'Filtrar valor tóxico > 25%',
        'Filtrar valor tóxico > 15%'
      ]);
    } else if (value === 'jonatan-spanish') {
      setSecondOptions([
        'Mostrar valores para todos los comentarios',
        'Filtrar valor bullying > 90%',
        'Filtrar valor bullying > 75%',
        'Filtrar valor bullying > 50%',
        'Filtrar valor bullying > 25%',
        'Filtrar valor bullying > 15%'
      ]);
    } else if (value === 'emotions') {
      setSecondOptions([
        'Filtrar mensajes con ira🤬',
        'Filtrar mensajes con asco🤢',
        'Filtrar mensajes con miedo😨',
        'Filtrar mensajes con alegría😀',
        'Filtrar mensajes con neutral😐',
        'Filtrar mensajes con tristeza😭',
        'Filtrar mensajes con sorpresa😲',
      ]);
    }else if (value === 'groq') {
      setSecondOptions([
        'Filtrar mensajes muy tóxicos',
        'Filtrar mensajes tóxicos',
        'Filtrar mensajes un poco tóxicos',
        'Filtrar mensajes no tóxicos',
      ]);
    }
  };

  // ejecutado cuando el usuario selecciona un tipo de filtrado
  // con el modelo de clasificacion seleccionado
  const handleSecondDropdownChange = async (event) => {

    setCurrentPage(1)
    const secondOption = event.target.value;
    setSelectedSecondOption(secondOption);

    if(secondOption !== undefined && secondOption !== '-'){
      filter_sort_model(selectedFirstOption, secondOption);
    }else{
      //actualizar mensajes(por si hemos modificado algun mensaje(aceptar o denegar por ejemplo))
      const response = await fetch(`http://localhost:3001/subreddit_post_messages/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener los datos');
      }
      const data = await response.json();
      setMessages(data);
      setmessagesBackUp(data);
    }

  };

  // peticion al backend para ejecutar el modelo seleccionado con la opcion
  // de filtrado seleccionado sobre los mensajes
  const filter_sort_model = async (firstOption, secondOption) => {
    try {

      // queremos enviar solo idMessage con el body
      const messages_model = Object.entries(messagesBackUp).reduce((acc, [key, value]) => {
        acc[key] =value.body;
        return acc;
      }, {});

      let secondOptionUrl = '';

      if (firstOption === "multilingual" || firstOption === "twitter" 
        || firstOption === "martin-toxic" || firstOption === "jonatan-spanish"){
        switch(true){
          case secondOption.includes("90"):
            secondOptionUrl = '90';
            break;
          case secondOption.includes("75"):
            secondOptionUrl = '75';
            break;
          case secondOption.includes("50"):
            secondOptionUrl = '50';
            break;
          case secondOption.includes("25"):
            secondOptionUrl = '25';
            break;
          case secondOption.includes("15"):
            secondOptionUrl = '15';
            break;
          default:
            secondOptionUrl = '0';
            break;
        }
      } else if (firstOption === "emotions"){
        console.log(secondOption);
        switch(true){
          case secondOption.includes("ira"):
            secondOptionUrl = 'anger';
            break;
          case secondOption.includes("asco"):
            secondOptionUrl = 'disgust';
            break;
          case secondOption.includes("miedo"):
            secondOptionUrl = 'fear';
            break;
          case secondOption.includes("alegria"):
            secondOptionUrl = 'joy';
            break;
          case secondOption.includes("neutral"):
            secondOptionUrl = 'neutral';
            break;
          case secondOption.includes("tristeza"):
            secondOptionUrl = 'sadness';
            break;
          case secondOption.includes("sorpresa"):
            secondOptionUrl = 'surprise';
            break;
          default:
            secondOptionUrl = '0';
            break;
        }
      } else if (firstOption === "groq"){
        switch(true){
          case secondOption.includes("muy tóxicos"):
            secondOptionUrl = '3';
            break;
          case secondOption.includes("mensajes tóxicos"):
            secondOptionUrl = '2';
            break;
          case secondOption.includes("poco tóxicos"):
            secondOptionUrl = '1';
            break;
          case secondOption.includes("no tóxicos"):
            secondOptionUrl = '0';
            break;
          default:
            secondOptionUrl = '-1';
            break;
        }
        console.log(secondOptionUrl)
      } else{
        // otros modelos con otras opciones
      }
      setLoading_spinner(true);

      let url = '';

      if (firstOption === "groq"){
        url = 'http://localhost:3001/groq_filter_messages/' + secondOptionUrl;
      } else{
        url = 'http://localhost:3001/sort_filter_messages/' + firstOption + '/' + secondOptionUrl;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages_model })
      });

      if (!response.ok) {
        throw new Error('Error en la petición');
      }
      const data = await response.json();

      // Filtrar los mensajes que han sido actualizados con los nuevos valores
      const filteredMessagesToUpdate = Object.entries(data).reduce((acc, [key, value]) => {
        if (value.Positivo !== undefined || value.Neutral !== undefined || value.Negativo !== undefined) {
          acc[key] = {
            ...messagesBackUp[key],
            positive: value.Positivo,
            neutral: value.Neutral,
            negative: value.Negativo
          };
        } else if (value.toxic !== undefined || value.non_toxic !== undefined) {
          acc[key] = {
            ...messagesBackUp[key],
            toxico: value.toxic,
            non_toxico: value.non_toxic,
          };
        } else if (value.bullying !== undefined || value.not_bullying !== undefined) {
          acc[key] = {
            ...messagesBackUp[key],
            bullying: value.bullying,
            not_bullying: value.not_bullying,
          };
        } else if (value.emotion !== undefined) {
          acc[key] = {
            ...messagesBackUp[key],
            emotion: value.emotion,
          };
        } else { //LLaMa
          acc[key] = {
            ...messagesBackUp[key],
          };
        }

        return acc;
      }, {});

      setfirstOptionGlobal(firstOption)
      setLoading_spinner(false);
      setMessages(filteredMessagesToUpdate);

    } catch (error) {
      console.error(error);
    }
  };

  const analyzeMessage = (message) => {
    let info = '';

    if (message.author_is_banned === "yes"){
      info += '\u2022 Usuario baneado de este subreddit\n';
    }

    if (message.approved === "yes") {
      info += `\u2022 Mensaje aprobado por ${message.approved_by} a ${message.approved_at_utc}\n`;
    }

    if (message.ban_note === "remove not spam") {
      info += `\u2022 Mensaje borrado `;
      info += `por ${message.banned_by}`;
      info += ` a ${message.banned_at_utc}\n`;

      if (message.removal_reason !== null) {
        info += `\u2022 Razon: ${message.removal_reason}\n`;
      }

      info += `\u2022 Nota: ${message.ban_note}\n`;

      if (message.mod_reason_title !== null) {
        info += `\u2022 mod_reason_title: ${message.mod_reason_title}\n`;
      }

      if (message.mod_reason_by !== null) {
        info += `\u2022 mod_reason_by: ${message.mod_reason_by}\n`;
      }

    }

    if (message.spam === "yes") {
      info += `\u2022 Mensaje con spam `;
      info += `baneado por ${message.banned_by} `;
      info += `a ${message.banned_at_utc}\n`;
      info += `ban_note: ${message.ban_note}\n`;
    }

    if (message.num_reports > 0) {
      info += `\u2022 num_reports: ${message.num_reports}\n`;
      info += `\u2022 mod_reports: ${message.mod_reports}\n`;
    }

    return info;
  };

  const renderizarMensajes = (messageId) => {
    const message = messages[messageId];
    let info = analyzeMessage(message);

    const abrirEnlace = () => {
      window.open(message.permalink, '_blank');
    };

    return (
      <div key={messageId} className="card mb-3 d-flex" style={{ maxWidth: '70%', margin: '0 auto' }}>
        <div className="d-flex justify-content-between">
          <div className="d-flex flex-column mt-1 mb-2" style={{ maxWidth: '70%', overflow: 'auto', overflowWrap: 'normal' }}>
            <div className="d-flex justify-content-start ms-3">
              <h3 className="card-title" style={{ marginBottom: "20px", marginTop: "10px" }}><FontAwesomeIcon icon={faUser} /> {message.author}</h3>
            </div>
            <div className="d-flex justify-content-start ms-3">
              <h6 className="card-text">Mensaje: {message.body}</h6>
            </div>
          </div>

          <div className="flex-column">
            <div className="card-body">
              <div className="d-flex justify-content-end mt-0 ">
                <p>{message.created_utc}</p>
              </div>

              <div className="d-flex justify-content-end mt-0">
                <Popover content={info}>
                  <FontAwesomeIcon icon={faCircleInfo} style={{
                    cursor: 'pointer',
                    fontSize: '30px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                  }} />
                </Popover>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <div style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{
                    marginBottom: '10px',
                    cursor: message.approved === "yes" ? 'default' : 'pointer',
                    pointerEvents: message.approved === "yes" ? 'none' : 'auto'
                  }} onClick={() => approveMessage(messageId)}>
                    <FontAwesomeIcon icon={faCircleCheck} style={{
                      color: message.approved === "yes" ? "gray" : "green",
                      transition: "color 0.5s"
                    }} size="2x" />
                  </div>

                  <div style={{
                    cursor: message.ban_note === "remove not spam" ? 'default' : 'pointer',
                    pointerEvents: message.ban_note === "remove not spam" ? 'none' : 'auto'
                  }} onClick={() => denyMessage(messageId)}>
                    <FontAwesomeIcon icon={faCircleXmark} style={{
                      color: message.ban_note === "remove not spam" ? "gray" : "red",
                      transition: "color 0.75s"
                    }} size="2x" />
                  </div>

                  <div className="d-flex mt-3" style={{
                    cursor: message.author_is_banned === "yes" ? 'default' : 'pointer',
                    pointerEvents: message.author_is_banned === "yes" ? 'none' : 'auto'
                  }} onClick={() => banUser(message.author, messageId)}>
                    <FontAwesomeIcon icon={faUserSlash} style={{
                      color: message.author_is_banned === "yes" ? "gray" : "black",
                      transition: "color 0.75s"
                    }} size="2x" />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3 mb-0">
                <button className="btn btn-link p-0" onClick={abrirEnlace}>
                  <span style={{
                    textDecoration: 'underline', color: 'blue', cursor: 'pointer',
                    marginBottom: '20px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <FontAwesomeIcon icon={faLink} />
                  </span>
                </button>
                <div style={{ marginLeft: "10px" }}>
                  <p className="card-text" style={{ marginBottom: "5px" }}><FontAwesomeIcon icon={faThumbsUp} /> {message.ups}</p>
                  <p className="card-text"><FontAwesomeIcon icon={faThumbsDown} /> {message.downs}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {message.positive !== undefined && ( //mostrar valores del modelo
          <div className="d-flex justify-content-start ms-3 mt-3">
            <p className="card-text" style={{ color:'green'}}>Positivo: {message.positive.toFixed(2)}%</p>
            <p className="card-text ms-3">Neutral: {message.neutral.toFixed(2)}%</p>
            <p className="card-text ms-3" style={{ color:'red'}}>Negativo: {message.negative.toFixed(2)}%</p>
          </div>
        )}
        {message.toxico !== undefined && (
          <div className="d-flex justify-content-start ms-3 mt-3">
            <p className="card-text" style={{ color:'green'}}>No tóxico: {message.non_toxico}%</p>
            <p className="card-text ms-3" style={{ color:'red'}}>Tóxico: {message.toxico}%</p>
          </div>
        )}
        {message.bullying !== undefined && (
          <div className="d-flex justify-content-start ms-3 mt-3">
            <p className="card-text" style={{ color:'green'}}>No bullying: {message.not_bullying}%</p>
            <p className="card-text ms-3" style={{ color:'red'}}>Bullying: {message.bullying}%</p>
          </div>
        )}
        {message.emotion !== undefined && (
          <div className="d-flex justify-content-start ms-3 mt-3">
            <p className="card-text">{message.emotion}%</p>
          </div>
        )}
        {message.locked === "yes" && (
          <div className="d-flex justify-content-start ms-3 mb-3">
            <FontAwesomeIcon icon={faThumbTack} />
          </div>
        )}
      </div>
    );
  };

  // filtro de mensajes (aprobado, denegado, spam...)
  const filteredMessages = messages ? Object.keys(messages).filter(messageId => {
    const message = messages[messageId];
    if (filter.status === 'all') {
      return true;
    }
    if (filter.status === 'approved' && message.approved === 'yes') {
      return true;
    }
    if (filter.status === 'denied' && message.ban_note === "remove not spam") {
      return true;
    }
    if (filter.status === 'locked' && message.locked === "yes") {
      return true;
    }
    if (filter.status === 'spam' && message.spam === "yes") {
      return true;
    }
    if (filter.status === 'report' && message.num_reports > 0) {
      return true;
    }

    return false;
  }) : [];
  
  
  // ordenar mensajes (más antiguo, más gustado...)
  const sortedMessages = filteredMessages.sort((a, b) => {
    const messageA = messages[a];
    const messageB = messages[b];

    if (firstOptionGlobal === "multilingual" || firstOptionGlobal === "twitter") {
      return messageB.negative - messageA.negative;
    } else if (firstOptionGlobal === "martin-toxic") {
      console.log('ordenando')
      return messageB.toxico - messageA.toxico;
    } else if (firstOptionGlobal === "jonatan-spanish") {
      return messageB.bullying - messageA.bullying;
    }

    switch (filter.sortBy) {
      case 'default':
        return messageA.created_compare - messageB.created_compare;
      case 'dateDesc':
        return messageB.created_compare - messageA.created_compare;
      case 'liked':
        return messageB.ups - messageA.ups;
      case 'disliked':
        return messageA.ups - messageB.ups;
      default:
        return 0; // No ordenar (mantener el orden original)
    }
  }); 
  

  // Paginación de mensajes
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = sortedMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(sortedMessages.length / messagesPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className="pagination justify-content-center">
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
              <button onClick={() => paginate(number)} className="page-link">
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div>
      <div style={{ textAlign: 'left', paddingLeft: '10px' }} >
        <Link to="/profile" className="btn btn-secondary rounded-pill mt-2 ml-auto"> <FontAwesomeIcon icon={faArrowLeft} /> Volver al perfil</Link>
      </div>

      <div className="container">
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} className="text-center mt-3">
          <h1>Mensajes del Post: {title}</h1>
        </div>

        <div className="d-flex flex-row justify-content-between mt-4 mb-5" style={{ maxWidth: '70%', margin: '0 auto' }}>
          <div className="d-flex flex-column justify-content-between mt-4 me-3 flex-grow-1">
            <label htmlFor="filterStatus" className="form-label">Filtrar por:</label>
            <select id="filterStatus" className="form-select w-100" value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}>
              <option value="all">-</option>
              <option value="approved">Aprobados</option>
              <option value="denied">Denegados</option>
              <option value="locked">Fijados</option>
              <option value="spam">Spam</option>
              <option value="report">Reportados</option>
            </select>
          </div>

          <div className="d-flex flex-column justify-content-between mt-4 ms-3 flex-grow-1">
            <label htmlFor="sortOption" className="form-label">Ordenar por:</label>
            <select id="sortOption" className="form-select w-100" value={filter.sortBy}
              onChange={e => setFilter({ ...filter, sortBy: e.target.value })}>
              <option value="default">Por defecto (Más antiguos)</option>
              <option value="dateDesc">Más recientes</option>
              <option value="liked">Más gustados</option>
              <option value="disliked">Menos gustados</option>
            </select>
          </div>
        </div>

        <div className="d-flex flex-row justify-content-between mt-4 mb-5" style={{ maxWidth: '70%', margin: '0 auto' }}>
          <div className="d-flex flex-column justify-content-between mt-4 me-3 flex-grow-1">
            <label htmlFor="firstDropdown" className="form-label">Selecciona un modelo de clasificación:</label>
            <select id="firstDropdown" className="form-select w-100" value={selectedFirstOption} onChange={handleFirstDropdownChange}>
              <option value="-">-</option>
              <option value="multilingual">[MULTILENGUAJE] Multilingual-cased-sentiments model ([positivo], [neutral], [negativo])</option>
              <option value="twitter">[INGLÉS] Twitter roberta base sentiment ([positivo], [neutral], [negativo])</option>
              <option value="martin-toxic">[INGLÉS] Toxic comment model ([tóxico], [no tóxico])</option>
              <option value="jonatan-spanish">[ESPAÑOL] Modelo cyberbullying español ( [bullying], [no bullying])</option>
              <option value="emotions">[INGLÉS] Emotion English DistilRoBERTa-base (ira🤬, asco🤢, miedo😨, alegría😀, neutral😐, tristeza😭, sorpresa😲)</option>
              <option value="groq">[MULTILENGUAJE] Clasificación de toxicidad con LLaMA ([muy tóxico], [tóxico], [un poco tóxico], [no tóxico])</option>

            </select>
          </div>

          {selectedFirstOption && (
            <div className="d-flex flex-column justify-content-between mt-4 ms-3 flex-grow-1">
              <label htmlFor="secondDropDown" className="form-label">Opciones para {selectedFirstOption}:</label>
              <select id="secondDropDown" className="form-select w-100" value={selectedSecondOption} 
                onChange={handleSecondDropdownChange}>
                <option value="-">-</option>
                {secondOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
          
        </div>

        {loading_spinner ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <ClipLoader color="#FFA500" loading={true} size={75} />
          </div>
        ) : (
          <div>
            {messages ? (
              currentMessages.length > 0 ? (
                currentMessages.map(messageId => {
                  return renderizarMensajes(messageId);
                })
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                  <p>No hay mensajes que mostrar</p>
                </div>
              )
            ) : (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <ClipLoader color="#FFA500" loading={true} size={75} />
              </div>
            )}
            {messages && renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostMessages;
