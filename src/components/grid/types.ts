export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface IBreakpoints {
  xs?: GridColumns;
  sm?: GridColumns;
  md?: GridColumns;
  lg?: GridColumns;
  xl?: GridColumns;
}

export interface IGridContainerProps extends React.HTMLAttributes<HTMLDivElement>, IBreakpoints {
  spacing?: number;
  rounded?: string;
  border?: boolean;
  padding?: number;
  margin?: number;
  children: React.ReactNode;
}

export interface IGridItemProps extends React.HTMLAttributes<HTMLDivElement>, IBreakpoints {
  children?: React.ReactNode;
  className?: string;
  rounded?: string;
  border?: boolean;
  spacing?: number;
  padding?: number;
  margin?: number;
  style?: React.CSSProperties;
  // New layout props
  direction?: 'row' | 'column';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number;
  wrap?: boolean;
}
