import AddButton from '@/components/buttons/AddButton';
import CopyButton from '@/components/buttons/CopyButton';
import { Typography } from '@/components/typography/Typography';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { IHasSortOrder, IHasUuid } from '@/types/global';
import { closestCenter, DndContext, DragEndEvent, MouseSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Key, useEffect, useState } from 'react';
import SortableListItem from './SortableListItem';
import { ISortableListProps, sortableListVariants } from './types';

export default function SortableList<T extends IHasUuid & IHasSortOrder>({
  title,
  listItems,
  selectedItemIndex,
  listItemRenderField,
  listItemUniqueIdField = 'uuid',
  listCheckedItemIndexes,
  onAddClick,
  onCopyClick,
  onItemClick,
  onItemCheckboxClick,
  onItemEditClick,
  onItemDeleteClick,
  onSort,
  className,
  variant,
  size,
  ...props
}: ISortableListProps<T>) {
  // ==================================|| STATE ||================================== //
  const [checkedItemIndexes, setCheckedItemIndexes] = useState<number[]>([]);
  const [sortedListItems, setSortedListItems] = useState<T[]>([]);

  // ==================================|| UTILITY ||================================== //
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor);

  // ==================================|| FUNCTIONS ||================================== //
  const handleItemSelect = (clickedItem: T, clickedItemIndex: number) => {
    onItemClick && onItemClick(clickedItem, clickedItemIndex);
  };

  const handleItemCheckboxClick = (clickedItemIndex: number) => {
    let updatedCheckedItemIndexes: number[] = [];

    setCheckedItemIndexes((prevCheckedIndexes) => {
      if (prevCheckedIndexes.includes(clickedItemIndex)) {
        // If the index is already in the array, remove it
        updatedCheckedItemIndexes = prevCheckedIndexes.filter((index) => index !== clickedItemIndex);
      } else {
        // If the index is not in the array, add it
        updatedCheckedItemIndexes = [...prevCheckedIndexes, clickedItemIndex];
      }
      return updatedCheckedItemIndexes;
    });

    // Pass new checked indexes to parent
    onItemCheckboxClick && onItemCheckboxClick(clickedItemIndex);
  };

  const handleAddItem = () => {
    onAddClick && onAddClick();
  };

  const handleItemEditClick = (e: React.MouseEvent<HTMLButtonElement>, item: T, clickedItemIndex: number) => {
    e.stopPropagation();
    onItemEditClick && onItemEditClick(item, clickedItemIndex);
  };

  const handleItemDeleteClick = (e: React.MouseEvent<HTMLButtonElement>, clickedItemIndex: number) => {
    e.stopPropagation();
    onItemDeleteClick && onItemDeleteClick(clickedItemIndex);
  };

  const reorderOnDragHandler = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over?.id) {
      const activeIndex = listItems!.findIndex((item) => item[listItemUniqueIdField] === active.id);
      const overIndex = listItems!.findIndex((item) => item[listItemUniqueIdField] === over.id);

      onSort && onSort(arrayMove(listItems!, activeIndex, overIndex));
    }
  };

  // ==================================|| EFFECT ||================================== //

  useEffect(() => {
    if (listCheckedItemIndexes) {
      setCheckedItemIndexes(listCheckedItemIndexes);
    }
  }, [listCheckedItemIndexes]);

  useEffect(() => {
    if (listItems && Array.isArray(listItems)) {
      const sorted = [...listItems].sort((a, b) => a.sortOrder - b.sortOrder);
      setSortedListItems(sorted);
    }
  }, [listItems]);

  // ==================================|| RENDER ||================================== //
  const renderHeader = !!title || !!onAddClick;
  const listItemsPresent = listItems && listItems.length > 0;

  // Fixed height for exactly 4 items (header + 4 rows)
  const fixedHeight = 'h-[245px]';

  const tableContent = listItemsPresent ? (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={reorderOnDragHandler} collisionDetection={closestCenter}>
      <SortableContext items={listItems.map((i) => i['uuid'] as UniqueIdentifier)} strategy={verticalListSortingStrategy}>
        <Table className="w-full border-collapse">
          {renderHeader && (
            <TableHeader className={cn('sticky top-0 bg-background z-10', 'shadow-sm')}>
              <TableRow>
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="w-auto">
                  <div className="flex items-center gap-2 justify-end">
                    {onAddClick && <AddButton onAddClick={handleAddItem} />}
                    {onCopyClick && <CopyButton onCopyClick={onCopyClick} />}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {sortedListItems.map((item, index) => (
              <SortableListItem<T>
                key={item[listItemUniqueIdField] as Key}
                index={index}
                selectedItemIndex={selectedItemIndex}
                item={item}
                listItemRenderField={listItemRenderField}
                listItemUniqueIdField={listItemUniqueIdField}
                checkedItemIndexes={checkedItemIndexes}
                renderDragHandle={!!onSort}
                onItemClick={handleItemSelect}
                handleItemCheckboxClick={onItemCheckboxClick ? handleItemCheckboxClick : undefined}
                handleItemEditClick={onItemEditClick ? handleItemEditClick : undefined}
                handleItemDeleteClick={onItemDeleteClick ? handleItemDeleteClick : undefined}
              />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  ) : (
    <Table className="w-full border-collapse">
      {renderHeader && (
        <TableHeader className={cn('sticky top-0 bg-background z-10', 'shadow-sm')}>
          <TableRow>
            <TableHead className="font-semibold text-foreground">Name</TableHead>
            <TableHead className="w-auto">
              <div className="flex items-center gap-2 justify-end">
                {onAddClick && <AddButton onAddClick={handleAddItem} />}
                {onCopyClick && <CopyButton onCopyClick={onCopyClick} />}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
            No items to display
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  return (
    <div className={cn('w-full space-y-4', className)} {...props}>
      {title && (
        <Typography variant="h3" className="mb-4">
          {title}
        </Typography>
      )}

      <div
        className={cn(
          variant
            ? sortableListVariants({ variant, size })
            : cn('w-full', size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'),
          fixedHeight
        )}
      >
        <ScrollArea className="h-full w-full">{tableContent}</ScrollArea>
      </div>
    </div>
  );
}

export { SortableList, type SortableListItem, type ISortableListProps as SortableListProps };
