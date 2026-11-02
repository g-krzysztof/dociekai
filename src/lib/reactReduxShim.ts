// Lightweight runtime shim to provide `useDispatch.withTypes` expected by
// some compiled libraries. This mutates the exported `useDispatch` if the
// helper is missing. It is safe for runtime-only use.
import * as ReactRedux from "react-redux";

type HookWithTypes = ((...args: unknown[]) => unknown) & { withTypes?: () => unknown };
const hooks = ReactRedux as unknown as {
  useDispatch: HookWithTypes;
  useSelector: HookWithTypes;
};

try {
  const ud = hooks.useDispatch;
  const us = hooks.useSelector;

  if (typeof ud === "function" && typeof ud.withTypes !== "function") {
    ud.withTypes = () => ud;
  }

  if (typeof us === "function" && typeof us.withTypes !== "function") {
    us.withTypes = () => us;
  }
} catch {
  // Silent fallback; if react-redux isn't present or shape differs, the
  // original runtime error will surface elsewhere.
}

export {};
