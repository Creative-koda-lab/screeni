import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { TextElement } from './TextElement';
import { ImageElement } from './ImageElement';
import { ShapeElement } from './ShapeElement';
import { AlignmentGuides } from './AlignmentGuides';
import type { EditorElement } from '@/types/editor';

interface CanvasProps {
  scale?: number;
}

export const Canvas = React.forwardRef<HTMLDivElement, CanvasProps>(({ scale: propScale }, ref) => {
  const { elements, canvasSettings, selectElement } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);

  // Calculate auto-scale to fit canvas in viewport
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      // Account for padding (8 * 8px = 64px on each side)
      const availableWidth = containerWidth - 64;
      const availableHeight = containerHeight - 64;

      const scaleX = availableWidth / canvasSettings.width;
      const scaleY = availableHeight / canvasSettings.height;

      // Use the smaller scale to ensure canvas fits in both dimensions
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      setAutoScale(newScale);
    };

    calculateScale();

    // Recalculate on window resize
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [canvasSettings.width, canvasSettings.height]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  const renderElement = (element: EditorElement) => {
    switch (element.type) {
      case 'text':
        return <TextElement key={element.id} element={element} />;
      case 'image':
        return <ImageElement key={element.id} element={element} />;
      case 'shape':
        return <ShapeElement key={element.id} element={element} />;
      default:
        return null;
    }
  };

  const getBackgroundStyle = () => {
    if (canvasSettings.backgroundType === 'gradient' && canvasSettings.gradient) {
      const { type, angle, colors } = canvasSettings.gradient;
      const colorStops = colors
        .map((c) => `${c.color} ${c.position}%`)
        .join(', ');

      if (type === 'linear') {
        return `linear-gradient(${angle}deg, ${colorStops})`;
      } else {
        return `radial-gradient(circle, ${colorStops})`;
      }
    }
    return undefined;
  };

  const backgroundImage = getBackgroundStyle();
  const finalScale = propScale || autoScale;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center p-8 bg-muted overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    >
      <div
        ref={ref}
        onClick={handleCanvasClick}
        style={{
          width: canvasSettings.width,
          height: canvasSettings.height,
          backgroundColor: canvasSettings.backgroundType === 'solid'
            ? canvasSettings.backgroundColor
            : undefined,
          backgroundImage: backgroundImage || (canvasSettings.backgroundImage
            ? `url(${canvasSettings.backgroundImage})`
            : undefined),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: canvasSettings.padding,
          position: 'relative',
          overflow: 'hidden',
          transform: `scale(${finalScale})`,
          transformOrigin: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-out',
        }}
        className="canvas-container"
      >
        {elements.map(renderElement)}
        <AlignmentGuides />
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
