import './App.css';
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
      <div style={styles.mapContainer}>
      <MapContainer center={position} zoom={13} style={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}></Marker>
      </MapContainer>
     </div>
    </div>
  );
};

const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f0f0f0',
    },
    heading: {
      fontSize: '3rem',
      textAlign: 'center',
      marginBottom: '20px',
      color: '#333',
    },
    mapContainer: {
      border: '2px solid #333',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    map: {
      height: '500px',
      width: '100%',
    },
  };

export default MainPage;