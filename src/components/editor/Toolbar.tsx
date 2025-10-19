import React, { useRef, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Download,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyEnd,
  Magnet
} from 'lucide-react';
import { toPng } from 'html-to-image';
import type { TextElement, ImageElement, ShapeElement } from '@/types/editor';
import { TEMPLATES } from '@/data/templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ToolbarProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const Toolbar: React.FC<ToolbarProps> = ({ canvasRef }) => {
  const {
    addElement,
    deleteElement,
    selectedElementId,
    duplicateElement,
    undo,
    redo,
    applyTemplate,
    alignElement,
    snapEnabled,
    toggleSnap,
  } = useEditorStore();

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addText = () => {
    const textElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Double click to edit',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 80 },
      fontSize: 32,
      fontWeight: '600',
      color: '#000000',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'left',
      zIndex: 1,
    };
    addElement(textElement);
  };

  const addShape = (shape: 'rectangle' | 'circle') => {
    const shapeElement: ShapeElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shape,
      position: { x: 150, y: 150 },
      size: { width: 200, height: 200 },
      backgroundColor: '#3b82f6',
      borderColor: '#1e40af',
      borderWidth: 0,
      borderRadius: shape === 'rectangle' ? 8 : 0,
      zIndex: 0,
    };
    addElement(shapeElement);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;

      // Create a temporary image to get original dimensions
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        // Scale down if too large
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            width = maxSize;
            height = maxSize / aspectRatio;
          } else {
            height = maxSize;
            width = maxSize * aspectRatio;
          }
        }

        const imageElement: ImageElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          url,
          alt: file.name,
          position: { x: 100, y: 100 },
          size: { width, height },
          borderRadius: 0,
          borderWidth: 0,
          borderColor: '#000000',
          zIndex: 0,
        };
        addElement(imageElement);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const exportToPNG = async (scale = 2) => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1.0,
        pixelRatio: scale,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
    }
  };

  const groupedTemplates = TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof TEMPLATES>);

  const handleApplyTemplate = (template: typeof TEMPLATES[0]) => {
    applyTemplate(template);
    setTemplateDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-card border-r border-border">
      <div className="text-sm font-semibold text-foreground mb-2">Templates</div>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="w-full justify-start gap-2">
            <Layers size={18} />
            <span>Choose Template</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Select a pre-designed template to get started quickly
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">{category}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => {
                    const gradientStyle = template.canvasSettings.backgroundType === 'gradient' && template.canvasSettings.gradient
                      ? template.canvasSettings.gradient.type === 'linear'
                        ? `linear-gradient(${template.canvasSettings.gradient.angle}deg, ${template.canvasSettings.gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ')})`
                        : `radial-gradient(circle, ${template.canvasSettings.gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ')})`
                      : template.canvasSettings.backgroundColor;

                    return (
                      <button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template)}
                        className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all duration-200 aspect-video"
                      >
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: gradientStyle,
                          }}
                        >
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-2">
                            {template.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="h-px bg-border my-2" />
      <div className="text-sm font-semibold text-foreground mb-2">Add Elements</div>

      <Button onClick={addText} variant="outline" className="w-full justify-start gap-2">
        <Type size={18} />
        <span>Text</span>
      </Button>

      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="w-full justify-start gap-2"
      >
        <ImageIcon size={18} />
        <span>Image</span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <Button
        onClick={() => addShape('rectangle')}
        variant="outline"
        className="w-full justify-start gap-2"
      >
        <Square size={18} />
        <span>Rectangle</span>
      </Button>

      <Button
        onClick={() => addShape('circle')}
        variant="outline"
        className="w-full justify-start gap-2"
      >
        <Circle size={18} />
        <span>Circle</span>
      </Button>

      <div className="h-px bg-gray-200 my-2" />
      <div className="text-sm font-semibold text-gray-700 mb-2">Actions</div>

      <Button onClick={undo} variant="outline" className="w-full justify-start gap-2">
        <Undo2 size={18} />
        <span>Undo</span>
      </Button>

      <Button onClick={redo} variant="outline" className="w-full justify-start gap-2">
        <Redo2 size={18} />
        <span>Redo</span>
      </Button>

      <Button
        onClick={toggleSnap}
        variant={snapEnabled ? "default" : "outline"}
        className="w-full justify-start gap-2"
      >
        <Magnet size={18} />
        <span>Snap {snapEnabled ? 'On' : 'Off'}</span>
      </Button>

      {selectedElementId && (
        <>
          <div className="h-px bg-border my-2" />
          <div className="text-sm font-semibold text-foreground mb-2">Align</div>

          <div className="grid grid-cols-3 gap-1">
            <Button
              onClick={() => alignElement(selectedElementId, 'left')}
              variant="outline"
              size="sm"
              className="p-2"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </Button>
            <Button
              onClick={() => alignElement(selectedElementId, 'center')}
              variant="outline"
              size="sm"
              className="p-2"
              title="Align Center"
            >
              <AlignHorizontalJustifyCenter size={16} />
            </Button>
            <Button
              onClick={() => alignElement(selectedElementId, 'right')}
              variant="outline"
              size="sm"
              className="p-2"
              title="Align Right"
            >
              <AlignRight size={16} />
            </Button>
            <Button
              onClick={() => alignElement(selectedElementId, 'top')}
              variant="outline"
              size="sm"
              className="p-2"
              title="Align Top"
            >
              <AlignCenter size={16} className="rotate-90" />
            </Button>
            <Button
              onClick={() => alignElement(selectedElementId, 'middle')}
              variant="outline"
              size="sm"
              className="p-2"
              title="Align Middle"
            >
              <AlignVerticalJustifyCenter size={16} />
            </Button>
            <Button
              onClick={() => alignElement(selectedElementId, 'bottom')}
              variant="outline"
              size="sm"
              className="p-2"
              title="Align Bottom"
            >
              <AlignVerticalJustifyEnd size={16} />
            </Button>
          </div>

          <div className="h-px bg-border my-2" />
          <div className="text-sm font-semibold text-foreground mb-2">Element</div>

          <Button
            onClick={() => duplicateElement(selectedElementId)}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Copy size={18} />
            <span>Duplicate</span>
          </Button>

          <Button
            onClick={() => deleteElement(selectedElementId)}
            variant="destructive"
            className="w-full justify-start gap-2"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </Button>
        </>
      )}

      <div className="h-px bg-border my-2" />
      <div className="text-sm font-semibold text-foreground mb-2">Export</div>

      <Button onClick={() => exportToPNG(2)} className="w-full justify-start gap-2">
        <Download size={18} />
        <span>Export PNG (2x)</span>
      </Button>

      <Button onClick={() => exportToPNG(3)} variant="outline" className="w-full justify-start gap-2">
        <Download size={18} />
        <span>Export PNG (3x)</span>
      </Button>
    </div>
  );
};
