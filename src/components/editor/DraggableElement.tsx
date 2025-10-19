import React, { useRef, useState, useEffect } from 'react';
import type { EditorElement } from '@/types/editor';
import { useEditorStore } from '@/store/editorStore';

interface DraggableElementProps {
  element: EditorElement;
  children: React.ReactNode;
}

type ResizeHandle =
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | 'top' | 'bottom' | 'left' | 'right';

const SNAP_THRESHOLD = 5; // pixels

export const DraggableElement: React.FC<DraggableElementProps> = ({ element, children }) => {
  const {
    updateElement,
    selectElement,
    selectedElementId,
    elements,
    canvasSettings,
    snapEnabled,
    setAlignmentGuides
  } = useEditorStore();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  const isSelected = selectedElementId === element.id;

  const findAlignmentGuides = (x: number, y: number, width: number, height: number) => {
    if (!snapEnabled) return { snappedX: x, snappedY: y, guides: [] };

    const guides: Array<{ position: number; type: 'vertical' | 'horizontal' }> = [];
    let snappedX = x;
    let snappedY = y;

    const elementCenterX = x + width / 2;
    const elementCenterY = y + height / 2;
    const elementRight = x + width;
    const elementBottom = y + height;

    // Canvas center guides
    const canvasCenterX = canvasSettings.width / 2;
    const canvasCenterY = canvasSettings.height / 2;

    // Check canvas center alignment
    if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      snappedX = canvasCenterX - width / 2;
      guides.push({ position: canvasCenterX, type: 'vertical' });
    }
    if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      snappedY = canvasCenterY - height / 2;
      guides.push({ position: canvasCenterY, type: 'horizontal' });
    }

    // Check alignment with other elements
    elements.forEach((other) => {
      if (other.id === element.id) return;

      const otherCenterX = other.position.x + other.size.width / 2;
      const otherCenterY = other.position.y + other.size.height / 2;
      const otherRight = other.position.x + other.size.width;
      const otherBottom = other.position.y + other.size.height;

      // Vertical alignments
      if (Math.abs(x - other.position.x) < SNAP_THRESHOLD) {
        snappedX = other.position.x;
        guides.push({ position: other.position.x, type: 'vertical' });
      } else if (Math.abs(elementRight - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight - width;
        guides.push({ position: otherRight, type: 'vertical' });
      } else if (Math.abs(elementCenterX - otherCenterX) < SNAP_THRESHOLD) {
        snappedX = otherCenterX - width / 2;
        guides.push({ position: otherCenterX, type: 'vertical' });
      }

      // Horizontal alignments
      if (Math.abs(y - other.position.y) < SNAP_THRESHOLD) {
        snappedY = other.position.y;
        guides.push({ position: other.position.y, type: 'horizontal' });
      } else if (Math.abs(elementBottom - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom - height;
        guides.push({ position: otherBottom, type: 'horizontal' });
      } else if (Math.abs(elementCenterY - otherCenterY) < SNAP_THRESHOLD) {
        snappedY = otherCenterY - height / 2;
        guides.push({ position: otherCenterY, type: 'horizontal' });
      }
    });

    return { snappedX, snappedY, guides };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    const handle = target.getAttribute('data-handle') as ResizeHandle;
    if (handle) {
      handleResizeStart(e, handle);
      return;
    }

    e.stopPropagation();
    selectElement(element.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
      posX: element.position.x,
      posY: element.position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;

        // Apply snapping
        const { snappedX, snappedY, guides } = findAlignmentGuides(
          newX,
          newY,
          element.size.width,
          element.size.height
        );
        newX = snappedX;
        newY = snappedY;
        setAlignmentGuides(guides);

        updateElement(element.id, {
          position: { x: Math.max(0, newX), y: Math.max(0, newY) },
        });
      }

      if (isResizing && resizeHandle) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const aspectRatio = resizeStart.width / resizeStart.height;
        const isCornerHandle = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(resizeHandle);
        const isImageElement = element.type === 'image';

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        // For images, preserve aspect ratio on corner handles
        if (isCornerHandle && isImageElement) {
          // Calculate new dimensions while preserving aspect ratio
          if (resizeHandle === 'bottom-right') {
            newWidth = Math.max(50, resizeStart.width + deltaX);
            newHeight = newWidth / aspectRatio;
          } else if (resizeHandle === 'top-left') {
            newWidth = Math.max(50, resizeStart.width - deltaX);
            newHeight = newWidth / aspectRatio;
            newX = resizeStart.posX + (resizeStart.width - newWidth);
            newY = resizeStart.posY + (resizeStart.height - newHeight);
          } else if (resizeHandle === 'top-right') {
            newWidth = Math.max(50, resizeStart.width + deltaX);
            newHeight = newWidth / aspectRatio;
            newY = resizeStart.posY + (resizeStart.height - newHeight);
          } else if (resizeHandle === 'bottom-left') {
            newWidth = Math.max(50, resizeStart.width - deltaX);
            newHeight = newWidth / aspectRatio;
            newX = resizeStart.posX + (resizeStart.width - newWidth);
          }
        } else {
          // Free resize for non-corner handles or non-image elements
          switch (resizeHandle) {
            case 'bottom-right':
              newWidth = Math.max(50, resizeStart.width + deltaX);
              newHeight = Math.max(50, resizeStart.height + deltaY);
              break;
            case 'top-left':
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(50, resizeStart.height - deltaY);
              newX = resizeStart.posX + (resizeStart.width - newWidth);
              newY = resizeStart.posY + (resizeStart.height - newHeight);
              break;
            case 'top-right':
              newWidth = Math.max(50, resizeStart.width + deltaX);
              newHeight = Math.max(50, resizeStart.height - deltaY);
              newY = resizeStart.posY + (resizeStart.height - newHeight);
              break;
            case 'bottom-left':
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(50, resizeStart.height + deltaY);
              newX = resizeStart.posX + (resizeStart.width - newWidth);
              break;
            case 'top':
              newHeight = Math.max(50, resizeStart.height - deltaY);
              newY = resizeStart.posY + (resizeStart.height - newHeight);
              break;
            case 'bottom':
              newHeight = Math.max(50, resizeStart.height + deltaY);
              break;
            case 'left':
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newX = resizeStart.posX + (resizeStart.width - newWidth);
              break;
            case 'right':
              newWidth = Math.max(50, resizeStart.width + deltaX);
              break;
          }
        }

        updateElement(element.id, {
          size: { width: newWidth, height: newHeight },
          position: { x: newX, y: newY },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setAlignmentGuides([]);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, resizeHandle, element, updateElement, elements, canvasSettings, snapEnabled, setAlignmentGuides, findAlignmentGuides]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        outline: isSelected ? '1px dashed #3b82f6' : 'none',
        outlineOffset: '4px',
      }}
      className="group"
    >
      {children}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            data-handle="bottom-right"
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(50%, 50%)' }}
          />
          <div
            data-handle="top-right"
            className="absolute top-0 right-0 w-4 h-4 bg-blue-500 cursor-nesw-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(50%, -50%)' }}
          />
          <div
            data-handle="bottom-left"
            className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 cursor-nesw-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(-50%, 50%)' }}
          />
          <div
            data-handle="top-left"
            className="absolute top-0 left-0 w-4 h-4 bg-blue-500 cursor-nwse-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          {/* Edge handles */}
          <div
            data-handle="top"
            className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500 cursor-ns-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <div
            data-handle="bottom"
            className="absolute bottom-0 left-1/2 w-4 h-4 bg-blue-500 cursor-ns-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(-50%, 50%)' }}
          />
          <div
            data-handle="left"
            className="absolute top-1/2 left-0 w-4 h-4 bg-blue-500 cursor-ew-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <div
            data-handle="right"
            className="absolute top-1/2 right-0 w-4 h-4 bg-blue-500 cursor-ew-resize rounded-full border-2 border-white shadow-md"
            style={{ transform: 'translate(50%, -50%)' }}
          />
        </>
      )}
    </div>
  );
};
