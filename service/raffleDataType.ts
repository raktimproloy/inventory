
export interface RaffleFormData {
 id?: string; // For update functionality
  title: string;
  prizeName: string;
  startDate: string;
  endDate: string;
  status: string;
  thumbnail?: string | null;
}