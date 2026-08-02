// Dùng object thay cho enum để tương thích với erasableSyntaxOnly
export const ChainEventType = {
  HARVEST: 'HARVEST',
  PACKAGING: 'PACKAGING',
  TRANSPORT: 'TRANSPORT',
  PROCUREMENT: 'PROCUREMENT',
  CORRECTION: 'CORRECTION',
} as const;

export type ChainEventType = (typeof ChainEventType)[keyof typeof ChainEventType];

// Nhãn hiển thị tiếng Việt
export const ChainEventTypeLabel: Record<ChainEventType, string> = {
  [ChainEventType.HARVEST]: 'Thu hoạch',
  [ChainEventType.PACKAGING]: 'Đóng gói',
  [ChainEventType.TRANSPORT]: 'Vận chuyển',
  [ChainEventType.PROCUREMENT]: 'Thu mua',
  [ChainEventType.CORRECTION]: 'Đính chính',
};