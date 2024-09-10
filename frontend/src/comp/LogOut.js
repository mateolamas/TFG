import { useEffect } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';

const LogOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const cookies = new Cookies(); // Moved inside useEffect

        const logOutAndNavigate = async () => {
            const response = await fetch('http://localhost:3001/log_out', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                cookies.remove('session_id', { path: '/', domain: 'localhost' });
                navigate('/');
            } 
        };

        logOutAndNavigate();

        // Clean up function
        return () => {
            // Perform any cleanup here if needed
        };
    }, [navigate]);

    return null;
};

export default LogOut;
