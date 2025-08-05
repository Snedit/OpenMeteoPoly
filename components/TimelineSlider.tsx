'use client';

import React from 'react';
import { Range, getTrackBackground } from 'react-range';
import { format, addHours, differenceInHours } from 'date-fns';
import { useDashboardStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, RotateCcw } from 'lucide-react';

export function TimelineSlider() {
  const { timeRange, setCurrentHour, setTimeRange } = useDashboardStore();
  
  const totalHours = differenceInHours(timeRange.end, timeRange.start);
 const startOffset = 0;
const endOffset = totalHours;

const [rangeValues, setRangeValues] = React.useState(() => {
  const startOffset = differenceInHours(timeRange.start, timeRange.start);
  const endOffset = differenceInHours(timeRange.end, timeRange.start);
  return [startOffset, endOffset];
});


const handleSliderChange = (values: number[]) => {
  setRangeValues(values);
  const newCurrentHour = addHours(timeRange.start, values[0]);
  setCurrentHour(newCurrentHour); 
};


  
  // const resetToNow = () => {
  //   const now = new Date();
  //   setCurrentHour(now);
  // };
  const resetToNow = () => {
  const now = new Date();
  const start = new Date(now.getTime() ); 
  const end = now;

  setTimeRange({
    start,
    end,
    currentHour: now,
  });

  setRangeValues([0, 2]);
};


  const formatDateLabel = (date: Date) => {
    return format(date, 'MMM dd, HH:mm');
  };
  
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Timeline Control</h3>
        </div>
        <Button variant="outline" size="sm" onClick={resetToNow}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Now
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="px-4">
          <Range
  step={1}
  min={startOffset}
  max={endOffset}
  values={rangeValues}
  onChange={handleSliderChange}
  renderTrack={({ props, children }) => (
    <div
      onMouseDown={props.onMouseDown}
      onTouchStart={props.onTouchStart}
      style={{
        ...props.style,
        height: '36px',
        display: 'flex',
        width: '100%',
      }}
    >
      <div
        ref={props.ref}
        style={{
          height: '8px',
          width: '100%',
          borderRadius: '4px',
          background: getTrackBackground({
            values: rangeValues,
            colors: ['hsl(210, 4%, 89%)', 'hsl(213, 88%, 52%)', 'hsl(210, 4%, 89%)'],
            min: startOffset,
            max: endOffset,
          }),
          alignSelf: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )}
  renderThumb={({ props, isDragged }) => (
    <div
      {...props}
      style={{
        ...props.style,
        height: '24px',
        width: '24px',
        borderRadius: '50%',
        backgroundColor: 'hsl(213, 88%, 52%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: isDragged
          ? '0 8px 25px rgba(0, 0, 0, 0.15)'
          : '0 2px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid white',
        transform: isDragged ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          height: '8px',
          width: '8px',
          backgroundColor: 'white',
          borderRadius: '50%',
        }}
      />
    </div>
  )}
/>

        </div>
        
        <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDateLabel(timeRange.start)}</span>
          </div>
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium">
            {formatDateLabel(timeRange.currentHour)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDateLabel(timeRange.end)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}