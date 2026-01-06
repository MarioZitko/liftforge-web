export interface ISubmitHandlerProps {
  saveLabel?: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
}
