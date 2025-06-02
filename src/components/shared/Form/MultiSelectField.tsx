import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface IMultiSelectFieldProps {
	label: string;
	options: readonly string[];
	selectedValues: string[];
	onValueAdd: (value: string) => void;
	onValueRemove: (value: string) => void;
	placeholder?: string;
	description?: string;
	error?: string;
}

export default function MultiSelectField({
	label,
	options,
	selectedValues,
	onValueAdd,
	onValueRemove,
	placeholder,
	description,
	error,
}: IMultiSelectFieldProps) {
	const handleValueAdd = (value: string): void => {
		if (value && !selectedValues.includes(value)) {
			onValueAdd(value);
		}
	};

	const handleValueRemove = (valueToRemove: string): void => {
		onValueRemove(valueToRemove);
	};

	const formatOptionText = (option: string): string => {
		return option.replace(/_/g, " ");
	};

	return (
		<div className="space-y-2">
			<div>
				<Label className="text-sm font-medium">{label}</Label>
				{description && (
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
				)}
			</div>

			<Select onValueChange={handleValueAdd}>
				<SelectTrigger>
					<SelectValue
						placeholder={placeholder || `Select ${label.toLowerCase()}`}
					/>
				</SelectTrigger>
				<SelectContent>
					{options
						.filter((option) => !selectedValues.includes(option))
						.map((option) => (
							<SelectItem key={option} value={option}>
								{formatOptionText(option)}
							</SelectItem>
						))}
				</SelectContent>
			</Select>

			{error && <p className="text-sm text-red-500 mt-1">{error}</p>}

			{selectedValues.length > 0 && (
				<div className="flex flex-wrap gap-2 pt-2">
					{selectedValues.map((item) => (
						<Badge
							key={item}
							variant="secondary"
							className="flex items-center gap-1 px-2 py-1 text-sm"
						>
							<span>{formatOptionText(item)}</span>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									handleValueRemove(item);
								}}
								className="text-muted-foreground hover:text-destructive"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
