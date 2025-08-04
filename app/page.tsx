'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TimelineSlider } from '@/components/TimelineSlider';
import { Sidebar } from '@/components/Sidebar';
import { useDashboardStore } from '@/lib/store';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map').then(mod => ({ default: mod.Map })), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Dashboard() {
  const { sidebarOpen } = useDashboardStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-80' : 'ml-0'
      } p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Weather Data Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Interactive visualization of weather data over time and geographic regions
            </p>
          </div>

          {/* Timeline Control */}
          <TimelineSlider />

          {/* Main Content */}
          <div className="flex gap-6 min-h-[600px]">
            <Map />
          </div>

          {/* Status Bar */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  Polygons: <strong>{useDashboardStore.getState().polygons.length}</strong>
                </span>
                <span className="text-muted-foreground">
                  Data Source: <strong>{useDashboardStore.getState().dataSources.find(ds => ds.id === useDashboardStore.getState().selectedDataSource)?.name}</strong>
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Powered by Open-Meteo API
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}