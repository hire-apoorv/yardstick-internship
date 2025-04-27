export function getSessionId(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sessionId");
    }
    return null;
  }