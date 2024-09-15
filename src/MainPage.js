import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Friends from './Friends';
import { updateUserLocation } from './locationService';

const MainPage = ({ user }) => {
  const [position, setPosition] = useState(null);
  const [friendLocations, setFriendLocations] = useState([]);
  const MapboxToken = "pk.eyJ1IjoiNjBlb2trIiwiYSI6ImNseng0bHNpaDBvN3gyaW9sYTJrdGpjaHoifQ.7MEQ9mx2C8gXM2BQvCKOOg";

  useEffect(() => {
    if (navigator.geolocation) {
      console.log("Geolocation is supported by this browser.");
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          console.log('Geolocation success:', lat, lng);
          setPosition([lat, lng]);
          if (user) {
            updateUserLocation(user.uid, lat, lng);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setPosition([50, 5]);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
      setPosition([50, 5]);
    }
  }, [user]);

  const customMarkerIcon = new L.Icon({
    iconUrl: require('./mapcursor.png'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const friendMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const handleMeButtonClick = useCallback(() => {
    if (position) {
      setPosition([...position]);
    }
  }, [position]);

  const handleFriendLocationsUpdate = useCallback((locations) => {
    setFriendLocations(locations);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Get Notified!!</h1>
      <div style={styles.mapContainer}>
        {position ? (
          <MapContainer center={position} zoom={13} style={styles.map}>
            <TileLayer
              url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MapboxToken}`}
              tileSize={512}
              zoomOffset={-1}
              maxZoom={18}
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
            />
            <Marker position={position} icon={customMarkerIcon}>
              <Popup>You are here</Popup>
            </Marker>
            {friendLocations.map((friend, index) => 
              friend.location && (
                <Marker 
                  key={index} 
                  position={[friend.location.latitude, friend.location.longitude]}
                  icon={friendMarkerIcon}
                >
                  <Popup>{friend.email}</Popup>
                </Marker>
              )
            )}
            <MapResetButton position={position} />
          </MapContainer>
        ) : (
          <p>Loading map...</p>
        )}
      </div>
      <button onClick={handleMeButtonClick} style={styles.button}>ME!</button>
      <Friends user={user} onFriendLocationsUpdate={handleFriendLocationsUpdate} userLocation={position} />
    </div>
  );
};

const MapResetButton = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [map, position]);
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
  input: {
    margin: '10px',
    padding: '5px',
    fontSize: '1rem',
  },
};

export default MainPage