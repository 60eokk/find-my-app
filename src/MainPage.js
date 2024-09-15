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
    <div className="flex flex-col items-center justify-start min-h-screen p-5 bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Get Notified!!</h1>
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
        className="px-6 py-2 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
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