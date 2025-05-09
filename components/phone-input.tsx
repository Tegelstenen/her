import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
	React.ComponentProps<"input">,
	"onChange" | "value" | "ref"
> &
	Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
		onChange?: (value: RPNInput.Value) => void;
	};

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
	React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
		({ className, onChange, ...props }, ref) => {
			return (
				<div className="w-full">
					<div className="relative flex">
						<RPNInput.default
							ref={ref}
							className={cn("flex w-full", className)}
							flagComponent={FlagComponent}
							countrySelectComponent={CountrySelect}
							inputComponent={InputComponent}
							smartCaret={false}
							onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
							{...props}
						/>
					</div>
				</div>
			);
		},
	);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
	<input
		className={cn(
			"w-full rounded-none border-0 border-b border-gray-300 bg-transparent p-2 pl-18 text-white shadow-none [-webkit-box-shadow:0_0_0_1000px_black_inset] [-webkit-text-fill-color:white] placeholder:text-gray-400 focus:border-blue-500 focus:outline-none",
			className,
		)}
		{...props}
		ref={ref}
	/>
));
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
	disabled?: boolean;
	value: RPNInput.Country;
	options: CountryEntry[];
	onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
	disabled,
	value: selectedCountry,
	options: countryList,
	onChange,
}: CountrySelectProps) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="secondary"
					className={cn(
						"absolute top-1/2 left-0 z-10 flex -translate-y-1/2 items-center gap-1 bg-transparent p-1 text-white transition-colors hover:bg-gray-800",
						disabled ? "opacity-50" : "",
					)}
					disabled={disabled}
				>
					<FlagComponent
						country={selectedCountry}
						countryName={selectedCountry}
					/>
					<ChevronsUpDown
						className={cn(
							"size-4 text-white opacity-50",
							disabled ? "hidden" : "opacity-100",
						)}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-[300px] border border-gray-400 bg-black p-0 text-white"
			>
				<Command className="bg-black text-white">
					<CommandInput
						placeholder="Search country..."
						className="h-9 rounded-none border-b bg-black text-white"
					/>
					<CommandList className="bg-black text-white">
						<CommandEmpty className="bg-black py-3 text-center text-sm text-gray-400">
							No country found.
						</CommandEmpty>
						<ScrollArea className="bg-black text-white">
							<CommandGroup>
								{countryList.map((option) => {
									if (!option.value) return null;
									return (
										<CountrySelectOption
											key={option.value}
											label={option.label}
											value={option.value}
											selectedCountry={selectedCountry}
											onChange={onChange}
										/>
									);
								})}
							</CommandGroup>
						</ScrollArea>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

type CountrySelectOptionProps = {
	label: string;
	value: RPNInput.Country;
	selectedCountry: RPNInput.Country;
	onChange: (country: RPNInput.Country) => void;
};

const CountrySelectOption = ({
	label,
	value,
	selectedCountry,
	onChange,
}: CountrySelectOptionProps) => {
	return (
		<CommandItem
			className="!hover:bg-gray-800 !data-[selected=true]:bg-gray-700 !data-[selected=true]:text-white cursor-pointer !bg-black bg-black !text-white text-white hover:bg-gray-800 data-[selected=true]:bg-gray-700 data-[selected=true]:text-white"
			onSelect={() => onChange(value)}
		>
			<FlagComponent country={value} countryName={label} />
			<span className="ml-2 flex-1 truncate">{label}</span>
			{value === selectedCountry && (
				<CheckIcon className="ml-auto h-4 w-4 opacity-100" />
			)}
		</CommandItem>
	);
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
	const Flag = flags[country];
	return (
		<div className="mr-2 flex h-5 w-6 items-center justify-center overflow-hidden rounded-sm border border-gray-500">
			{Flag && <Flag title={countryName} />}
		</div>
	);
};

export { PhoneInput };
