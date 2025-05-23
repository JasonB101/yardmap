import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, OverlayView, InfoWindow, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';
import { Container, Typography, AppBar, Toolbar, Button, Box, Alert, Snackbar } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AddJunkyardForm from './components/AddJunkyardForm';
import JunkyardInfo from './components/JunkyardInfo';
import MapFilters from './components/MapFilters';
import { IJunkyard } from './types/junkyard';
import axios from 'axios';
import RouteIcon from '@mui/icons-material/Route';
import PushPinIcon from '@mui/icons-material/PushPin';
import { appTheme } from './theme';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
    },
    secondary: {
      main: '#2D2D2D',
    },
    background: {
      default: '#1A1A1A',
      paper: '#3D3D3D',
    },
  },
});

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
  height: 'calc(100vh - 200px)', // Adjust based on header and filters height
  padding: LAYOUT.MAP_PADDING
};

const center = {
  lat: 35.0000,  // Moved slightly south
  lng: -90.0000  // Moved slightly east
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
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [junkyards, setJunkyards] = useState<IJunkyard[]>([]);
  const [filteredJunkyards, setFilteredJunkyards] = useState<IJunkyard[]>([]);
  const [selectedJunkyard, setSelectedJunkyard] = useState<IJunkyard | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const mapStateRef = useRef({
    center: { lat: 35.0000, lng: -90.0000 },
    zoom: 4
  });
  const [markerIcon, setMarkerIcon] = useState<google.maps.Symbol | google.maps.Icon | undefined>(undefined);
  const [currentZoom, setCurrentZoom] = useState<number>(4);
  const [isMovingMap, setIsMovingMap] = useState(false);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // Store initial map state
    const center = map.getCenter()?.toJSON();
    const zoom = map.getZoom();
    if (center && zoom) {
      mapStateRef.current = { center, zoom };
      setCurrentZoom(zoom);
    }
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);
  
  const onMapDragStart = useCallback(() => {
    setIsMovingMap(true);
  }, []);

  const onMapIdle = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter()?.toJSON();
      const zoom = mapRef.current.getZoom();
      if (center && zoom) {
        // Always update the current zoom for marker sizing
        setCurrentZoom(zoom);
        
        // Only update the stored reference if not in calculating distance mode
        if (!isCalculatingDistance) {
          mapStateRef.current = { center, zoom };
        }
      }
    }
  }, [isCalculatingDistance]);

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
    if (!selectedJunkyard?.location) return;
    
    setIsCalculatingDistance(true);
    setDirections(null);
    setDistanceInfo(null);
    setError('Click on the map to select your starting point');
    
    // Center on selected junkyard and set zoom level to show an entire city
    if (mapRef.current) {
      // Calculate offset center point to account for marker position
      const offsetLat = selectedJunkyard.location.lat - 0.0002; // Move down
      const offsetLng = selectedJunkyard.location.lng + 0.00035; // Move right
      
      mapRef.current.panTo({ lat: offsetLat, lng: offsetLng });
      mapRef.current.setZoom(11);
      setCurrentZoom(11);
      mapRef.current.setOptions({ draggableCursor: 'crosshair' });
    }
  }, [selectedJunkyard]);

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

  const handleFilterChange = useCallback((filters: { 
    costRating: number; 
    keyword: string;
    size: string;
    hasInventory: boolean;
    openWeekends: boolean;
    hasPriceList: boolean;
  }) => {
    const filtered = junkyards.filter(junkyard => {
      const matchesCost = Number(junkyard.costRating) <= filters.costRating;
      const matchesKeyword = filters.keyword === '' || 
        junkyard.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        junkyard.city.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        junkyard.state.toLowerCase().includes(filters.keyword.toLowerCase());
      
      const matchesSize = filters.size === 'all' || 
        (filters.size === 'small' && junkyard.estimatedSize < 750) ||
        (filters.size === 'medium' && junkyard.estimatedSize >= 750 && junkyard.estimatedSize < 1500) ||
        (filters.size === 'large' && junkyard.estimatedSize >= 1500);
      
      const matchesInventory = !filters.hasInventory || junkyard.inventoryLink !== '';
      
      const matchesPriceList = !filters.hasPriceList || junkyard.priceListLink !== '';
      
      const matchesWeekend = !filters.openWeekends || 
        (junkyard.hours.saturday !== 'Closed' && junkyard.hours.sunday !== 'Closed');
      
      return matchesCost && matchesKeyword && matchesSize && matchesInventory && matchesPriceList && matchesWeekend;
    });
    setFilteredJunkyards(filtered);
  }, [junkyards]);

  useEffect(() => {
    setFilteredJunkyards(junkyards);
  }, [junkyards]);

  const handleMarkerClick = (junkyard: IJunkyard) => {
    console.log('Marker clicked:', junkyard);
    
    if (isCalculatingDistance) {
      // If in distance calculation mode, calculate distance between selected junkyard and clicked location
      if (selectedJunkyard && junkyard.location) {
        const startLocation = selectedJunkyard.location;
        const endLocation = junkyard.location;

        try {
          // Clear existing route
          clearRoute();

          const directionsService = new google.maps.DirectionsService();
          directionsService.route({
            origin: { lat: startLocation.lat, lng: startLocation.lng },
            destination: { lat: endLocation.lat, lng: endLocation.lng },
            travelMode: google.maps.TravelMode.DRIVING,
          }, (result, status) => {
            if (status === 'OK' && result) {
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
            }
          });
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
      }
    } else {
      // Normal marker click behavior
      // First clear any existing state
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        setDirectionsRenderer(null);
      }
      setDirections(null);
      setDistanceInfo(null);
      setIsCalculatingDistance(false);
      
      // Then set the new selected junkyard
      setSelectedJunkyard(junkyard);
      
      // Center and zoom the map to the clicked junkyard
      if (mapRef.current && junkyard.location) {
        // First set the zoom level
        mapRef.current.setZoom(18); // Zoom in very close to see the exact location
        
        // Calculate offset center point to account for marker position
        const offsetLat = junkyard.location.lat - 0.0002; // Move down
        const offsetLng = junkyard.location.lng + 0.00035; // Move right
        
        // Then pan to the offset location
        mapRef.current.panTo({ lat: offsetLat, lng: offsetLng });
        
        // Update the map state ref
        mapStateRef.current = {
          center: { lat: offsetLat, lng: offsetLng },
          zoom: 18
        };
      }
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedJunkyard(null);
    // Clear any displayed routes
    clearRoute();
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
      const response = await api.post('/junkyards', newJunkyard);
      const addedJunkyard = response.data;
      setJunkyards(prev => [...prev, addedJunkyard]);
      setFilteredJunkyards(prev => [...prev, addedJunkyard]);
      setIsFormOpen(false);
      
      // Center and zoom the map to the new junkyard
      if (mapRef.current && addedJunkyard.location) {
        // First set the zoom level
        mapRef.current.setZoom(18); // Zoom in very close to see the exact location
        
        // Calculate offset center point to account for marker position
        const offsetLat = addedJunkyard.location.lat - 0.0002; // Move down
        const offsetLng = addedJunkyard.location.lng + 0.00035; // Move right (even more)
        
        // Then pan to the offset location
        mapRef.current.panTo({ lat: offsetLat, lng: offsetLng });
        
        // Update the map state ref
        mapStateRef.current = {
          center: { lat: offsetLat, lng: offsetLng },
          zoom: 18
        };
      }
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

  useEffect(() => {
    if (isLoaded && window.google) {
      const size = currentZoom <= 6 ? 8 : 25; // Smaller size for zoomed out view
      const isZoomedOut = currentZoom <= 6;
      
      if (isZoomedOut) {
        // Simple red dot for zoomed out view
        setMarkerIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1,
        } as google.maps.Symbol);
      } else {
        // Original marker design for zoomed in view
        setMarkerIcon({
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF0000"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(size, size),
          anchor: new window.google.maps.Point(size/2, size),
        } as google.maps.Icon);
      }
    }
  }, [isLoaded, currentZoom]);

  const MapMarkers = useMemo(() => {
    return (
      <>
        {filteredJunkyards.map((junkyard) => (
          <Marker
            key={junkyard._id}
            position={junkyard.location}
            onClick={() => handleMarkerClick(junkyard)}
            icon={markerIcon}
            title={junkyard.name}
          />
        ))}
      </>
    );
  }, [filteredJunkyards, handleMarkerClick, markerIcon]);

  const MapContent = useMemo(() => {
    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapStateRef.current.center}
        zoom={mapStateRef.current.zoom}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        onClick={handleMapClick}
        onIdle={onMapIdle}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          mapTypeId: 'hybrid',
          restriction: {
            latLngBounds: {
              north: 85,
              south: -85,
              west: -180,
              east: 180
            }
          }
        }}
      >
        {MapMarkers}
      </GoogleMap>
    );
  }, [onMapLoad, onMapUnmount, handleMapClick, onMapIdle, MapMarkers]);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      mapRef.current.setOptions({
        mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
          position: google.maps.ControlPosition.TOP_RIGHT
        }
      });
    }
  }, [isLoaded]);

  if (loadError) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ mt: 4 }}>
          Error loading Google Maps
        </Typography>
      </Container>
    );
  }

  if (!isLoaded) {
    return (
      <Container>
        <Typography variant="h6" sx={{ mt: 4 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ 
          height: '100vh', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#252525'
        }}>
          <AppBar position="static" sx={{ 
            backgroundColor: '#2D2D2D',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <Toolbar>
              <PushPinIcon sx={{ mr: 1, fontSize: 28, color: '#FFFFFF' }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#FFFFFF' }}>
                Yard Map
              </Typography>
              <Button 
                variant="contained"
                onClick={() => setIsFormOpen(true)}
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#2D2D2D',
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: '#3D3D3D',
                    color: '#FFFFFF',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.12)'
                  },
                  '&:active': {
                    backgroundColor: '#2D2D2D',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }
                }}
              >
                New Yard
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            py: 2,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <Box sx={{ 
                position: 'relative',
                padding: '10px',
                background: '#3D3D3D',
                borderRadius: '8px',
                boxShadow: `
                  0 0 0 1px rgba(0,0,0,0.1)
                `,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}>
                <Box sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  {MapContent}

                  {selectedJunkyard && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: LAYOUT.INFO_OFFSET.BOTTOM,
                        left: LAYOUT.INFO_OFFSET.LEFT,
                        width: '300px',
                        background: '#2D2D2D',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        zIndex: 1000
                      }}
                    >
                      <Button
                        onClick={() => {
                          setSelectedJunkyard(null);
                          setDirections(null);
                          setDistanceInfo(null);
                          setIsCalculatingDistance(false);
                          clearRoute();
                        }}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          minWidth: '32px',
                          height: '32px',
                          padding: 0,
                          fontSize: '20px',
                          color: 'white',
                          zIndex: 1001,
                          pointerEvents: 'auto',
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
                          setIsCalculatingDistance(false);
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
              </Box>
              
              <MapFilters onFilterChange={handleFilterChange} />
            </Box>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;