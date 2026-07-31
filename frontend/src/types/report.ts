export interface ProductBreakdownItem {
  productCategoryName: string;
  shipmentCount: number;
  totalQuantity: number;
}

export interface IndustryReportResponse {
  region: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string;
  hasData: boolean;
  totalOrganizations: number;
  totalShipments: number;
  totalQuantity: number;
  productBreakdown: ProductBreakdownItem[];
  message: string;
}