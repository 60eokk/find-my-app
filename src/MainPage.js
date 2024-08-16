import './App.css';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const MainPage = () => {
  const [position, setPosition] = React.useState([50,5]);
  const MapboxToken = "pk.eyJ1IjoiNjBlb2trIiwiYSI6ImNseng0bHNpaDBvN3gyaW9sYTJrdGpjaHoifQ.7MEQ9mx2C8gXM2BQvCKOOg";

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);


   // 
  return ( 
    <div style={styles.container}>
      <h1 style={styles.heading}>Get Notified!!</h1>
      <div style={styles.mapContainer}>
      <MapContainer center={position} zoom={13} style={styles.map}> 
      <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MapboxToken}`}
            maxZoom={18}
          />
        <Marker position={position}></Marker> 
      </MapContainer> 
     </div> 
    </div> // Missing tiles were checked by Inspect -> Network to see if there were any 429(too many requests), 503(service unavailable) responses
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