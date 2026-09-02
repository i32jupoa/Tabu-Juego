import { queryOptions } from "@tanstack/react-query";
import { CARDS } from "@/data/cards";
import { getCards } from "./cards.functions";

export const cardsQueryOptions = queryOptions({
  queryKey: ["cards"],
  queryFn: () => getCards(),
  staleTime: 5 * 60 * 1000,
  initialData: { cards: CARDS, source: "local" as const },
});
