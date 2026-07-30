export interface FarmArea {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  cropTypeId: string;
  cropTypeName: string;
  latitude: number | null;
  longitude: number | null;
  area: number;
  createdAt: string;
  updatedAt: string;
}