import React, { useState } from 'react';
import DonationForm from './donations/DonationForm';
import '../styles/custom.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TemplateList from './templates/TemplateList';
import UseCases from './use-cases/UseCases';
import DonationPage from './donations/DonationPage';
import { useAuth } from '../contexts/AuthContext';


function App() {
  const { currentUser, loginWithGoogle, login, signup, logout } = useAuth();
  const [activeModal, setActiveModal] = useState(null); // 'login' o 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para los formularios
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      closeModal();
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo electrónico');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        default:
          setError('Error al iniciar sesión: ' + error.message);
      }
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signup(registerEmail, registerPassword, registerName);
      closeModal();
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Ya existe una cuenta con este correo electrónico');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres');
          break;
        default:
          setError('Error al registrarse: ' + error.message);
      }
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      closeModal();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  const openModal = (modalType) => {
    setActiveModal(modalType);
    setError('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setError('');
  };

  return (
    <Router>
      <div>
        <nav className="bg-white shadow-md sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-gray-800">
                  <span className="text-blue-600">n8n</span>
                  <span className="text-orange-500">Latam</span>
                </Link>
                <div className="hidden md:flex ml-10 space-x-6">
                  <Link to="/templates" className="text-gray-600 hover:text-orange-500 font-medium">Plantillas</Link>
                  <Link to="/use-cases" className="text-gray-600 hover:text-orange-500 font-medium">Casos de Uso</Link>
                  <Link to="/donate" className="text-gray-600 hover:text-orange-500 font-medium">Donar</Link>
                  {currentUser && (
                    <Link to="/upload-template" className="text-blue-600 hover:text-blue-700 font-medium">
                      <i className="fas fa-upload mr-2"></i>Subir Plantilla
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {!currentUser ? (
                  <>
                    <button 
                      onClick={() => openModal('login')} 
                      className="btn-secondary px-4 py-2 rounded-md font-medium"
                    >
                      Iniciar Sesión
                    </button>
                    <button 
                      onClick={() => openModal('register')} 
                      className="btn-primary px-4 py-2 rounded-md font-medium"
                    >
                      Registrarse
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="Perfil" 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
                        </div>
                      )}
                      <span className="ml-2 text-gray-700">{currentUser.displayName || currentUser.email}</span>
                    </div>
                    <button 
                      onClick={logout} 
                      className="text-gray-600 hover:text-red-500"
                    >
                      <i className="fas fa-sign-out-alt mr-1"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Rutas */}
        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="hero-pattern text-white py-16 md:py-24">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                      <h1 className="text-4xl md:text-5xl font-bold mb-6">Automatización de flujos de trabajo para la comunidad latina</h1>
                      <p className="text-xl mb-8">La plataforma definitiva para compartir y descubrir plantillas de automatización en español. Conecta, aprende y crece con nuestra comunidad.</p>
                      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/templates" className="btn-primary px-6 py-3 rounded-md font-medium text-center">
                          Explorar Plantillas
                        </Link>
                        <button 
                          onClick={() => openModal('register')} 
                          className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100"
                        >
                          Crear Cuenta
                        </button>
                      </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                      <div className="relative">
                        <div className="absolute -top-4 -left-4 w-full h-full bg-orange-500 rounded-lg"></div>
                        <div className="relative z-10 bg-white rounded-lg shadow-xl p-6">
                          <img src="https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/Darker_Home_4699f79534.webp" alt="n8n Workflow" className="w-full rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección de Donaciones */}
              <DonationForm />
            </>
          } />
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/donate" element={<DonationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
