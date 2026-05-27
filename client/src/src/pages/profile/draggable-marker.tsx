import { Marker } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import marker from '../../../assets/marker.png'
import { BrowserPosition } from './types'

interface DraggableMarkerProps {
    currentPosition: LatLngExpression
    handlePositionChange: (position: BrowserPosition) => void
    setMapView: (position: LatLngExpression) => void
}

const DraggableMarker = ({ currentPosition, handlePositionChange, setMapView }: DraggableMarkerProps) => {
    return (
        <Marker
            draggable
            icon={L.icon({
                iconUrl: marker,
                iconSize: [60, 60],
            })}
            position={currentPosition}
            eventHandlers={{
                dragend: (event) => {
                    const latLng = event.target.getLatLng()
                    handlePositionChange({ coords: { latitude: latLng.lat, longitude: latLng.lng } })
                    setMapView(latLng)
                },
            }}
        />
    )
}

export default DraggableMarker
