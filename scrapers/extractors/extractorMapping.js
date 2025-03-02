// extractorMapping.js

// Import all specific extractors
import { extractJobLinksForAlchemy } from "./extractors/extractJobLinksForAlchemy.js";
import { extractJobLinksForCodeArt } from "./extractors/extractJobLinksForCodeart.js";
import { extractJobLinksForDailyDev } from "./extractors/extractJobLinksForDailyDev.js";
import { extractJobLinksForPercs } from "./extractors/extractJobLinksForPercs.js";
import { extractJobLinksForDealFront } from "./extractors/extractJobLinksForDealfront.js";
import { extractJobLinksForSputnik } from "./extractors/extractJobLinksForSputnik.js";
import { extractJobLinksForStack } from "./extractors/extractJobLinksForStack.js";
import { extractJobLinksForModeMobile } from "./extractors/extractJobLinksForModeMobile.js";
import { extractJobLinksForWorkMotion } from "./extractors/extractJobLinksForWorkMotion.js";
import { extractJobLinksForOnTheGo } from "./extractors/extractJobLinksForOnTheGo.js";
import { extractJobLinksForRevenueAI } from "./extractors/extractJobLinksForRevenueAI.js";

// Map of domains to corresponding extractor functions
export const jobExtractors = {
  "alchemy.cloud": extractJobLinksForAlchemy,
  "daily.dev": extractJobLinksForDailyDev,
  "percs.app": extractJobLinksForPercs,
  "codeart.mk": extractJobLinksForCodeArt,
  "dealfront.com": extractJobLinksForDealFront,
  "sputnik.digital": extractJobLinksForSputnik,
  "stackbuilders.com": extractJobLinksForStack,
  "modemobile.com": extractJobLinksForModeMobile,
  "apply.workable.com/workmotion": extractJobLinksForWorkMotion,
  "onthegosystems.com": extractJobLinksForOnTheGo,
  "revenue.ai": extractJobLinksForRevenueAI,
};
