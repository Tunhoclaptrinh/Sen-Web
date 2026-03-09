import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GA_ENABLED = Boolean(GA_MEASUREMENT_ID);

type AnalyticsPrimitive = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsPrimitive>;

const sanitizeParams = (params?: AnalyticsParams) => {
  if (!params) return undefined;

  const output: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    output[key] = value;
  });

  return Object.keys(output).length > 0 ? output : undefined;
};

const sendGAEvent = (eventName: string, params?: AnalyticsParams) => {
  if (!GA_ENABLED) return;
  ReactGA.event(eventName, sanitizeParams(params));
};

export const initGA = () => {
  if (GA_ENABLED) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    // console.log("GA initialized with ID:", GA_MEASUREMENT_ID);
  } else {
    console.warn("GA Measurement ID not found in environment variables.");
  }
};

export const sendPageView = (path: string) => {
  if (!GA_ENABLED) return;
  ReactGA.send({ hitType: "pageview", page: path });
};

export const sendEvent = (category: string, action: string, label?: string) => {
  if (!GA_ENABLED) return;
  ReactGA.event({
    category,
    action,
    label,
  });
};

export const trackViewProduct = (params: {
  itemId: string | number;
  itemName?: string;
  itemType: string;
  sourceScreen?: string;
}) => {
  sendGAEvent("view_product", {
    item_id: String(params.itemId),
    item_name: params.itemName,
    item_type: params.itemType,
    source_screen: params.sourceScreen,
  });
};

export const trackAddToCart = (params: {
  itemId: string | number;
  itemType: string;
  quantity?: number;
  cartType?: string;
  cartId?: string | number;
}) => {
  sendGAEvent("add_to_cart", {
    item_id: String(params.itemId),
    item_type: params.itemType,
    quantity: params.quantity ?? 1,
    cart_type: params.cartType,
    cart_id: params.cartId !== undefined ? String(params.cartId) : undefined,
  });
};

export const trackBeginCheckout = (params: {
  itemId: string | number;
  itemName?: string;
  itemType: string;
  value?: number;
  currency?: string;
  checkoutType?: string;
}) => {
  sendGAEvent("begin_checkout", {
    item_id: String(params.itemId),
    item_name: params.itemName,
    item_type: params.itemType,
    value: params.value,
    currency: params.currency,
    checkout_type: params.checkoutType,
  });
};

export const trackPurchase = (params: {
  itemId: string | number;
  itemName?: string;
  itemType: string;
  transactionId: string;
  value?: number;
  currency?: string;
}) => {
  sendGAEvent("purchase", {
    item_id: String(params.itemId),
    item_name: params.itemName,
    item_type: params.itemType,
    transaction_id: params.transactionId,
    value: params.value,
    currency: params.currency,
  });
};

export const trackCompleteLevel = (params: {
  levelId: string | number;
  chapterId?: string | number;
  score?: number;
  pointsEarned?: number;
  passed?: boolean;
}) => {
  sendGAEvent("complete_level", {
    level_id: String(params.levelId),
    chapter_id: params.chapterId !== undefined ? String(params.chapterId) : undefined,
    score: params.score,
    points_earned: params.pointsEarned,
    passed: params.passed,
  });
};

export const trackChatAiStarted = (params: {
  source: string;
  hasContext?: boolean;
}) => {
  sendGAEvent("chat_ai_started", {
    source: params.source,
    has_context: params.hasContext,
  });
};
