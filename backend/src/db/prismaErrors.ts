// Prisma error codes we translate into domain errors.
// https://www.prisma.io/docs/orm/reference/error-reference
export const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002';

export const isRecordNotFound = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2025';
