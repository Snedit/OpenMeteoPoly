'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { useDashboardStore } from '@/lib/store';
import { fetchWeatherData, getPolygonCentroid, getValueForTime } from '@/lib/api';
import { getColorForValue, hexToRgba } from '@/lib/colors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Square, RotateCcw } from 'lucide-react';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function Map() {
  const mapRef = useRef<L.Map | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const polygonLayersRef = useRef<{ [key: string]: L.Polygon }>({});
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  
  const {
    polygons,
    selectedPolygon,
    addPolygon,
    updatePolygon,
    deletePolygon,
    setSelectedPolygon,
    isDrawing,
    setIsDrawing,
    dataSources,
    selectedDataSource,
    timeRange,
  } = useDashboardStore();


  useEffect(() => {
  if (!mapContainer || mapRef.current) return;

  const initializeMap = (lat: number, lng: number) => {
    const map = L.map(mapContainer, {
      center: [lat, lng],
      zoom: 10,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

   
    L.control.zoom({ position: 'topright' }).addTo(map);

    
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: '#3b82f6',
            weight: 2,
            fillOpacity: 0.3,
          },
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: new L.FeatureGroup(),
        edit: true,
        remove: true,
      },
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

   
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      const coordinates = layer.getLatLngs()[0].map((latlng: L.LatLng) => [
        latlng.lng,
        latlng.lat,
      ] as [number, number]);

      if (coordinates.length >= 3 && coordinates.length <= 12) {
        const currentDataSource = dataSources.find(ds => ds.id === selectedDataSource);
        addPolygon({
          name: `Polygon ${polygons.length + 1}`,
          coordinates,
          dataSource: selectedDataSource,
          colorRules: currentDataSource?.defaultRules || [],
        });
      }

      setIsDrawing(false);
    });

    map.on(L.Draw.Event.DRAWSTART, () => {
      setIsDrawing(true);
    });

    mapRef.current = map;
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      initializeMap(latitude, longitude);
    },
    (error) => {
      console.warn('Geolocation failed or was denied, falling back to NYC.', error);
      initializeMap(22.68944, 88.44594); // Fallback to New York City
    }
  );

  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };
}, [mapContainer]);

 
  useEffect(() => {
    if (!mapRef.current) return;

 
    Object.values(polygonLayersRef.current).forEach(layer => {
      mapRef.current?.removeLayer(layer);
    });
    polygonLayersRef.current = {};

   
    polygons.forEach(polygon => {
      const latLngs = polygon.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      
      const polygonLayer = L.polygon(latLngs, {
        color: polygon.currentColor || '#3b82f6',
        weight: polygon.id === selectedPolygon ? 3 : 2,
        fillColor: polygon.currentColor || '#3b82f6',
        fillOpacity: 0.3,
      });

      polygonLayer.bindPopup(`
        <div>
          <h4>${polygon.name}</h4>
          <p>Data Source: ${dataSources.find(ds => ds.id === polygon.dataSource)?.name}</p>
          ${polygon.currentValue !== undefined ? 
            `<p>Current Value: ${polygon.currentValue.toFixed(1)} ${dataSources.find(ds => ds.id === polygon.dataSource)?.unit}</p>` 
            : ''
          }
        </div>
      `);

      polygonLayer.on('click', () => {
        setSelectedPolygon(polygon.id);
      });

      polygonLayer.addTo(mapRef.current!);
      polygonLayersRef.current[polygon.id] = polygonLayer;
    });
  }, [polygons, selectedPolygon, dataSources]);

  
  useEffect(() => {
    const updatePolygonData = async () => {
      for (const polygon of polygons) {
        try {
          const centroid = getPolygonCentroid(polygon.coordinates);
          const data = await fetchWeatherData(
            centroid[1], // lat
            centroid[0], // lng
            timeRange.currentHour,
            timeRange.currentHour
          );

          const dataSource = dataSources.find(ds => ds.id === polygon.dataSource);
          if (!dataSource) continue;

          const value = getValueForTime(data, dataSource.field as any, timeRange.currentHour);
          if (value === null) continue;

          const color = getColorForValue(value, polygon.colorRules);
          
          updatePolygon(polygon.id, {
            currentValue: value,
            currentColor: color,
          });

         
          const layer = polygonLayersRef.current[polygon.id];
          if (layer) {
            layer.setStyle({
              color: color,
              fillColor: color,
            });
          }
        } catch (error) {
          console.error(`Error updating polygon ${polygon.id}:`, error);
        }
      }
    };

    if (polygons.length > 0) {
      updatePolygonData();
    }
  }, [timeRange.currentHour, polygons.length]);

  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.setView([22.68944, 88.44594], 10);
    }
  };

  return (
    <Card className="flex-1 overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Interactive Map</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isDrawing ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const drawControl = drawControlRef.current;
                if (drawControl && mapRef.current) {
                  if (!isDrawing) {
                    
                    const handler = new (L.Draw as any).Polygon(mapRef.current, drawControl.options.draw.polygon);
                    handler.enable();
                  }
                }
              }}
            >
              <Square className="h-4 w-4 mr-2" />
              {isDrawing ? 'Drawing...' : 'Draw Polygon'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetMapView}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
          </div>
        </div>
      </div>
      <div 
        ref={setMapContainer}
        className="w-full h-[600px]"
      />
    </Card>
  );
}