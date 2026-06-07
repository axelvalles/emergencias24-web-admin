import { useEffect, useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon, LoaderCircleIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { useDebouncedCallback } from "~/hooks/use-debounced-callback";
import { patientApi } from "~/http/api-server";
import { cn } from "~/lib/utils";
import type { Patient } from "~/types/patients";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD_PX = 48;

interface FamilyMemberPatientComboboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  excludedPatientIds?: string[];
}

export function FamilyMemberPatientCombobox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = "Selecciona un paciente",
  searchPlaceholder = "Buscar por nombre o documento...",
  emptyMessage = "No se encontraron pacientes",
  required,
  disabled,
  excludedPatientIds = [],
}: FamilyMemberPatientComboboxProps<TFieldValues, TName>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);

  const debouncedUpdateSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 300);

  const excludedPatientIdsKey = useMemo(
    () => [...excludedPatientIds].sort().join(","),
    [excludedPatientIds]
  );

  const { data, isFetching } = useQuery({
    queryKey: ["family-member-patient-search", debouncedSearch, page],
    queryFn: () =>
      patientApi.getAllPatients({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch.trim() || undefined,
      }),
    enabled: open,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setPatients((currentPatients) => {
      const nextPagePatients = data.data.filter(
        (patient) => !excludedPatientIds.includes(patient.id)
      );

      if (page === 1) {
        return nextPagePatients;
      }

      const seenPatientIds = new Set(currentPatients.map((patient) => patient.id));
      const mergedPatients = [...currentPatients];

      for (const patient of nextPagePatients) {
        if (seenPatientIds.has(patient.id)) {
          continue;
        }

        seenPatientIds.add(patient.id);
        mergedPatients.push(patient);
      }

      return mergedPatients;
    });
  }, [data, excludedPatientIds, page]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setDebouncedSearch("");
      setPage(1);
      setPatients([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPage(1);
    setPatients((currentPatients) =>
      currentPatients.filter((patient) => !excludedPatientIds.includes(patient.id))
    );
  }, [excludedPatientIdsKey, excludedPatientIds, open]);

  const hasMorePages = (data?.page ?? 1) < (data?.totalPages ?? 1);
  const isInitialLoading = isFetching && page === 1 && patients.length === 0;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedUpdateSearch(value);
  };

  const handleListScroll = (event: EventTarget & HTMLDivElement) => {
    if (!hasMorePages || isFetching) {
      return;
    }

    const remainingScroll =
      event.scrollHeight - event.scrollTop - event.clientHeight;

    if (remainingScroll <= SCROLL_THRESHOLD_PX) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedPatient = patients.find(
          (patient) => patient.documentNumber === field.value
        );

        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {selectedPatient ? (
                      <span className="truncate text-left">
                        {selectedPatient.fullName} - {selectedPatient.documentNumber}
                      </span>
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onValueChange={handleSearchChange}
                  />
                  <CommandList onScroll={(event) => handleListScroll(event.currentTarget)}>
                    {isInitialLoading ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                        <LoaderCircleIcon className="size-4 animate-spin" />
                        Buscando pacientes...
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                          {patients.map((patient) => {
                            const isSelected = patient.documentNumber === field.value;

                            return (
                              <CommandItem
                                key={patient.id}
                                value={`${patient.fullName} ${patient.documentNumber}`}
                                onSelect={() => {
                                  field.onChange(patient.documentNumber);
                                  setOpen(false);
                                }}
                                className="items-start"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mt-0.5 size-4 shrink-0",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium">{patient.fullName}</p>
                                  <p className="text-muted-foreground truncate text-xs">
                                    {patient.documentType} {patient.documentNumber}
                                  </p>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                        {(isFetching || hasMorePages) && patients.length > 0 && (
                          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                            {isFetching ? (
                              <div className="flex items-center gap-2">
                                <LoaderCircleIcon className="size-3.5 animate-spin" />
                                Cargando más pacientes...
                              </div>
                            ) : (
                              <span>Desplázate para cargar más resultados</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
