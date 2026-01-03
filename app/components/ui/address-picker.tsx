import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { firebaseConfig, googleMapsApiKey } from "~/lib/firebase";

const containerStyle = {
    width: "100%",
    height: "250px",
    borderRadius: "0.75rem",
};

// Default center: Lima, Peru
const defaultCenter = {
    lat: -12.046374,
    lng: -77.042793,
};

interface AddressPickerProps {
    onAddressSelect: (address: string, lat: number, lng: number) => void;
    initialAddress?: string;
}

export function AddressPicker({ onAddressSelect, initialAddress }: AddressPickerProps) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: googleMapsApiKey,
        libraries: ["places"],
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [position, setPosition] = useState(defaultCenter);
    const [address, setAddress] = useState(initialAddress || "");
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const newPos = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setPosition(newPos);
                setAddress(place.formatted_address || "");
                onAddressSelect(place.formatted_address || "", newPos.lat, newPos.lng);
                map?.panTo(newPos);
            }
        }
    };

    const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };
            setPosition(newPos);

            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: newPos }, (results, status) => {
                if (status === "OK" && results?.[0]) {
                    const newAddress = results[0].formatted_address;
                    setAddress(newAddress);
                    onAddressSelect(newAddress, newPos.lat, newPos.lng);
                }
            });
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-slate-50/50">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground font-medium text-center">
                    Cargando Google Maps...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="address-search">Buscar Dirección</Label>
                <div className="relative group">
                    <Autocomplete
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={handlePlaceSelect}
                        options={{ componentRestrictions: { country: "pe" } }}
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                id="address-search"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Busca una dirección o mueve el marcador..."
                                className="pl-10 bg-white border-slate-200 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </Autocomplete>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 ml-1">
                    <MapPin className="h-3 w-3 text-secondary" />
                    Puedes ajustar la ubicación moviendo el marcador en el mapa.
                </p>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={position}
                    zoom={15}
                    onLoad={onMapLoad}
                    onUnmount={onUnmount}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                            },
                        ],
                    }}
                >
                    <Marker
                        position={position}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        animation={google.maps.Animation.DROP}
                    />
                </GoogleMap>
            </div>
        </div>
    );
}
