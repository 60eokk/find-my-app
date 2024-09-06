import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const MainPage = () => {
  const [position, setPosition] = React.useState(null);
  const MapboxToken = "pk.eyJ1IjoiNjBlb2trIiwiYSI6ImNseng0bHNpaDBvN3gyaW9sYTJrdGpjaHoifQ.7MEQ9mx2C8gXM2BQvCKOOg";
  const [userLocation, setUserLocation] = React.useState(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      console.log("Geolocation is supported by this browser.");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          console.log('Geolocation success:', lat, lng);
          setPosition([lat, lng]);
          setUserLocation([lat, lng]); // Set initial user location for the "ME!" button
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setPosition([50, 5]); // Default position if geolocation fails
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setPosition([50, 5]); // Default position if geolocation is not supported
    }
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
              tileSize={512} // Tile size for Mapbox is 512
              zoomOffset={-1} // Adjust zoom offset for 512 tiles
              maxZoom={18}
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
            />
            <Marker position={position} icon={customMarkerIcon}></Marker>
            <ChangeView position={userLocation} /> {/* Use userLocation to update map view */}
          </MapContainer>
        ) : (
          <p>Loading map...</p>
        )}
      </div>
      <button onClick={() => setUserLocation(position)} style={styles.button}>ME!</button> {/* "ME!" button */}
    </div>
  );
};



// Custom hook to update the map view when the user clicks "ME!"
const ChangeView = ({ position }) => {
  const map = useMap(); // Hook to access the map instance
  React.useEffect(() => {
    if (position) {
      map.setView(position, 13); // Center map to position with zoom level 13
    }
  }, [position, map]);
  return null;
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
  button: {
    padding: '10px 20px',
    fontSize: '1.2rem',
    marginTop: '10px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
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