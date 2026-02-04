import { ColumnDef } from '@tanstack/react-table';

export interface DataTableItem {
  id: string | number;
  [key: string]: any;
}

// Base interface for sortable items (requires sortOrder)
export interface SortableDataTableItem extends DataTableItem {
  sortOrder: number;
}

// Helper type to check if T has sortOrder property
type HasSortOrder<T> = T extends { sortOrder: number } ? true : false;

// Conditional typing based on onSort presence
type SortingProps<T extends DataTableItem> =
  | {
      onSort?: never; // No onSort callback
    }
  | ({
      onSort: (item: T, newSortOrder: number) => void; // onSort required
    } & (HasSortOrder<T> extends true ? {} : never)); // Ensures T has sortOrder when onSort is used

type SelectionProps<T extends DataTableItem> =
  | {
      enableRowSelection?: false;
      onRowSelect?: never;
      onBulkSelect?: never;
    }
  | {
      enableRowSelection: true;
      onRowSelect?: (item: T, isSelected: boolean) => void;
      onBulkSelect?: (items: T[], isSelected: boolean) => void;
    };

type ActionProps<T extends DataTableItem> = {
  onViewClick?: (item: T) => void;
  onEditClick?: (item: T) => void;
  onDeleteClick?: (item: T) => void;
};

// Server-side pagination props
type PaginationProps = {
  paginationEnabled?: boolean;
  enableServerPagination?: boolean;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
};

export type DataTableProps<T extends DataTableItem> = {
  data: T[];
  columns: ColumnDef<T>[];
  onDataChange?: (data: T[]) => void;
  onSearchChange?: (value: string) => void;
  dropdownOptions?: { label: string; value: string | number }[];
  preselectedDropdownOption?: string | number;
  onDropdownChange?: (option: string | number) => void;
  onAddClick?: () => void;
  isLoading?: boolean;
} & SortingProps<T> &
  SelectionProps<T> &
  ActionProps<T> &
  PaginationProps;
