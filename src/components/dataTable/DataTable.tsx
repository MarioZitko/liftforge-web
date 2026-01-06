import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPlus,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/buttons/button";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { EditButton } from "@/components/buttons/EditButton";
import { ViewButton } from "@/components/buttons/ViewButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Dropdown from "../dropdown/Dropdown";
import { Input } from "../input/input";
import { DataTableItem, DataTableProps } from "./types";

export function DataTable<T extends DataTableItem>(props: DataTableProps<T>) {
  const {
    data: initialData,
    columns,
    onDataChange,
    enableRowSelection = false,
    onRowSelect,
    onBulkSelect,
    onSearchChange,
    dropdownOptions,
    preselectedDropdownOption,
    onDropdownChange,
    onAddClick,
    onViewClick,
    onEditClick,
    onDeleteClick,
    enableServerPagination = false,
    totalCount = 0,
    pageIndex: externalPageIndex = 0,
    pageSize: externalPageSize = 10,
    onPaginationChange,
    isLoading = false,
    paginationEnabled = true,
  } = props;

  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Use external pagination state if server-side, otherwise use internal
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = enableServerPagination
    ? { pageIndex: externalPageIndex, pageSize: externalPageSize }
    : internalPagination;

  // Calculate page count for server-side pagination
  const pageCount = enableServerPagination
    ? Math.ceil(totalCount / pagination.pageSize)
    : undefined;

  // Create actions column if any action handlers are provided
  const actionsColumn: ColumnDef<T> = React.useMemo(
    () => ({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const hasActions = onViewClick || onEditClick || onDeleteClick;
        if (!hasActions) return null;

        return (
          <div className="flex items-center gap-1">
            {onViewClick && (
              <ViewButton onViewClick={() => onViewClick(row.original)} />
            )}
            {onEditClick && (
              <EditButton onEditClick={() => onEditClick(row.original)} />
            )}
            {onDeleteClick && (
              <DeleteButton onDeleteClick={() => onDeleteClick(row.original)} />
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [onViewClick, onEditClick, onDeleteClick]
  );

  // Filter columns based on enabled features and add actions column
  const filteredColumns = React.useMemo(() => {
    let processedColumns = columns.filter((column) => {
      if (!enableRowSelection && column.id === "select") return false;
      return true;
    });

    // Add actions column if any action handlers are provided
    const hasActions = onViewClick || onEditClick || onDeleteClick;
    if (hasActions) {
      processedColumns = [...processedColumns, actionsColumn];
    }

    return processedColumns;
  }, [
    columns,
    enableRowSelection,
    actionsColumn,
    onViewClick,
    onEditClick,
    onDeleteClick,
  ]);

  // Update internal state when external data changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Notify parent of data changes
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange(data);
    }
  }, [data, onDataChange]);

  // Handle row selection changes
  const handleRowSelectionChange = React.useCallback(
    (updater: any) => {
      setRowSelection((prev) => {
        const newSelection =
          typeof updater === "function" ? updater(prev) : updater;

        if (onRowSelect) {
          const prevKeys = Object.keys(prev);
          const newKeys = Object.keys(newSelection);

          const newlySelected = newKeys.filter(
            (key) => !prevKeys.includes(key) && newSelection[key]
          );
          const newlyDeselected = prevKeys.filter(
            (key) => !newKeys.includes(key) || !newSelection[key]
          );

          newlySelected.forEach((key) => {
            const item = data.find((item) => item.id.toString() === key);
            if (item) onRowSelect(item, true);
          });

          newlyDeselected.forEach((key) => {
            const item = data.find((item) => item.id.toString() === key);
            if (item) onRowSelect(item, false);
          });
        }

        return newSelection;
      });
    },
    [data, onRowSelect]
  );

  // Handle pagination change
  const handlePaginationChange = React.useCallback(
    (updater: any) => {
      if (enableServerPagination && onPaginationChange) {
        const newPagination =
          typeof updater === "function" ? updater(pagination) : updater;
        onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
      } else {
        setInternalPagination(updater);
      }
    },
    [enableServerPagination, onPaginationChange, pagination]
  );

  const table = useReactTable({
    data,
    columns: filteredColumns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableServerPagination
      ? undefined
      : getFilteredRowModel(),
    getPaginationRowModel: enableServerPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: "includesString",
    manualPagination: enableServerPagination,
    manualFiltering: enableServerPagination,
  });

  const handleBulkSelection = React.useCallback(
    (isSelected: boolean) => {
      const currentPageRows = table.getRowModel().rows;
      const currentPageItems = currentPageRows.map((row) => row.original);

      if (onBulkSelect) {
        onBulkSelect(currentPageItems, isSelected);
      }

      table.toggleAllPageRowsSelected(isSelected);
    },
    [table, onBulkSelect]
  );

  const TableContent = (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Spinner className="size-8" />
        </div>
      )}
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                if (header.id === "select" && enableRowSelection) {
                  const isAllSelected = table.getIsAllPageRowsSelected();
                  const isSomeSelected = table.getIsSomePageRowsSelected();
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isAllSelected || isSomeSelected}
                          onCheckedChange={(value) =>
                            handleBulkSelection(!!value)
                          }
                          aria-label="Select all rows on this page"
                          data-state={
                            isSomeSelected && !isAllSelected
                              ? "indeterminate"
                              : undefined
                          }
                        />
                      </div>
                    </TableHead>
                  );
                }
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={filteredColumns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <TabsContent value="outline" className="relative flex flex-col gap-4">
        <div className="flex items-center py-4">
          {!enableServerPagination && onSearchChange && (
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          )}
          {enableServerPagination && onSearchChange && (
            <Input
              placeholder="Search all columns..."
              onChange={(event) => onSearchChange(event.target.value)}
              className="max-w-sm"
            />
          )}
          {onDropdownChange && dropdownOptions && (
            <Dropdown
              options={dropdownOptions}
              selectedValue={preselectedDropdownOption}
              onChange={onDropdownChange}
            />
          )}
          {onAddClick && (
            <Button
              variant="default"
              className="ml-auto flex items-center gap-2"
              onClick={onAddClick}
            >
              <IconPlus size={18} />
              Add
            </Button>
          )}
        </div>
        <div className="overflow-hidden rounded-lg border">{TableContent}</div>
        <div className="flex items-center justify-between">
          {enableRowSelection && (
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {enableServerPagination
                ? totalCount
                : table.getFilteredRowModel().rows.length}{" "}
              row(s) selected.
            </div>
          )}
          {paginationEnabled && (
            <div
              className={`flex items-center gap-8 ${
                enableRowSelection ? "w-full lg:w-fit" : "w-full"
              }`}
            >
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue>{pagination.pageSize}</SelectValue>
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div
                className={`flex items-center gap-2 ${
                  enableRowSelection ? "ml-auto lg:ml-0" : "ml-auto"
                }`}
              >
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
