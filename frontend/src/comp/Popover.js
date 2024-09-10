import React, { useState } from 'react';

const Popover = ({ content, children, style }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Función para manejar el hover solo si hay contenido
  const handleMouseEnter = () => {
    if (content.trim() !== '') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Determinar si el popover está desactivado
  const isDisabled = content.trim() === '';

  // Estilo para el popover cuando está desactivado
  const disabledStyle = {
    color: '#aaa', // Color de texto gris
    cursor: 'default', // Cursor por defecto
    ...style
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: isDisabled ? 'default' : 'pointer',
        ...(isDisabled ? disabledStyle : {})
      }}
    >
      {children}
      {isVisible && !isDisabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '100%',
            backgroundColor: '#f9f9f9',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,.2)',
            zIndex: 9999,
            width: '250px', // Ancho maximo del popover
            whiteSpace: 'pre-line', // Esto mantiene los saltos de línea
            ...style
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Popover;
