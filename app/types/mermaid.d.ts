declare module 'mermaid' {
  interface MermaidAPI {
    initialize: (config: MermaidConfig) => void;
    render: (
      id: string,
      text: string,
      container?: Element | null,
      cb?: (svgCode: string, bindFunctions: (element: Element) => void) => void
    ) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>;
    contentLoaded: () => void;
    parse: (text: string, cb?: (parseError: Error) => void) => void;
    parseError: (error: Error, hash: Record<string, unknown>) => void;
  }

  interface MermaidConfig {
    theme?: 'default' | 'forest' | 'dark' | 'neutral' | string;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal' | number;
    securityLevel?: 'strict' | 'loose' | 'antiscript';
    startOnLoad?: boolean;
    arrowMarkerAbsolute?: boolean;
    flowchart?: Record<string, unknown>;
    sequence?: Record<string, unknown>;
    gantt?: Record<string, unknown>;
    journey?: Record<string, unknown>;
    er?: Record<string, unknown>;
    pie?: Record<string, unknown>;
    fontFamily?: string;
  }

  const mermaid: MermaidAPI;
  export default mermaid;
}

declare module 'framer-motion' {
  import { ComponentType, CSSProperties, ReactNode, RefObject } from 'react';

  export interface AnimatePresenceProps {
    children: ReactNode;
    exitBeforeEnter?: boolean;
    initial?: boolean;
    mode?: 'sync' | 'wait' | 'popLayout';
    onExitComplete?: () => void;
  }

  export const AnimatePresence: ComponentType<AnimatePresenceProps>;

  export type Variant = {
    [key: string]: string | number;
  };

  export type Variants = {
    [key: string]: Variant;
  };

  export interface MotionProps {
    initial?: boolean | Variant;
    animate?: Variant;
    exit?: Variant;
    transition?: {
      duration?: number;
      delay?: number;
      ease?: string | number[];
      type?: string;
      staggerChildren?: number;
      staggerDirection?: number;
      when?: 'beforeChildren' | 'afterChildren';
    };
    variants?: Variants;
    style?: CSSProperties;
    className?: string;
    key?: string | number;
    ref?: RefObject<HTMLElement>;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface MotionValues {
    [key: string]: MotionValue;
  }

  export type MotionValue = any;

  export const motion: {
    div: ComponentType<MotionProps>;
    span: ComponentType<MotionProps>;
    svg: ComponentType<MotionProps>;
    path: ComponentType<MotionProps>;
    circle: ComponentType<MotionProps>;
    [key: string]: ComponentType<MotionProps>;
  };
} 