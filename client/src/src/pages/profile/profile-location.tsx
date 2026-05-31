import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material'
import { LatLngExpression } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocationSearchingIcon from '@mui/icons-material/LocationSearching'
import L from 'leaflet'
import DraggableMarker from './draggable-marker'
import { BrowserPosition } from './types'

interface ProfileLocationProps {
    isMapOpened: boolean
    currentPosition: LatLngExpression
    mapRef: React.RefObject<L.Map>
    showRequiredErrors: boolean
    hasGeolocError: boolean
    toggleMap: () => void
    getLocation: () => void
    handlePositionChange: (position: BrowserPosition) => void
}

const ProfileLocation = ({
    isMapOpened,
    currentPosition,
    mapRef,
    showRequiredErrors,
    hasGeolocError,
    toggleMap,
    getLocation,
    handlePositionChange,
}: ProfileLocationProps) => {
    const setMapView = (position: LatLngExpression) => {
        mapRef.current?.setView(position, 13)
    }

    return (
        <Box sx={{ mt: 2 }}>
            {isMapOpened && (
                <div className="mapContainer position-relative">
                    <MapContainer center={currentPosition} zoom={13} style={{ height: '400px', width: '100%' }} ref={mapRef}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <DraggableMarker
                            currentPosition={currentPosition}
                            handlePositionChange={handlePositionChange}
                            setMapView={setMapView}
                        />
                    </MapContainer>
                    <div className="position-absolute bottom-0 end-0" style={{ zIndex: 1000, marginBottom: '64px', marginRight: '10px' }}>
                        <Tooltip title="Center map on selected location">
                            <IconButton
                                aria-label="Center map on selected location"
                                onClick={() => setMapView(currentPosition)}
                                style={{ backgroundColor: 'white', width: '35px', height: '35px' }}
                            >
                                <LocationSearchingIcon style={{ padding: '5px' }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className="position-absolute bottom-0 end-0" style={{ zIndex: 1000, marginBottom: '22px', marginRight: '10px' }}>
                        <Tooltip title="Use my current location">
                            <IconButton
                                aria-label="Use my current location"
                                onClick={getLocation}
                                style={{ backgroundColor: 'white', width: '35px', height: '35px' }}
                            >
                                <LocationOnIcon style={{ padding: '5px' }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            )}
            <Button
                variant="contained"
                color="primary"
                size="small"
                className="mt-2 w-100"
                onClick={toggleMap}
            >
                {isMapOpened ? 'Close map' : 'Open map'}
            </Button>
            {showRequiredErrors && hasGeolocError && (
                <Typography color="error" variant="caption" display="block" mt={1}>
                    Please set your location
                </Typography>
            )}
        </Box>
    )
}

export default ProfileLocation
