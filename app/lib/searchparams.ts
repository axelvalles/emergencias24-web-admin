import { createSerializer, parseAsInteger, parseAsString } from "nuqs";

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
};

export const ticketSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  requesterName: parseAsString,
  serviceType: parseAsString,
  status: parseAsString,
  priority: parseAsString,
  municipality: parseAsString,
  referenceNumber: parseAsInteger,
};

export const searchParamsCache = searchParams;
export const ticketSearchParamsCache = ticketSearchParams;
export const serialize = createSerializer(searchParams);
export const ticketSerialize = createSerializer(ticketSearchParams);
