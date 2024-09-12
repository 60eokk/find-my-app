import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';  // Import Leaflet CSS
import Friends from './Friends'; // Make sure to import the Friends component
import { updateUserLocation } from './locationService'; // Import from your locationService file

const MainPage = ({ user }) => {
  const [position, setPosition] = useState(null);
  const [friendLocations, setFriendLocations] = useState([]);
  const [alertDistance, setAlertDistance] = useState(5); // Default alert distance in miles
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
            checkProximity([lat, lng], friendLocations);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setPosition([50, 5]); // Default position if geolocation fails
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
      setPosition([50, 5]); // Default position if geolocation is not supported
    }
  }, [user, friendLocations]);

  const customMarkerIcon = new L.Icon({
    iconUrl: require('./mapcursor.png'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleMeButtonClick = useCallback(() => {
    if (position) {
      setPosition([...position]); // Trigger a re-render
    }
  }, [position]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Radius of the Earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in miles
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const checkProximity = (userLocation, friendLocations) => {
    friendLocations.forEach(friend => {
      if (friend.location) {
        const distance = calculateDistance(
          userLocation[0], userLocation[1],
          friend.location.latitude, friend.location.longitude
        );
        if (distance < alertDistance) {
          alert(`Your friend ${friend.email} is less than ${alertDistance} miles away!`);
        }
      }
    });
  };

  const handleFriendLocationsUpdate = (locations) => {
    setFriendLocations(locations);
    if (position) {
      checkProximity(position, locations);
    }
  };

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
            <Marker position={position} icon={customMarkerIcon} />
            {friendLocations.map((friend, index) => 
            friend.location && (
              <Marker 
                key={index} 
                position={[friend.location.latitude, friend.location.longitude]}
                icon={customMarkerIcon}
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
      <div>
        <label>
          Alert Distance (miles):
          <input 
            type="number" 
            value={alertDistance} 
            onChange={(e) => setAlertDistance(Number(e.target.value))}
            style={styles.input}
          />
        </label>
      </div>
      <Friends user={user} onFriendLocationsUpdate={handleFriendLocationsUpdate} />
    </div>
  );
};

// Component that handles the logic for re-centering the map when "ME!" is clicked
const MapResetButton = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [map, position]);
  return null; // This component doesn't render anything
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