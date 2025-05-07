// src/components/donations/DonationForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function DonationForm() {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paypalSDKLoaded, setPaypalSDKLoaded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Opciones de montos predefinidos
  const amountOptions = [
    { value: '5', label: '5 €' },
    { value: '10', label: '10 €' },
    { value: '25', label: '25 €' },
    { value: '50', label: '50 €' },
    { value: 'custom', label: 'Otra cantidad' }
  ];

  useEffect(() => {
    // Cargar el SDK de PayPal
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=EUR`;
    script.addEventListener('load', () => setPaypalSDKLoaded(true));
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (paypalSDKLoaded) {
      // Renderizar los botones de PayPal cuando el SDK está cargado
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            const finalAmount = amount === 'custom' ? customAmount : amount;
            
            // Validaciones
            if (!finalAmount || isNaN(finalAmount) || parseFloat(finalAmount) <= 0) {
              setError('Por favor, introduce una cantidad válida');
              return;
            }

            return actions.order.create({
              purchase_units: [
                {
                  description: 'Donación a N8N Comunidad Latina',
                  amount: {
                    currency_code: 'EUR',
                    value: finalAmount
                  }
                }
              ]
            });
          },
          onApprove: async (data, actions) => {
            // Capturar el pago
            const order = await actions.order.capture();
            
            // Guardar la información de la donación en Firestore
            try {
              setLoading(true);
              const finalAmount = amount === 'custom' ? customAmount : amount;
              
              await addDoc(collection(db, 'donations'), {
                userId: currentUser ? currentUser.uid : 'anonymous',
                userEmail: currentUser ? currentUser.email : 'anonymous',
                amount: parseFloat(finalAmount),
                currency: 'EUR',
                message: message || '',
                paypalOrderId: order.id,
                status: 'completed',
                createdAt: serverTimestamp()
              });
              
              setSuccess('¡Gracias por tu donación! Tu apoyo es fundamental para mantener este proyecto.');
              // Reiniciar formulario
              setAmount('');
              setCustomAmount('');
              setMessage('');
              
            } catch (err) {
              console.error('Error al registrar la donación:', err);
              setError('La donación se procesó correctamente pero hubo un error al registrarla.');
            } finally {
              setLoading(false);
            }
          },
          onError: (err) => {
            console.error('Error en el pago:', err);
            setError('Hubo un error al procesar el pago. Por favor, inténtalo de nuevo.');
          }
        })
        .render('#paypal-button-container');
    }
  }, [paypalSDKLoaded, amount, customAmount, message, currentUser]);

  return (
    <div className="container mx-auto px-4 py-12" id="donate">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Apoya a N8N Comunidad Latina</h2>
        
        <p className="text-gray-600 text-center mb-8">
          Tu donación nos ayuda a mantener este recurso gratuito para toda la comunidad de habla hispana
          y a seguir desarrollando nuevas funcionalidades y contenido.
        </p>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded relative" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button 
              className="absolute top-0 right-0 mt-4 mr-4 text-red-500" 
              onClick={() => setError('')}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded relative" role="alert">
            <p className="font-bold">¡Éxito!</p>
            <p>{success}</p>
            <button 
              className="absolute top-0 right-0 mt-4 mr-4 text-green-500" 
              onClick={() => setSuccess('')}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount-select">
              Cantidad
            </label>
            <div className="relative">
              <select
                id="amount-select"
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              >
                <option value="">Selecciona una cantidad</option>
                {amountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>
          
          {amount === 'custom' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="custom-amount">
                Introduce la cantidad (€)
              </label>
              <input
                id="custom-amount"
                type="number"
                min="1"
                className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Ej: 15"
              />
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
              Mensaje (opcional)
            </label>
            <textarea
              id="message"
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Deja un mensaje de apoyo (opcional)"
            ></textarea>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Tu donación será procesada de forma segura a través de PayPal. No es necesario tener una cuenta de PayPal para realizar la donación.
            </p>
            
            {loading ? (
              <div className="flex justify-center my-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div id="paypal-button-container" className="mt-4"></div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            N8N Comunidad Latina es un proyecto sin ánimo de lucro. Todas las donaciones se utilizan para cubrir los costes de mantenimiento y desarrollo.
          </p>
        </div>
      </div>
    </div>
  );
}