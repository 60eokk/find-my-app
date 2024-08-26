import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const MainPage = () => {
  const [position, setPosition] = React.useState(null);
  const MapboxToken = "pk.eyJ1IjoiNjBlb2trIiwiYSI6ImNseng0bHNpaDBvN3gyaW9sYTJrdGpjaHoifQ.7MEQ9mx2C8gXM2BQvCKOOg";

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Optionally set a default position if geolocation fails
        setPosition([50, 5]); // Default position (e.g., somewhere in Europe)
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
              url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MapboxToken}`}
              maxZoom={18}
              errorTileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Fallback to OpenStreetMap
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
    width: '100%', // Ensure the container takes the full width available
    maxWidth: '800px',
    height: '500px', // Fix the height to prevent it from changing
  },
  map: {
    height: '100%', // Make sure the map fills the entire container
    width: '100%', // Make sure the map fills the entire container
  },
};

export default MainPage;