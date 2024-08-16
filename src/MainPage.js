// import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const MainPage = () => {
  const [position, setPosition] = React.useState([50,5]);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Get Notified!!</h1>
      <MapContainer center={position} zoom={13} style={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}></Marker>
      </MapContainer>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  heading: {
    fontSize: '3rem',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  map: {
    height: '400px',
    width: '400px',
  },
};

export default MainPage;