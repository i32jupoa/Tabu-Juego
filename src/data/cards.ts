import { dedupeCards, type TabuCard } from "./card-types";
import { GENERAL_CARDS } from "./categories/general";
import { DEPORTES_CARDS } from "./categories/deportes";
import { CINE_CARDS } from "./categories/cine";
import { TECNOLOGIA_CARDS } from "./categories/tecnologia";
import { COMIDA_CARDS } from "./categories/comida";
import { PERSONAJES_CARDS } from "./categories/personajes";
import { NATURALEZA_CARDS } from "./categories/naturaleza";

export {
  ALL_CATEGORY_IDS,
  CATEGORIES,
  cardId,
  dedupeCards,
  type CategoryId,
  type TabuCard,
} from "./card-types";

/** Mazo curado local, una fuente por categoría. */
export const CARDS: TabuCard[] = dedupeCards([
  ...GENERAL_CARDS,
  ...DEPORTES_CARDS,
  ...CINE_CARDS,
  ...TECNOLOGIA_CARDS,
  ...COMIDA_CARDS,
  ...PERSONAJES_CARDS,
  ...NATURALEZA_CARDS,
]);
