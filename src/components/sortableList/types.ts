import { IHasSortOrder, IHasUuid } from '@/types/global';
import { cva, VariantProps } from 'class-variance-authority';

export const sortableListVariants = cva('w-full overflow-hidden', {
  variants: {
    variant: {
      default: 'border border-border rounded-md',
      minimal: 'border-0',
      bordered: 'border-2 border-border rounded-lg',
    },
    size: {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: undefined,
    size: 'default',
  },
});
export interface SortableListItem {
  id: string | number;
  uuid: string | number;
  name: string;
}

export interface ISortableListProps<T extends IHasUuid & IHasSortOrder> extends VariantProps<typeof sortableListVariants> {
  title?: string;
  listItems: T[] | undefined;
  selectedItemIndex: number;
  listItemRenderField: keyof T;
  listItemUniqueIdField?: keyof T;
  listCheckedItemIndexes?: number[];
  onAddClick?: () => unknown;
  onCopyClick?: () => unknown;
  onItemClick?: (item: T, index: number) => unknown;
  onItemCheckboxClick?: (clickedItemIndex: number) => unknown;
  onItemEditClick?: (item: T, index: number) => unknown;
  onItemDeleteClick?: (index: number) => unknown;
  onSort: (listItems: T[]) => unknown;
  className?: string;
}

export interface ISortableListItemProps<T extends IHasUuid & IHasSortOrder> {
  index: number;
  selectedItemIndex: number;
  item: T;
  listItemRenderField: keyof T;
  listItemUniqueIdField?: keyof T;
  checkedItemIndexes: number[];
  renderDragHandle: boolean;
  onItemClick?: (item: T, index: number) => unknown;
  handleItemCheckboxClick?: (clickedItemIndex: number) => unknown;
  handleItemEditClick?: (e: React.MouseEvent<HTMLButtonElement>, item: T, clickedItemIndex: number) => unknown;
  handleItemDeleteClick?: (e: React.MouseEvent<HTMLButtonElement>, clickedItemIndex: number) => unknown;
}
