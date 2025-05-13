import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const QRComponent = () => {
  const [qrImage, setQrImage] = useState<string>();
  const [progress, setProgress] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const id = '101230eb-d814-4efc-acad-8cdd78db6c96'

    const url = import.meta.env.VITE_APP_GRAPH_WHASTAPP_WS + 'ws';
    const newSocket = io(url, {
      transports: ['websocket'],
      query: { bundleId: id },
    });

    // Conectar y suscribir al WebSocket
    newSocket.on('connect', () => {
      console.log('📡 Conectado al socket');
      newSocket.emit('subscribe', { bundleId: id });
    });

    // Recibir el QR y actualizar el estado
    newSocket.on('qr', (data) => {
      console.log('📡 QR recibido:', data);
      const url = 'http://localhost:3021/public' + data
      setQrImage(url); // Almacenar la ruta del QR
    });
  }, []);

  return (
    <div>
      {/* Mostrar QR si se recibe */}
      {qrImage && (
        <div>
          <h3>Escanea este QR:</h3>
          <img src={qrImage} alt="QR Code" />
        </div>
      )}
    
    </div>
  );
};

export default QRComponent;
