import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Friends from './Friends';
import { updateUserLocation, ensureUserDocument } from './firebaseUtils';

const MainPage = ({ user }) => {
  const [position, setPosition] = useState(null);
  const [friendLocations, setFriendLocations] = useState([]);
  const [geoError, setGeoError] = useState(null);
  const MapboxToken = "pk.eyJ1IjoiNjBlb2trIiwiYSI6ImNseng0bHNpaDBvN3gyaW9sYTJrdGpjaHoifQ.7MEQ9mx2C8gXM2BQvCKOOg";

  useEffect(() => {
    if (navigator.geolocation && user) {
      console.log("Geolocation is supported by this browser.");
      ensureUserDocument(user.uid, user.email);
      
      // First, get the current position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          console.log('Initial geolocation success:', lat, lng);
          setPosition([lat, lng]);
          updateUserLocation(user.uid, lat, lng);
        },
        (error) => {
          console.error("Initial geolocation error:", error.message);
          setGeoError(error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Then set up watching the position
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          console.log('Geolocation update:', lat, lng);
          setPosition([lat, lng]);
          updateUserLocation(user.uid, lat, lng);
          setGeoError(null);
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setGeoError(error.message);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setGeoError("Geolocation is not supported by this browser.");
    } else if (!user) {
      console.error("User is not authenticated.");
      setGeoError("Please sign in to use location features.");
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
    console.log("Received friend locations update:", locations);
    setFriendLocations(locations);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-5 bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Get Notified!!</h1>
      {geoError && (
        <div className="w-full max-w-3xl mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {geoError}. Please check your device settings and try again.
        </div>
      )}
      <div className="w-full max-w-3xl h-96 border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
        {position ? (
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
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
          <p className="text-center py-4">Loading map...</p>
        )}
      </div>
      <button 
        onClick={handleMeButtonClick} 
        className="px-6 py-2 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 mb-4"
      >
        ME!
      </button>
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

export default MainPage;