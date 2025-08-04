'use client';

import React, { useState } from 'react';
import { useDashboardStore, ColorRule } from '@/lib/store';
import { getColorForValue, predefinedColors } from '@/lib/colors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit3, Plus, Palette, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Sidebar() {
  const {
    polygons,
    selectedPolygon,
    setSelectedPolygon,
    updatePolygon,
    deletePolygon,
    dataSources,
    selectedDataSource,
    setSelectedDataSource,
    sidebarOpen,
    setSidebarOpen,
  } = useDashboardStore();

  const [editingPolygon, setEditingPolygon] = useState<string | null>(null);
  const [newRuleName, setNewRuleName] = useState('');

  const selectedPolygonData = polygons.find(p => p.id === selectedPolygon);

  const addColorRule = () => {
    if (!selectedPolygonData) return;
    
    const newRule: ColorRule = {
      min: 0,
      max: 10,
      color: predefinedColors[selectedPolygonData.colorRules.length % predefinedColors.length],
    };
    
    updatePolygon(selectedPolygonData.id, {
      colorRules: [...selectedPolygonData.colorRules, newRule],
    });
  };

  const updateColorRule = (index: number, updates: Partial<ColorRule>) => {
    if (!selectedPolygonData) return;
    
    const newRules = [...selectedPolygonData.colorRules];
    newRules[index] = { ...newRules[index], ...updates };
    
    updatePolygon(selectedPolygonData.id, { colorRules: newRules });
  };

  const deleteColorRule = (index: number) => {
    if (!selectedPolygonData || selectedPolygonData.colorRules.length <= 1) return;
    
    const newRules = selectedPolygonData.colorRules.filter((_, i) => i !== index);
    updatePolygon(selectedPolygonData.id, { colorRules: newRules });
  };

  const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-8 h-8 p-0">
          <div 
            className="w-4 h-4 rounded-sm border"
            style={{ backgroundColor: color }}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Color</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-2 p-4">
          {predefinedColors.map(predefinedColor => (
            <button
              key={predefinedColor}
              className="w-8 h-8 rounded-sm border-2 hover:scale-110 transition-transform"
              style={{ 
                backgroundColor: predefinedColor,
                borderColor: color === predefinedColor ? '#000' : 'transparent'
              }}
              onClick={() => onChange(predefinedColor)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed left-4 top-1/2 z-50 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-background border-r z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 overflow-y-auto`}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dashboard Controls</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Data Source Selection */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-2 block">Data Source</Label>
            <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map(source => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name} ({source.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Polygons List */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Polygons ({polygons.length})</Label>
            </div>
            
            {polygons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No polygons created yet. Draw one on the map!</p>
            ) : (
              <div className="space-y-2">
                {polygons.map(polygon => (
                  <div
                    key={polygon.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      polygon.id === selectedPolygon 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPolygon(polygon.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: polygon.currentColor || '#6b7280' }}
                        />
                        <span className="text-sm font-medium">{polygon.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPolygon(polygon.id);
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePolygon(polygon.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {polygon.currentValue !== undefined && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {polygon.currentValue.toFixed(1)} {dataSources.find(ds => ds.id === polygon.dataSource)?.unit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Selected Polygon Settings */}
          {selectedPolygonData && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Color Rules</Label>
                <Button variant="outline" size="sm" onClick={addColorRule}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-3">
                {selectedPolygonData.colorRules.map((rule, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ColorPicker 
                          color={rule.color}
                          onChange={(color) => updateColorRule(index, { color })}
                        />
                        <span className="text-xs font-medium">Rule {index + 1}</span>
                      </div>
                      {selectedPolygonData.colorRules.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => deleteColorRule(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Min</Label>
                        <Input
                          type="number"
                          value={rule.min}
                          onChange={(e) => updateColorRule(index, { min: parseFloat(e.target.value) })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max</Label>
                        <Input
                          type="number"
                          value={rule.max}
                          onChange={(e) => updateColorRule(index, { max: parseFloat(e.target.value) })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Source for this polygon */}
              <Separator className="my-4" />
              <Label className="text-sm font-medium mb-2 block">Polygon Data Source</Label>
              <Select 
                value={selectedPolygonData.dataSource} 
                onValueChange={(value) => {
                  const newDataSource = dataSources.find(ds => ds.id === value);
                  if (newDataSource) {
                    updatePolygon(selectedPolygonData.id, {
                      dataSource: value,
                      colorRules: newDataSource.defaultRules,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map(source => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name} ({source.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>
          )}

          {/* Polygon Name Editor */}
          {editingPolygon && (
            <Dialog open={!!editingPolygon} onOpenChange={() => setEditingPolygon(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Polygon Name</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="polygon-name">Polygon Name</Label>
                    <Input
                      id="polygon-name"
                      value={polygons.find(p => p.id === editingPolygon)?.name || ''}
                      onChange={(e) => {
                        if (editingPolygon) {
                          updatePolygon(editingPolygon, { name: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <Button onClick={() => setEditingPolygon(null)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  );
}