import { dedupeCards, type TabuCard, type CategoryId } from "./card-types";
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

/** Conteo de cartas por categoría */
export const CATEGORY_CARD_COUNTS: Record<CategoryId, number> = {
  general: GENERAL_CARDS.length,
  deportes: DEPORTES_CARDS.length,
  cine: CINE_CARDS.length,
  tecnologia: TECNOLOGIA_CARDS.length,
  comida: COMIDA_CARDS.length,
  personajes: PERSONAJES_CARDS.length,
  naturaleza: NATURALEZA_CARDS.length,
  custom: 0,
};

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
