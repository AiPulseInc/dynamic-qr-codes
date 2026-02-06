export class QrOwnershipError extends Error {
  constructor() {
    super("QR code not found for this user.");
    this.name = "QrOwnershipError";
  }
}

export function isOwner(ownerUserId: string, candidateUserId: string): boolean {
  return ownerUserId === candidateUserId;
}

export function assertOwnership(ownerUserId: string, candidateUserId: string): void {
  if (!isOwner(ownerUserId, candidateUserId)) {
    throw new QrOwnershipError();
  }
}
