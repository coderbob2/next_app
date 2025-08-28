import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Combobox({ options, value, onChange, placeholder, emptyText, isLoading, className, disabled }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
      <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
              <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn("w-[200px] justify-between", className)}
                  disabled={disabled}
              >
                  {value
                      ? options.find((option) => option.value === value)?.label
                      : placeholder ?? "Select an option..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
          </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={placeholder ?? "Search..."} />
          <CommandEmpty>{emptyText ?? "No options found."}</CommandEmpty>
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandGroup>
              {isLoading ? <CommandItem>Loading...</CommandItem> : options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate line-clamp-2">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
