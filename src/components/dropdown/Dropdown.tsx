/* eslint-disable @typescript-eslint/no-unused-vars */
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../buttons/button";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { IDropdownProps } from "./types";

export default function Dropdown({
	title,
	options,
	selectedValue,
	onChange,
	placeholder,
	disabled = false,
	autocomplete = false,
}: IDropdownProps) {
	const [open, setOpen] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	// Find the selected option for display
	const selectedOption = options.find(
		(option) => option.value.toString() === selectedValue?.toString(),
	);

	if (autocomplete) {
		return (
			<div className="space-y-2">
				<div className="relative">
					<Popover
						open={open}
						onOpenChange={(isOpen) => {
							setOpen(isOpen);
							setIsFocused(isOpen);
						}}
					>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								className="w-full justify-between"
								disabled={disabled}
							>
								{selectedOption
									? selectedOption.label
									: placeholder || "Select an option..."}
								<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
							<Command>
								<CommandInput
									placeholder={`Search ${title?.toLowerCase() || "options"}...`}
								/>
								<CommandList>
									<CommandEmpty>No option found.</CommandEmpty>
									{options.map((option) => (
										<CommandItem
											key={option.value.toString()}
											value={option.label}
											disabled={option.disabled}
											onSelect={() => {
												if (!option.disabled) {
													onChange?.(option.value);
													setOpen(false);
												}
											}}
										>
											<CheckIcon
												className={cn(
													"mr-2 h-4 w-4",
													selectedValue?.toString() === option.value.toString()
														? "opacity-100"
														: "opacity-0",
												)}
											/>
											{option.label}
										</CommandItem>
									))}
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{title && (
						<Label
							className={cn(
								"absolute text-xs text-muted-foreground pointer-events-none z-10 transition-all duration-200",
								isFocused
									? "left-0 -top-5 text-primary"
									: "left-3 top-0 -translate-y-1/2 bg-background px-1",
								disabled && "opacity-50",
							)}
						>
							{title}
						</Label>
					)}
				</div>
			</div>
		);
	}

	// Regular dropdown (non-autocomplete)
	return (
		<div className="space-y-2">
			<div className="relative">
				<Select
					value={selectedValue?.toString() || ""}
					onValueChange={onChange}
					disabled={disabled}
					onOpenChange={(isOpen) => setIsFocused(isOpen)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
							<SelectItem
								key={option.value.toString()}
								value={option.value.toString()}
								disabled={option.disabled}
							>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{title && (
					<Label
						className={cn(
							"absolute text-xs text-muted-foreground pointer-events-none z-10 transition-all duration-200",
							isFocused
								? "left-0 -top-5 text-primary"
								: "left-3 top-0 -translate-y-1/2 bg-background px-1",
							disabled && "opacity-50",
						)}
					>
						{title}
					</Label>
				)}
			</div>
		</div>
	);
}
