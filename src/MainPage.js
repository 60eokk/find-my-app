import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet'

const MainPage = () => {
  const [position, setPosition] = React.useState(null);
  const MapboxToken = "pk.eyJ1IjoiNjBlb2trIiwiYSI6ImNseng0bHNpaDBvN3gyaW9sYTJrdGpjaHoifQ.7MEQ9mx2C8gXM2BQvCKOOg";

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('Geolocation success:', pos); // log to check position is correct
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Optionally set a default position if geolocation fails
        setPosition([50, 5]); // Default position (e.g., somewhere in Europe)
      }
    );
  }, []);

  const customMarkerIcon = new L.Icon({
    iconUrl: require('./mapcursor.png'),
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Get Notified!!</h1>
      <div style={styles.mapContainer}>
        {position ? (
          <MapContainer center={position} zoom={13} style={styles.map}>
            <TileLayer
              url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MapboxToken}`}
              maxZoom={18}
            />
            <Marker position={position} icon={customMarkerIcon}></Marker>
          </MapContainer>
        ) : (
          <p>Loading map...</p>
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