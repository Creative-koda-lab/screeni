import { create } from 'zustand';
import type { EditorElement, CanvasSettings } from '@/types/editor';
import type { Template } from '@/data/templates';

interface AlignmentGuide {
  position: number;
  type: 'vertical' | 'horizontal';
}

interface EditorState {
  elements: EditorElement[];
  selectedElementId: string | null;
  canvasSettings: CanvasSettings;
  history: EditorElement[][];
  historyIndex: number;
  alignmentGuides: AlignmentGuide[];
  snapEnabled: boolean;

  // Actions
  addElement: (element: EditorElement) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  duplicateElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  applyTemplate: (template: Template) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  toggleSnap: () => void;
  alignElement: (id: string, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedElementId: null,
  canvasSettings: {
    width: 1200,
    height: 630,
    backgroundType: 'solid',
    backgroundColor: '#ffffff',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#ff6b6b', position: 0 },
        { color: '#feca57', position: 100 },
      ],
    },
    padding: 0,
  },
  history: [[]],
  historyIndex: 0,
  alignmentGuides: [],
  snapEnabled: true,

  addElement: (element) =>
    set((state) => {
      const newElements = [...state.elements, element];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        elements: newElements,
        history: [...newHistory, newElements],
        historyIndex: state.historyIndex + 1,
      };
    }),

  updateElement: (id, updates) =>
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        elements: newElements,
        history: [...newHistory, newElements],
        historyIndex: state.historyIndex + 1,
      };
    }),

  deleteElement: (id) =>
    set((state) => {
      const newElements = state.elements.filter((el) => el.id !== id);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        elements: newElements,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        history: [...newHistory, newElements],
        historyIndex: state.historyIndex + 1,
      };
    }),

  selectElement: (id) => set({ selectedElementId: id }),

  updateCanvasSettings: (settings) =>
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings },
    })),

  clearCanvas: () =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        elements: [],
        selectedElementId: null,
        history: [...newHistory, []],
        historyIndex: state.historyIndex + 1,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          elements: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          elements: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    }),

  duplicateElement: (id) =>
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return state;

      const newElement = {
        ...element,
        id: `element-${Date.now()}`,
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
      };

      const newElements = [...state.elements, newElement];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        elements: newElements,
        history: [...newHistory, newElements],
        historyIndex: state.historyIndex + 1,
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      const maxZIndex = Math.max(...state.elements.map((el) => el.zIndex), 0);
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
        ),
      };
    }),

  sendToBack: (id) =>
    set((state) => {
      const minZIndex = Math.min(...state.elements.map((el) => el.zIndex), 0);
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
        ),
      };
    }),

  applyTemplate: (template) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        canvasSettings: template.canvasSettings,
        elements: template.elements,
        selectedElementId: null,
        history: [...newHistory, template.elements],
        historyIndex: state.historyIndex + 1,
      };
    }),

  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),

  alignElement: (id, alignment) =>
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return state;

      const { width: canvasWidth, height: canvasHeight } = state.canvasSettings;
      let newPosition = { ...element.position };

      switch (alignment) {
        case 'left':
          newPosition.x = 0;
          break;
        case 'center':
          newPosition.x = (canvasWidth - element.size.width) / 2;
          break;
        case 'right':
          newPosition.x = canvasWidth - element.size.width;
          break;
        case 'top':
          newPosition.y = 0;
          break;
        case 'middle':
          newPosition.y = (canvasHeight - element.size.height) / 2;
          break;
        case 'bottom':
          newPosition.y = canvasHeight - element.size.height;
          break;
      }

      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, position: newPosition } : el
      );

      return {
        elements: newElements,
      };
    }),
}));
