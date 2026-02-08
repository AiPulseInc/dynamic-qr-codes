export type QrCodeRecord = {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type QrCodeListItem = {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: Date;
};

export type QrCodeJson = {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toQrJson(qrCode: QrCodeRecord): QrCodeJson {
  return {
    id: qrCode.id,
    name: qrCode.name,
    slug: qrCode.slug,
    destinationUrl: qrCode.destinationUrl,
    isActive: qrCode.isActive,
    createdAt: qrCode.createdAt.toISOString(),
    updatedAt: qrCode.updatedAt.toISOString(),
  };
}
