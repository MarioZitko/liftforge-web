// LIBRARY
import { Button } from "@/components/buttons/button";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { EditButton } from "@/components/buttons/EditButton";
import { TableCell, TableRow } from "@/components/ui/table";
import { IHasSortOrder, IHasUuid } from "@/types/global";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconArrowsSort } from "@tabler/icons-react";
import { Checkbox } from "../ui/checkbox";
import { ISortableListItemProps } from "./types";

export default function SortableListItem<T extends IHasUuid & IHasSortOrder>({
  index,
  selectedItemIndex,
  item,
  listItemRenderField,
  listItemUniqueIdField = "uuid",
  checkedItemIndexes,
  renderDragHandle,
  onItemClick,
  handleItemCheckboxClick,
  handleItemEditClick,
  handleItemDeleteClick,
}: ISortableListItemProps<T>) {
  // ==================================|| STATE ||================================== //
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({
    id: item[listItemUniqueIdField] as UniqueIdentifier,
  });

  // ==================================|| STYLES ||================================== //
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      {...attributes}
      style={style}
      onClick={onItemClick ? () => onItemClick(item, index) : undefined}
      key={item.uuid}
      className={`hover:bg-muted/50 ${
        selectedItemIndex === index ? "bg-muted/100" : ""
      }`}
    >
      <TableCell className="py-3">
        {String(item[listItemRenderField])}
      </TableCell>
      <TableCell className="w-auto">
        <div className="flex items-center gap-1 justify-end pr-6">
          {handleItemCheckboxClick && (
            <Checkbox
              checked={checkedItemIndexes.includes(index)}
              onCheckedChange={() => handleItemCheckboxClick(index)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${String(item[listItemRenderField])}`}
            />
          )}
          {handleItemEditClick && (
            <EditButton
              onEditClick={(e) => handleItemEditClick(e, item, index)}
            />
          )}
          {handleItemDeleteClick && (
            <DeleteButton
              onDeleteClick={(e) => handleItemDeleteClick(e, index)}
            />
          )}
          {renderDragHandle && (
            <Button
              ref={setActivatorNodeRef}
              {...listeners}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <IconArrowsSort className="h-4 w-4" />
              <span className="sr-only">Sort item</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
