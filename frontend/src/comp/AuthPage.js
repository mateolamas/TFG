
const ApiAuthorizationPage = () => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth_api');
        if (response.ok) {
          const data = await response.json();
          console.log('Datos recibidos:', data);
          const authUrl = data;
          window.location.href = authUrl;
      } else {
        console.error('Error al obtener la URL de autorización');
      }
      } catch (error) {
        console.error('Error al obtener datos de autorización:', error);
      }
    };

    fetchData();
  
};

export default ApiAuthorizationPage;
