import type {
  ExternalActivityChangePage,
  ExternalActivityProviderChange,
} from "../types";

export type MockExternalActivityProvider = {
  getChanges: (cursor?: string) => ExternalActivityChangePage;
};

export function createMockExternalActivityProvider(
  pages: readonly ExternalActivityProviderChange[][],
): MockExternalActivityProvider {
  const immutablePages = pages.map((page) => [...page]);

  return {
    getChanges(cursor) {
      const pageIndex = cursor === undefined ? 0 : Number(cursor);
      if (!Number.isInteger(pageIndex) || pageIndex < 0) {
        throw new Error("Mock provider cursor is invalid.");
      }

      const changes = immutablePages[pageIndex] ?? [];
      return {
        changes: [...changes],
        nextCursor: pageIndex + 1 < immutablePages.length ? String(pageIndex + 1) : undefined,
      };
    },
  };
}
