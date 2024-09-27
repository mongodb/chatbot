import { Reference } from "mongodb-rag-core";

export type SortReferences = (left: Reference, right: Reference) => -1 | 0 | 1;

export type ReferenceDomain = string | URL;

export function makePrioritizeReferenceDomain(
  domains: ReferenceDomain | ReferenceDomain[]
): SortReferences {
  const priorityDomains = (Array.isArray(domains) ? domains : [domains]).map(
    (domain) => new URL(domain)
  );

  // If no priority domains are provided, return a no-op sort function
  if (priorityDomains.length === 0) {
    return () => 0;
  }

  return function prioritizeReferenceDomain(l, r) {
    // Determine the priority level for left and right URLs
    const lPriority = priorityDomains.findIndex((priorityDomain) =>
      isReferenceToDomain(new URL(l.url), priorityDomain)
    );

    const rPriority = priorityDomains.findIndex((priorityDomain) =>
      isReferenceToDomain(new URL(r.url), priorityDomain)
    );

    // Both URLs match the same priority level
    if (lPriority === rPriority) {
      return 0;
    }

    // One URL has a higher priority (lower index) than the other
    if (lPriority !== -1 && (rPriority === -1 || lPriority < rPriority)) {
      return -1;
    }

    if (rPriority !== -1 && (lPriority === -1 || rPriority < lPriority)) {
      return 1;
    }

    // Neither URL matches any priority domain
    return 0;
  };
}

/**
 * Determine if a reference is to a specific domain/path.
 */
export function isReferenceToDomain(
  referenceUrl: URL,
  domainUrl: URL
): boolean {
  return (
    referenceUrl.hostname === domainUrl.hostname &&
    referenceUrl.pathname.startsWith(domainUrl.pathname)
  );
}
