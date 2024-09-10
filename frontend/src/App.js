import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './comp/HomePage';
import LoginPage from './comp/LogInPage';
import SignUpPage from './comp/SignUpPage';
import ApiAuthorizationPage from './comp/AuthPage';
import CallBackPage from './comp/CallBackPage';
import ProfilePage from './comp/ProfilePage';
import LogOut from './comp/LogOut';
import PostMessages from './comp/PostMessages'

import './css/salida.css';


function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/authapi" element={<ApiAuthorizationPage />} />
        <Route path="/callback" element={<CallBackPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/logout" element={< LogOut />} />
        <Route path="/post/:idAndTitle" element={< PostMessages />} />
      </Routes>
    </Router>
  );
}

export default App;
