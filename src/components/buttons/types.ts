export interface ViewButtonProps {
  onViewClick: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
}

export interface EditButtonProps {
  onEditClick: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
}

export interface DeleteButtonProps {
  onDeleteClick: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
}

export interface AddButtonProps {
  onAddClick: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
}

export interface CopyButtonProps<> {
  onCopyClick: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
}
