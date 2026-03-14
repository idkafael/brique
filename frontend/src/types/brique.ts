export type BriqueStatus = 'à venda' | 'vendido';

export const ORIGIN_OPTIONS = [
  'Instagram',
  'WhatsApp',
  'Indicação',
  'Loja',
  'OLX',
  'Marketplace',
  'Cliente antigo',
  'Outro',
] as const;

export interface BriqueImage {
  id: string;
  briqueId: string;
  imageUrl: string;
  createdAt: string;
}

export interface Brique {
  id: string;
  userId: string;
  title: string;
  purchaseValue: number;
  saleValue: number;
  status: BriqueStatus;
  origin: string | null;
  phone: string | null;
  socialMedia: string | null;
  notes: string | null;
  entryDate: string;
  exitDate: string | null;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  images?: BriqueImage[];
}
