import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { AuthProvider } from './contexts/AuthContext';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
