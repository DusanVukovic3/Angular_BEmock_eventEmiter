export interface Item {
  id: string;
  name: string;
  categoryId: string;
  status: string;
  price: number;
  warrantyMonths?: number;
  weight?: number;
  dimensions?: string;
}
