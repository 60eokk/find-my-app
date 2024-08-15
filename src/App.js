// import logo from './logo.svg';
import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';


function App() {
  const [position, setPosition] = React.useState([50, 5]);
  return (
    <div className="container">
      <h1 className="heading">Get Notified!!</h1>
      <MapContainer center={position} zoom={13} className="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}></Marker>
      </MapContainer>
    </div>
  );
};

export default App;
