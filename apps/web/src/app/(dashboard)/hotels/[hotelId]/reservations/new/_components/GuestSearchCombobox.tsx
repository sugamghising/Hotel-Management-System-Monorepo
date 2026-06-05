"use client";

import { useState, useEffect, useRef } from "react";
import { useGuests, type GuestListItem } from "@/lib/hooks/useGuests";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestSearchComboboxProps {
  value: string;
  onSelect: (guest: GuestListItem) => void;
  onClear: () => void;
  selectedGuest?: GuestListItem | null;
}

export function GuestSearchCombobox({
  value,
  onSelect,
  onClear,
  selectedGuest,
}: GuestSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGuests(
    debouncedSearch.trim().length >= 2 ? { search: debouncedSearch.trim(), limit: 10 } : undefined,
  );

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const guests = data?.guests ?? [];

  if (selectedGuest) {
    return (
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {selectedGuest.firstName} {selectedGuest.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedGuest.email}{" "}
              {selectedGuest.phone && `· ${selectedGuest.phone}`}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {selectedGuest.vipStatus !== "NONE" && (
                <Badge variant="outline" className="text-[10px] h-4 px-1">
                  {selectedGuest.vipStatus}
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground">
                {selectedGuest.totalStays} stay
                {selectedGuest.totalStays !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 gap-1"
        >
          <X className="h-3 w-3" />
          Change
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9"
        >
          <span className={cn(value ? "" : "text-muted-foreground")}>
            {value || "Search by name, email or phone..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, email or phone..."
            value={search}
            onValueChange={(v) => {
              setSearch(v);
            }}
          />
          {isLoading && (
            <div className="p-2 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && guests.length === 0 && (
            <CommandEmpty>
              {search.trim().length < 2
                ? "Type at least 2 characters to search"
                : "No guests found"}
            </CommandEmpty>
          )}
          {!isLoading && guests.length > 0 && (
            <CommandGroup>
              {guests.map((guest) => (
                <CommandItem
                  key={guest.id}
                  value={guest.id}
                  onSelect={() => {
                    onSelect(guest);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-medium">
                        {guest.firstName} {guest.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {guest.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {guest.vipStatus !== "NONE" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1"
                        >
                          {guest.vipStatus}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {guest.totalStays} stay
                        {guest.totalStays !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
