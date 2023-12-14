import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import abiimp from "./GiftCard.json";
import './App.css';
import imagen1 from './imagenes/imagen1.jpg';
import imagen2 from './imagenes/imagen2.jpg';
import imagen3 from './imagenes/imagen3.jpg';
import imagen4 from './imagenes/imagen4.jpg';

function CardCreationForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');

  const handleSubmit = () => {
    onSubmit({ email, country, phone, monto, concepto });
  };

  return (
    <div>
      <h2>Formulario de creación de tarjeta de regalo</h2>
      <label>Correo electrónico:</label>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>País:</label>
      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
      <label>Teléfono:</label>
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <label>Monto:</label>
      <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
      <label>Concepto:</label>
      <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} />
      <tr></tr>
      <button onClick={handleSubmit}>Enviar</button>
    </div>
  );
}

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [submittedData, setSubmittedData] = useState([]);

  const carouselImages = [
    imagen1,
    imagen2,
    imagen3,
    imagen4,
    // Agrega más imágenes según sea necesario
  ];

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        try {
          await window.ethereum.enable();
          const accs = await web3Instance.eth.getAccounts();
          setAccounts(accs);

          const abi = abiimp.abi;
          const address = '0x1d3072645901438d9c5fdeEE4fAcbB3b0C9dC83b';
          const contractInstance = new web3Instance.eth.Contract(abi, address);
          setContract(contractInstance);

          const allCards = await contractInstance.methods.getAllCards().call();
          // Añadir la nueva tarjeta al estado sin hacer una nueva llamada
          setSubmittedData(allCards.map(card => ({ ...card, redeemed: false })));
          console.log(allCards);
          
        } catch (error) {
          console.error('Error al habilitar MetaMask:', error);
        }
      } else {
        console.error('MetaMask no detectado');
      }
    };

    init();
  }, []);

  const createCard = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const cardId = Math.floor(Math.random() * 1000000);
      await contract.methods
        .createCard(
          cardId,
          formData.email,
          formData.country,
          formData.phone,
          formData.monto,
          formData.concepto
        )
        .send({ from: accounts[0] });

      alert(`Tarjeta de regalo creada: ${cardId}`);

      // Añadir la nueva tarjeta al estado sin hacer una nueva llamada
      setSubmittedData([...submittedData, { cardId, redeemed: false, ...formData }]);
      console.log(submittedData);
    } catch (error) {
      console.error('Error al crear la tarjeta:', error);
      // Mostrar mensaje de error al usuario
      alert('Error al crear la tarjeta. Por favor, inténtelo de nuevo.');
    }

    setShowForm(false);
    // Resetear los valores del formulario después del envío
    setFormData({
      email: '',
      country: '',
      phone: '',
      monto: '',
      concepto: '',
    });
  };

  const redeemCard = async (cardId) => {
    try {
      await contract.methods.redeemCard(cardId).send({ from: accounts[0] });
      alert(`Tarjeta de regalo con ID: ${cardId} canjeada`);
      // Actualizar el estado de canje en submittedData
      setSubmittedData((prevData) =>
        prevData.map((data) =>
          data.cardId === cardId ? { ...data, redeemed: true } : data
        )
      );
    } catch (error) {
      console.error('Error al canjear:', error);
      // Mostrar mensaje de error al usuario
      alert('Error al canjear la tarjeta. Por favor, inténtelo de nuevo.');
    }
  };
  
  useEffect(() => {
    // Imprimir submittedData después de cada actualización
    console.log("submittedData:", submittedData);
  }, [submittedData]);

  return (
    <div className="App">
      <h1 style={{ textAlign: 'left', marginLeft: '10px' }}>GiftChainExchange</h1>
      <p style={{ textAlign: 'right', marginRight: '10px' }}>Cuenta conectada: {accounts[0]}</p>

      {/* Carrusel utilizando marquee */}
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', margin: '10px 0' }}>
        <marquee scrollamount="5">
          {carouselImages.map((image, index) => (
            <img key={index} src={image} alt={`Slide ${index}`} style={{ width: '800px', marginRight: '20px' }} />
          ))}
        </marquee>
      </div>

      {showForm ? (
        <CardCreationForm onSubmit={handleFormSubmit} />
      ) : (
        <>
          <button onClick={createCard}>Generar tarjeta de regalo</button>
          {/* Mostrar la tabla solo si hay tarjetas creadas */}
          {submittedData.length > 0 && (
            <div>
              <h2>Tarjetas generadas</h2>
              <table>
                <thead>
                  <tr>
                    <th>Card ID</th>
                    <th>Email</th>
                    <th>País</th>
                    <th>Teléfono</th>
                    <th>Monto</th>
                    <th>Concepto</th>
                    <th>Status Canjeado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map((data) => (
                    <tr key={data.cardId}>
                      <td>{data.cardId}</td>
                      <td>{data.email}</td>
                      <td>{data.country}</td>
                      <td>{data.phone}</td>
                      <td>{data.monto}</td>
                      <td>{data.concepto}</td>
                      <td>{data.redeemed ? 'Yes' : 'No'}</td>
                      <td>
                        {!data.redeemed && (
                          <button onClick={() => redeemCard(data.cardId)}>Canjear</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
