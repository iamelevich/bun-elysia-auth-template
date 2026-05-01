import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

type MediaQueryListenerFn = (e: Pick<MediaQueryListEvent, "matches">) => void;

function mockMatchMedia(matches: boolean) {
  const listeners: MediaQueryListenerFn[] = [];

  const mql = {
    matches,
    addEventListener: vi.fn((_event: string, handler: MediaQueryListenerFn) => {
      listeners.push(handler);
    }),
    removeEventListener: vi.fn(
      (_event: string, handler: MediaQueryListenerFn) => {
        const idx = listeners.indexOf(handler);
        if (idx !== -1) listeners.splice(idx, 1);
      },
    ),
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => mql),
  });

  return { mql, listeners };
}

describe("useIsMobile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state based on window.innerWidth", () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it("returns false when innerWidth is >= 768 (desktop)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1024,
      });
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it("returns true when innerWidth is < 768 (mobile)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 375,
      });
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it("returns false at exactly the breakpoint (768)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 768,
      });
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });
  });

  it("updates when the media query change event fires", () => {
    const { listeners } = mockMatchMedia(false);
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 375,
      });
      for (const listener of listeners) {
        listener({ matches: true });
      }
    });

    expect(result.current).toBe(true);
  });

  it("removes the event listener on unmount", () => {
    const { mql } = mockMatchMedia(false);
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledOnce();
  });
});
