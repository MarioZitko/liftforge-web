export interface IDropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface IDropdownProps {
  title?: string;
  options: IDropdownOption[];
  selectedValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  autocomplete?: boolean;
}
