
export interface FormData {
  id?: string; // For update functionality
  prizeName: string;
  ticketSold: number;
  price: number;
  partner: string;
  stockLevel: string;
  status: string;
  thumbnail?: string | null;
}