import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const MainPage = () => {
  const [position, setPosition] = React.useState([50, 5]);
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Optionally set a default position if geolocation fails
      }
    );
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Get Notified!!</h1>
      <div style={styles.mapContainer}>
        {position && (
          <MapContainer center={position} zoom={13} style={styles.map}>
            <TileLayer
              url={`https://api.mapbox.com/styles/v1/60eokk/clzx53ldv007c01o1diup82dk/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`}
              maxZoom={18}
            />
            <Marker position={position}></Marker>
          </MapContainer>
        )}
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
    width: '100%',
    maxWidth: '800px', // Optional max width
  },
  map: {
    height: '50vh', // Responsive height
    width: '100%',
  },
};

export default MainPage;