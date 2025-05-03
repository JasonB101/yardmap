import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, OverlayView, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Container, Typography, AppBar, Toolbar, Button, Box, Alert, Snackbar } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AddJunkyardForm from './components/AddJunkyardForm';
import JunkyardInfo from './components/JunkyardInfo';
import { IJunkyard } from './types/junkyard';
import axios from 'axios';
import RouteIcon from '@mui/icons-material/Route';
import MapIcon from '@mui/icons-material/Map';

// Create a theme instance
const theme = createTheme();

// Configure axios
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api'  // In production, use relative URL
    : `${window.location.protocol}//${window.location.hostname}:5000/api`,  // In development, use dynamic URL
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add these constants at the top with other constants
const LAYOUT = {
  MAP_PADDING: 50,
  INFO_OFFSET: {
    BOTTOM: 27,
    LEFT: 11
  }
} as const;

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
  padding: LAYOUT.MAP_PADDING
};

const center = {
  lat: 39.8283,  // Center of USA
  lng: -98.5795
};

// Add this constant at the top of the file, after the imports
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
];

function App() {
  const [junkyards, setJunkyards] = useState<IJunkyard[]>([]);
  const [selectedJunkyard, setSelectedJunkyard] = useState<IJunkyard | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: 39.8283, lng: -98.5795 });
  const [zoom, setZoom] = useState(4);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const clearRoute = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }
    setDirections(null);
    setDistanceInfo(null);
    // Reset cursor to default
    if (mapRef.current) {
      mapRef.current.setOptions({ draggableCursor: null });
    }
  }, [directionsRenderer]);

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!isCalculatingDistance || !selectedJunkyard || !e.latLng) return;

    const startLocation = e.latLng;
    const endLocation = selectedJunkyard.location;

    try {
      // Clear existing route
      clearRoute();

      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: startLocation,
        destination: { lat: endLocation.lat, lng: endLocation.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      const renderer = new google.maps.DirectionsRenderer({
        map: mapRef.current,
        directions: result
      });
      setDirectionsRenderer(renderer);
      setDirections(result);

      const route = result.routes[0];
      if (route && route.legs[0]) {
        setDistanceInfo({
          distance: route.legs[0].distance?.text || 'Unknown',
          duration: route.legs[0].duration?.text || 'Unknown',
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setError('Failed to calculate route. Please try again.');
    } finally {
      setIsCalculatingDistance(false);
      // Reset cursor to default
      if (mapRef.current) {
        mapRef.current.setOptions({ draggableCursor: null });
      }
    }
  }, [isCalculatingDistance, selectedJunkyard, clearRoute]);

  const handleCalculateDistance = useCallback(() => {
    setIsCalculatingDistance(true);
    setDirections(null);
    setDistanceInfo(null);
    setError('Click on the map to select your starting point');
    // Add crosshair cursor to the map
    if (mapRef.current) {
      mapRef.current.setOptions({ draggableCursor: 'crosshair' });
    }
  }, []);

  const handleUpdateJunkyard = useCallback(async (updatedJunkyard: IJunkyard) => {
    try {
      // Update the junkyards list with the updated junkyard
      setJunkyards(prevJunkyards => 
        prevJunkyards.map(j => j._id === updatedJunkyard._id ? updatedJunkyard : j)
      );
      // Update the selected junkyard if it's the one being edited
      if (selectedJunkyard?._id === updatedJunkyard._id) {
        setSelectedJunkyard(updatedJunkyard);
      }
    } catch (error) {
      console.error('Error updating junkyard:', error);
      setError('Failed to update junkyard. Please try again.');
    }
  }, [selectedJunkyard]);

  const fetchJunkyards = async () => {
    try {
      const response = await api.get<IJunkyard[]>('/junkyards');
      setJunkyards(response.data);
    } catch (error) {
      console.error('Error fetching junkyards:', error);
      setError('Failed to fetch junkyards. Please try again later.');
    }
  };

  useEffect(() => {
    fetchJunkyards();
  }, []);

  useEffect(() => {
    console.log('selectedJunkyard changed:', selectedJunkyard);
  }, [selectedJunkyard]);

  // Add this check after all hooks
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ mt: 4 }}>
          Error: Google Maps API key is not configured
        </Typography>
      </Container>
    );
  }

  const handleMarkerClick = (junkyard: IJunkyard) => {
    console.log('Marker clicked:', junkyard);
    setSelectedJunkyard(junkyard);
  };

  const handleInfoWindowClose = () => {
    setSelectedJunkyard(null);
    // Force close any remaining InfoWindows
    const infoWindows = document.querySelectorAll('.gm-style-iw');
    infoWindows.forEach(window => {
      if (window.parentElement) {
        window.parentElement.style.display = 'none';
      }
    });
  };

  const handleAddJunkyard = async (newJunkyard: Partial<IJunkyard>) => {
    try {
      await api.post('/junkyards', newJunkyard);
      fetchJunkyards();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding junkyard:', error);
      setError('Failed to add junkyard. Please try again.');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const getPixelPositionOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height + 10),
  });

  const handleDeleteJunkyard = async (id: string) => {
    try {
      await axios.delete(`/api/junkyards/${id}`);
      // Update the junkyards list by removing the deleted junkyard
      setJunkyards(prevJunkyards => prevJunkyards.filter(j => j._id !== id));
      setSelectedJunkyard(null);
    } catch (error) {
      console.error('Error deleting junkyard:', error);
      setError('Failed to delete junkyard. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div>
          <AppBar position="static">
            <Toolbar>
              <MapIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Yard Map
              </Typography>
              <Button color="inherit" onClick={() => setIsFormOpen(true)}>
                Add Junkyard
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={4}
                  onLoad={onMapLoad}
                  onUnmount={onMapUnmount}
                  onClick={handleMapClick}
                  options={{
                    styles: mapStyles,
                    disableDefaultUI: true,
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    gestureHandling: 'greedy'
                  }}
                >
                  {junkyards.map((junkyard) => (
                    <Marker
                      key={junkyard._id}
                      position={junkyard.location}
                      onClick={() => handleMarkerClick(junkyard)}
                    />
                  ))}
                </GoogleMap>
              </LoadScript>

              {selectedJunkyard && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: LAYOUT.INFO_OFFSET.BOTTOM,
                    left: LAYOUT.INFO_OFFSET.LEFT,
                    width: '300px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '12px',
                    zIndex: 1000
                  }}
                >
                  <Button
                    onClick={() => {
                      setSelectedJunkyard(null);
                      setDirections(null);
                      setDistanceInfo(null);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      minWidth: '32px',
                      height: '32px',
                      padding: '4px',
                      fontSize: '20px',
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    ×
                  </Button>
                  <JunkyardInfo 
                    junkyard={selectedJunkyard} 
                    onClose={() => {
                      setSelectedJunkyard(null);
                      setDirections(null);
                      setDistanceInfo(null);
                    }}
                    onDelete={() => handleDeleteJunkyard(selectedJunkyard._id)}
                    onUpdate={handleUpdateJunkyard}
                    onCalculateDistance={handleCalculateDistance}
                    distanceInfo={distanceInfo}
                    onClearRoute={clearRoute}
                  />
                </Box>
              )}

              <AddJunkyardForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleAddJunkyard}
              />

              <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
              >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              </Snackbar>
            </Box>
          </Container>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;