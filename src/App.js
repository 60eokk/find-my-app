// import logo from './logo.svg';
import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';





function App() {
  const [position, setPosition] = React.useState([50, 5]);
  return (
    <div>
      <h1>Get Notified!!</h1>
      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}></Marker>
      </MapContainer>
    </div>
  );
}

export default App;
