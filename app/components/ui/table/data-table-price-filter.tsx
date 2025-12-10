;

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { PlusCircle, XCircle } from "lucide-react";

interface DataTablePriceRangeFilterProps<TData> {
  column: Column<TData, unknown>;
  title?: string;
  useSlider?: boolean;
  step?: number;
  min?: number;
  max?: number;
  currencySymbol?: string;
}

export function DataTablePriceRangeFilter<TData>({
  column,
  title = "Rango de Precio",
  useSlider = false,
  step = 10000,
  min = 0,
  max = 1000000,
  currencySymbol = "$",
}: DataTablePriceRangeFilterProps<TData>) {
  const id = React.useId();

  // 🔹 Obtenemos el valor actual del filtro (formato "min,max")
  const rawValue = column.getFilterValue() as string | undefined | string[];

  const [minValue, maxValue] = React.useMemo(() => {
    if (!rawValue) return [min, max];

    if (Array.isArray(rawValue)) {
      return [Number(rawValue[0]), Number(rawValue[1])];
    }

    if (typeof rawValue === "string") {
      const [minValue, maxValue] = rawValue.split(",").map(Number);

      return [
        isNaN(minValue) ? min : minValue,
        isNaN(maxValue) ? max : maxValue,
      ];
    }

    return [min, max];
  }, [rawValue, min, max]);

  // 🔹 Setter del filtro — serializa el rango como "min,max"
  const setFilterValue = (newMin: number, newMax: number) => {
    column.setFilterValue(`${newMin},${newMax}`);
  };

  const handleInputChange = (
    key: "min" | "max",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numValue = Number(e.target.value);
    if (isNaN(numValue)) return;

    if (key === "min") setFilterValue(numValue, maxValue);
    else setFilterValue(minValue, numValue);
  };

  const handleSliderChange = (newRange: [number, number]) => {
    setFilterValue(newRange[0], newRange[1]);
  };

  const onReset = () => column.setFilterValue(undefined);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          {rawValue ? (
            <>
              <XCircle
                className="mr-1 cursor-pointer opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
              />
              {title}: {currencySymbol}
              {minValue.toLocaleString()} - {currencySymbol}
              {maxValue.toLocaleString()}
            </>
          ) : (
            <>
              <PlusCircle className="mr-1" /> {title}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="flex w-auto flex-col gap-4">
        <div className="flex flex-col gap-3">
          <p className="font-medium">{title}</p>
          <div className="flex items-center gap-4">
            {/* Min input */}
            <div className="relative">
              <Label htmlFor={`${id}-min`} className="sr-only">
                Mínimo
              </Label>
              <Input
                id={`${id}-min`}
                type="number"
                placeholder={`Mín ${currencySymbol}${min}`}
                min={min}
                max={max}
                value={minValue ?? ""}
                onChange={(e) => handleInputChange("min", e)}
                className={cn("h-8 w-28 pr-8")}
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currencySymbol}
              </span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Max input */}
            <div className="relative">
              <Label htmlFor={`${id}-max`} className="sr-only">
                Máximo
              </Label>
              <Input
                id={`${id}-max`}
                type="number"
                placeholder={`Máx ${currencySymbol}${max}`}
                min={min}
                max={max}
                value={maxValue ?? ""}
                onChange={(e) => handleInputChange("max", e)}
                className={cn("h-8 w-28 pr-8")}
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currencySymbol}
              </span>
            </div>
          </div>

          {useSlider && (
            <Slider
              id={`${id}-slider`}
              min={min}
              max={max}
              step={step}
              value={[minValue, maxValue]}
              onValueChange={handleSliderChange}
            />
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          aria-label="Limpiar filtro de precio"
        >
          Limpiar
        </Button>
      </PopoverContent>
    </Popover>
  );
}
