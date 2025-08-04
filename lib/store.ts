import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ColorRule {
  min: number;
  max: number;
  color: string;
}

export interface DataSource {
  id: string;
  name: string;
  field: string;
  unit: string;
  defaultRules: ColorRule[];
}

export interface Polygon {
  id: string;
  name: string;
  coordinates: [number, number][];
  dataSource: string;
  colorRules: ColorRule[];
  currentValue?: number;
  currentColor?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  currentHour: Date;
}

interface DashboardState {
  // Timeline
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  setCurrentHour: (hour: Date) => void;
  
  // Polygons
  polygons: Polygon[];
  selectedPolygon: string | null;
  addPolygon: (polygon: Omit<Polygon, 'id'>) => void;
  updatePolygon: (id: string, updates: Partial<Polygon>) => void;
  deletePolygon: (id: string) => void;
  setSelectedPolygon: (id: string | null) => void;
  
  // Data sources
  dataSources: DataSource[];
  selectedDataSource: string;
  setSelectedDataSource: (id: string) => void;
  
  // UI state
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const now = new Date();
const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

const defaultDataSources: DataSource[] = [
  {
    id: 'temperature',
    name: 'Temperature',
    field: 'temperature_2m',
    unit: '°C',
    defaultRules: [
      { min: -50, max: 0, color: '#3b82f6' },   // Blue for cold
      { min: 0, max: 15, color: '#10b981' },    // Green for cool
      { min: 15, max: 25, color: '#f59e0b' },   // Yellow for warm
      { min: 25, max: 50, color: '#ef4444' },   // Red for hot
    ],
  },
  {
    id: 'humidity',
    name: 'Relative Humidity',
    field: 'relative_humidity_2m',
    unit: '%',
    defaultRules: [
      { min: 0, max: 30, color: '#ef4444' },    // Red for dry
      { min: 30, max: 60, color: '#10b981' },   // Green for comfortable
      { min: 60, max: 100, color: '#3b82f6' },  // Blue for humid
    ],
  },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Timeline
      timeRange: {
        start: fifteenDaysAgo,
        end: fifteenDaysFromNow,
        currentHour: now,
      },
      setTimeRange: (range) => set({ timeRange: range }),
      setCurrentHour: (hour) => 
        set(state => ({ 
          timeRange: { ...state.timeRange, currentHour: hour } 
        })),
      
      // Polygons
      polygons: [],
      selectedPolygon: null,
      addPolygon: (polygon) => {
        const id = `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newPolygon = { ...polygon, id };
        set(state => ({ 
          polygons: [...state.polygons, newPolygon],
          selectedPolygon: id,
        }));
      },
      updatePolygon: (id, updates) =>
        set(state => ({
          polygons: state.polygons.map(p => 
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deletePolygon: (id) =>
        set(state => ({
          polygons: state.polygons.filter(p => p.id !== id),
          selectedPolygon: state.selectedPolygon === id ? null : state.selectedPolygon,
        })),
      setSelectedPolygon: (id) => set({ selectedPolygon: id }),
      
      // Data sources
      dataSources: defaultDataSources,
      selectedDataSource: 'temperature',
      setSelectedDataSource: (id) => set({ selectedDataSource: id }),
      
      // UI state
      isDrawing: false,
      setIsDrawing: (drawing) => set({ isDrawing: drawing }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'weather-dashboard',
      partialize: (state) => ({
        polygons: state.polygons,
        selectedDataSource: state.selectedDataSource,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);