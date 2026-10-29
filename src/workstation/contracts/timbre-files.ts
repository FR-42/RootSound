/** File selection and a derived on-disk copy; musical validation belongs to the owners. */
export interface TimbreFilesPort {
  open(): Promise<{ status: 'opened'; name: string; text: string } | { status: 'cancelled' }>;
  sync?(songDraftId?: string): Promise<{ status: 'mirrored'; directory: string } | { status: 'idle' } | { status: 'warning'; directory: string; message: string }>;
}
export const MAX_TIMBRE_IMPORT_TEXT_BYTES = 32 * 1024 * 1024;
