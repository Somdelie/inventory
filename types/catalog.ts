export type CategoryProps = {
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
};

export interface UnitDTO {
  id: string;
  title: string;
  symbol: string;
}

export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  organizationId: string | null;
}

export interface CategoryDTO {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  organizationId: string | null;
  imageUrl: string | null;
}

export interface TaxDTO {
  id: string;
  name: string;
  rate: number;
  organizationId: string | null;
}
