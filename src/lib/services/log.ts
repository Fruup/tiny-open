import { format } from "pretty-format";
import * as tauriLog from "@tauri-apps/plugin-log";

export const fmt = (literals: TemplateStringsArray, ...values: unknown[]) =>
  literals.raw.map((lit, i) => `${lit}${format(values[i])}`).join("");

export const log = {
  debug: (...args: any[]) =>
    tauriLog.debug(args.map((value) => format(value)).join(" ")),
  error: (...args: any[]) =>
    tauriLog.error(args.map((value) => format(value)).join(" ")),
};
