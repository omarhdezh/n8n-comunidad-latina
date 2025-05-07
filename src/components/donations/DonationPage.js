import React from 'react';

const DonationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Apoya a la Comunidad Latina de n8n</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <p className="text-lg mb-6">
            Tu donación nos ayuda a mantener y mejorar la plataforma para toda la comunidad latina. 
            Cada contribución marca la diferencia.
          </p>
          
          <div className="flex justify-center mb-8">
            <form action="https://www.paypal.com/donate" method="post" target="_blank">
              <input type="hidden" name="business" value="TU_EMAIL_PAYPAL" />
              <input type="hidden" name="currency_code" value="USD" />
              <button 
                type="submit" 
                className="bg-[#0070BA] hover:bg-[#003087] text-white font-bold py-3 px-8 rounded-full flex items-center"
              >
                <img 
                  src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" 
                  alt="PayPal" 
                  className="h-6 mr-2"
                />
                Donar con PayPal
              </button>
            </form>
          </div>
          
          <div className="text-center text-gray-600">
            <h2 className="text-xl font-semibold mb-4">¿Por qué donar?</h2>
            <ul className="text-left list-disc pl-6 mb-6">
              <li>Mantener la infraestructura de la plataforma</li>
              <li>Desarrollar nuevas características</li>
              <li>Crear más contenido educativo en español</li>
              <li>Organizar eventos y talleres para la comunidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;