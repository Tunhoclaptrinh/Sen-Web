/**
 * Shop Item Type Constants
 * Định nghĩa các loại vật phẩm trong cửa hàng
 */
export enum ShopItemType {
  HINT = 'hint',                      // Gợi ý giải câu đố
  BOOST = 'boost',                    // Tăng tốc/tăng điểm
  POWERUP = 'powerup',               // Vật phẩm hỗ trợ chơi game
  CHARACTER_SKIN = 'character_skin',  // Skin nhân vật Sen
  AVATAR = 'avatar',                  // Trang phục/phụ kiện
  TITLE = 'title',                    // Danh hiệu
  THEME = 'theme',                    // Giao diện/theme
  DECORATION = 'decoration'           // Trang trí bảo tàng
}

/**
 * Currency Constants
 * Định nghĩa các loại tiền tệ
 */
export enum ShopCurrency {
  COINS = 'coins',      // Xu (free currency)
  PETALS = 'petals'     // Cánh sen (premium currency)
}

/**
 * Labels for Shop Item Types (for UI display)
 */
export const SHOP_TYPE_LABELS: Record<ShopItemType, string> = {
  [ShopItemType.HINT]: 'Gợi ý',
  [ShopItemType.BOOST]: 'Tăng tốc',
  [ShopItemType.POWERUP]: 'Hỗ trợ',
  [ShopItemType.CHARACTER_SKIN]: 'Skin nhân vật',
  [ShopItemType.AVATAR]: 'Trang phục',
  [ShopItemType.TITLE]: 'Danh hiệu',
  [ShopItemType.THEME]: 'Giao diện',
  [ShopItemType.DECORATION]: 'Trang trí'
};

/**
 * Labels for Currencies (for UI display)
 */
export const CURRENCY_LABELS: Record<ShopCurrency, string> = {
  [ShopCurrency.COINS]: 'Xu',
  [ShopCurrency.PETALS]: 'Cánh sen'
};

/**
 * Labels for common Effects (for UI display)
 * Map technical effect IDs to Vietnamese descriptions
 */
export const EFFECT_LABELS: Record<string, string> = {
  'reveal_hint': 'Hiện gợi ý',
  'doublePoints5min': 'Nhân đôi điểm 5 phút',
  'change_skin_teu_gold': 'Đổi skin Tếu vàng',
  'museum_decoration': 'Trang trí bảo tàng',
  'increase_rare_drop': 'Tăng tỉ lệ rơi hiếm'
};

/**
 * Get all shop types as array
 */
export const getAllShopTypes = (): ShopItemType[] => {
  return Object.values(ShopItemType);
};

/**
 * Get all currencies as array
 */
export const getAllCurrencies = (): ShopCurrency[] => {
  return Object.values(ShopCurrency);
};
