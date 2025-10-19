import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SIZE_PRESETS, GRADIENT_PRESETS } from '@/types/editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export const PropertiesPanel: React.FC = () => {
  const { selectedElementId, elements, updateElement, canvasSettings, updateCanvasSettings } =
    useEditorStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const groupedPresets = SIZE_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, typeof SIZE_PRESETS>);

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto">
      <Tabs defaultValue="canvas" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="element" disabled={!selectedElement}>
            Element
          </TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Canvas Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Preset Sizes</Label>
                <Select
                  value={`${canvasSettings.width}x${canvasSettings.height}`}
                  onValueChange={(value) => {
                    const preset = SIZE_PRESETS.find(
                      (p) => `${p.width}x${p.height}` === value
                    );
                    if (preset) {
                      updateCanvasSettings({
                        width: preset.width,
                        height: preset.height,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedPresets).map(([category, presets]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {presets.map((preset) => (
                          <SelectItem
                            key={preset.name}
                            value={`${preset.width}x${preset.height}`}
                          >
                            {preset.name} ({preset.width} × {preset.height})
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="canvas-width" className="text-xs">
                    Width
                  </Label>
                  <Input
                    id="canvas-width"
                    type="number"
                    value={canvasSettings.width}
                    onChange={(e) =>
                      updateCanvasSettings({ width: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="canvas-height" className="text-xs">
                    Height
                  </Label>
                  <Input
                    id="canvas-height"
                    type="number"
                    value={canvasSettings.height}
                    onChange={(e) =>
                      updateCanvasSettings({ height: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Background Type</Label>
                <Select
                  value={canvasSettings.backgroundType}
                  onValueChange={(value: 'solid' | 'gradient') =>
                    updateCanvasSettings({ backgroundType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {canvasSettings.backgroundType === 'solid' ? (
                <div>
                  <Label htmlFor="bg-color" className="text-xs">
                    Background Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={canvasSettings.backgroundColor}
                      onChange={(e) => updateCanvasSettings({ backgroundColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={canvasSettings.backgroundColor}
                      onChange={(e) => updateCanvasSettings({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Gradient Presets</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {GRADIENT_PRESETS.map((preset) => {
                        const gradientStyle = preset.gradient.type === 'linear'
                          ? `linear-gradient(${preset.gradient.angle}deg, ${preset.gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ')})`
                          : `radial-gradient(circle, ${preset.gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ')})`;

                        return (
                          <button
                            key={preset.name}
                            onClick={() => updateCanvasSettings({ gradient: preset.gradient })}
                            className="h-12 rounded-md border-2 border-border hover:border-primary transition-colors"
                            style={{ background: gradientStyle }}
                            title={preset.name}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {canvasSettings.gradient && (
                    <>
                      <div>
                        <Label className="text-xs">Gradient Type</Label>
                        <Select
                          value={canvasSettings.gradient.type}
                          onValueChange={(value: 'linear' | 'radial') =>
                            updateCanvasSettings({
                              gradient: { ...canvasSettings.gradient!, type: value },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="radial">Radial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {canvasSettings.gradient.type === 'linear' && (
                        <div>
                          <Label className="text-xs">
                            Angle: {canvasSettings.gradient.angle}°
                          </Label>
                          <Slider
                            min={0}
                            max={360}
                            step={1}
                            value={[canvasSettings.gradient.angle]}
                            onValueChange={([value]) =>
                              updateCanvasSettings({
                                gradient: { ...canvasSettings.gradient!, angle: value },
                              })
                            }
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-xs">Colors</Label>
                        {canvasSettings.gradient.colors.map((color, index) => (
                          <div key={index} className="flex gap-2 mt-2 items-center">
                            <Input
                              type="color"
                              value={color.color}
                              onChange={(e) => {
                                const newColors = [...canvasSettings.gradient!.colors];
                                newColors[index] = { ...newColors[index], color: e.target.value };
                                updateCanvasSettings({
                                  gradient: { ...canvasSettings.gradient!, colors: newColors },
                                });
                              }}
                              className="w-16 h-8"
                            />
                            <Input
                              type="number"
                              value={color.position}
                              onChange={(e) => {
                                const newColors = [...canvasSettings.gradient!.colors];
                                newColors[index] = {
                                  ...newColors[index],
                                  position: parseInt(e.target.value) || 0,
                                };
                                updateCanvasSettings({
                                  gradient: { ...canvasSettings.gradient!, colors: newColors },
                                });
                              }}
                              className="w-16"
                            />
                            <span className="text-xs">%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="padding" className="text-xs">
                  Padding: {canvasSettings.padding}px
                </Label>
                <Slider
                  id="padding"
                  min={0}
                  max={100}
                  step={1}
                  value={[canvasSettings.padding]}
                  onValueChange={([value]) => updateCanvasSettings({ padding: value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="element" className="p-4 space-y-4">
          {selectedElement && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Position & Size</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={selectedElement.position.x}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            position: {
                              ...selectedElement.position,
                              x: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={selectedElement.position.y}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            position: {
                              ...selectedElement.position,
                              y: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        value={selectedElement.size.width}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            size: {
                              ...selectedElement.size,
                              width: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input
                        type="number"
                        value={selectedElement.size.height}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            size: {
                              ...selectedElement.size,
                              height: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedElement.type === 'text' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Text Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Content</Label>
                      <Input
                        value={selectedElement.content}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { content: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Font Size: {selectedElement.fontSize}px</Label>
                      <Slider
                        min={12}
                        max={200}
                        step={1}
                        value={[selectedElement.fontSize]}
                        onValueChange={([value]) =>
                          updateElement(selectedElement.id, { fontSize: value })
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { color: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={selectedElement.color}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { color: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Font Weight</Label>
                      <Select
                        value={selectedElement.fontWeight}
                        onValueChange={(value) =>
                          updateElement(selectedElement.id, { fontWeight: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">Light</SelectItem>
                          <SelectItem value="400">Normal</SelectItem>
                          <SelectItem value="500">Medium</SelectItem>
                          <SelectItem value="600">Semi Bold</SelectItem>
                          <SelectItem value="700">Bold</SelectItem>
                          <SelectItem value="800">Extra Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Text Align</Label>
                      <Select
                        value={selectedElement.textAlign}
                        onValueChange={(value: 'left' | 'center' | 'right') =>
                          updateElement(selectedElement.id, { textAlign: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedElement.type === 'shape' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Shape Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedElement.backgroundColor}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { backgroundColor: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={selectedElement.backgroundColor}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { backgroundColor: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedElement.borderColor}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { borderColor: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={selectedElement.borderColor}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { borderColor: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">
                        Border Width: {selectedElement.borderWidth}px
                      </Label>
                      <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={[selectedElement.borderWidth]}
                        onValueChange={([value]) =>
                          updateElement(selectedElement.id, { borderWidth: value })
                        }
                      />
                    </div>

                    {selectedElement.shape === 'rectangle' && (
                      <div>
                        <Label className="text-xs">
                          Border Radius: {selectedElement.borderRadius}px
                        </Label>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[selectedElement.borderRadius]}
                          onValueChange={([value]) =>
                            updateElement(selectedElement.id, { borderRadius: value })
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedElement.type === 'image' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Image Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">
                        Border Radius: {selectedElement.borderRadius}px
                      </Label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[selectedElement.borderRadius]}
                        onValueChange={([value]) =>
                          updateElement(selectedElement.id, { borderRadius: value })
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedElement.borderColor}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { borderColor: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={selectedElement.borderColor}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { borderColor: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">
                        Border Width: {selectedElement.borderWidth}px
                      </Label>
                      <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={[selectedElement.borderWidth]}
                        onValueChange={([value]) =>
                          updateElement(selectedElement.id, { borderWidth: value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
