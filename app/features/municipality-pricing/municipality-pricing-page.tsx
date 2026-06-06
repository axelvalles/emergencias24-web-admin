import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getErrorMessage,
  municipalityPricingApi,
} from "~/http/api-server";
import { queryClient } from "~/lib/query-client";
import type { MunicipalityPricing } from "~/types/municipality-pricing";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { LoadingButton } from "~/components/ui/loading-button";
import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface DraftValues {
  homeCarePrice: string;
  ambulancePrice: string;
}

type DraftState = Record<string, DraftValues>;

function buildDrafts(pricingRows: MunicipalityPricing[]): DraftState {
  return pricingRows.reduce<DraftState>((accumulator, pricing) => {
    accumulator[pricing.id] = {
      homeCarePrice: pricing.homeCarePrice,
      ambulancePrice: pricing.ambulancePrice,
    };

    return accumulator;
  }, {});
}

function parsePrice(value: string): number | null {
  const normalizedValue = value.trim().replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function formatCurrency(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function MunicipalityPricingPage() {
  const [drafts, setDrafts] = useState<DraftState>({});

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["municipality-pricing"],
    queryFn: municipalityPricingApi.getAll,
  });

  useEffect(() => {
    if (data) {
      setDrafts(buildDrafts(data));
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { homeCarePrice: number; ambulancePrice: number };
    }) => municipalityPricingApi.update(id, payload),
    onSuccess: async (_, variables) => {
      toast.success("Costos actualizados correctamente");
      await queryClient.invalidateQueries({ queryKey: ["municipality-pricing"] });
      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [variables.id]: {
          homeCarePrice: variables.payload.homeCarePrice.toFixed(2),
          ambulancePrice: variables.payload.ambulancePrice.toFixed(2),
        },
      }));
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError));
    },
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <DataTableSkeleton columnCount={3} rowCount={6} filterCount={0} />;
  }

  const pricingRows = data ?? [];

  const handleDraftChange = (
    id: string,
    field: keyof DraftValues,
    value: string
  ) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [id]: {
        ...currentDrafts[id],
        [field]: value,
      },
    }));
  };

  const handleReset = (pricing: MunicipalityPricing) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [pricing.id]: {
        homeCarePrice: pricing.homeCarePrice,
        ambulancePrice: pricing.ambulancePrice,
      },
    }));
  };

  const handleSave = async (pricing: MunicipalityPricing) => {
    const draft = drafts[pricing.id];
    const homeCarePrice = parsePrice(draft?.homeCarePrice ?? pricing.homeCarePrice);
    const ambulancePrice = parsePrice(
      draft?.ambulancePrice ?? pricing.ambulancePrice
    );

    if (homeCarePrice === null || ambulancePrice === null) {
      toast.error("Debes ingresar montos numericos validos");
      return;
    }

    if (homeCarePrice < 0 || ambulancePrice < 0) {
      toast.error("Los montos no pueden ser negativos");
      return;
    }

    await updateMutation.mutateAsync({
      id: pricing.id,
      payload: {
        homeCarePrice,
        ambulancePrice,
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Orden</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead className="min-w-[220px]">Atencion domiciliaria</TableHead>
              <TableHead className="min-w-[220px]">Ambulancia</TableHead>
              <TableHead className="w-[220px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay municipios configurados.
                </TableCell>
              </TableRow>
            ) : (
              pricingRows.map((pricing) => {
                const draft = drafts[pricing.id] ?? {
                  homeCarePrice: pricing.homeCarePrice,
                  ambulancePrice: pricing.ambulancePrice,
                };
                const isPending =
                  updateMutation.isPending &&
                  updateMutation.variables?.id === pricing.id;
                const hasChanges =
                  draft.homeCarePrice !== pricing.homeCarePrice ||
                  draft.ambulancePrice !== pricing.ambulancePrice;

                return (
                  <TableRow key={pricing.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {pricing.displayOrder}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{pricing.municipality}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          id={`home-care-${pricing.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={draft.homeCarePrice}
                          onChange={(event) =>
                            handleDraftChange(
                              pricing.id,
                              "homeCarePrice",
                              event.target.value
                            )
                          }
                          disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                          Actual: {formatCurrency(pricing.homeCarePrice)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          id={`ambulance-${pricing.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={draft.ambulancePrice}
                          onChange={(event) =>
                            handleDraftChange(
                              pricing.id,
                              "ambulancePrice",
                              event.target.value
                            )
                          }
                          disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                          Actual: {formatCurrency(pricing.ambulancePrice)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <LoadingButton
                          loading={isPending}
                          disabled={!hasChanges || isFetching}
                          onClick={() => void handleSave(pricing)}
                        >
                          Guardar
                        </LoadingButton>
                        <LoadingButton
                          type="button"
                          variant="outline"
                          disabled={!hasChanges || isPending}
                          onClick={() => handleReset(pricing)}
                        >
                          Restablecer
                        </LoadingButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
