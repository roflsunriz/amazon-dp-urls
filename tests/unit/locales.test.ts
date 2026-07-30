import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "../..");
const localesRoot = resolve(projectRoot, "src", "_locales");
const expectedLocales = [
  "ar",
  "bn",
  "en",
  "es",
  "fr",
  "hi",
  "ja",
  "pt_BR",
  "ru",
  "ur",
  "zh_CN",
] as const;
const expectedMessageKeys = [
  "contextMenuCopyCleanUrl",
  "extensionDescription",
  "extensionName",
] as const;
const expectedAmoLocales = [
  "ar",
  "bn",
  "en-US",
  "es",
  "fr",
  "hi",
  "ja",
  "pt-BR",
  "ru",
  "ur",
  "zh-CN",
] as const;

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

describe("WebExtension locales", () => {
  test("必要な11言語がすべて存在する", () => {
    const actualLocales = readdirSync(localesRoot, {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(actualLocales).toEqual([...expectedLocales].sort());
  });

  test.each([...expectedLocales])(
    "%s のメッセージに欠落や空文字がない",
    (locale: (typeof expectedLocales)[number]) => {
      const messages = readJson(resolve(localesRoot, locale, "messages.json"));

      expect(isRecord(messages)).toBe(true);
      if (!isRecord(messages)) {
        return;
      }

      expect(Object.keys(messages).sort()).toEqual(
        [...expectedMessageKeys].sort(),
      );

      for (const key of expectedMessageKeys) {
        const entry = messages[key];
        expect(isRecord(entry)).toBe(true);
        if (!isRecord(entry)) {
          continue;
        }

        expect(typeof entry.message).toBe("string");
        expect((entry.message as string).trim().length).toBeGreaterThan(0);
        expect(typeof entry.description).toBe("string");
        expect((entry.description as string).trim().length).toBeGreaterThan(0);
      }
    },
  );

  test("manifestが英語フォールバックとi18nキーを使用する", () => {
    const manifest = readJson(resolve(projectRoot, "src", "manifest.json"));

    expect(isRecord(manifest)).toBe(true);
    if (!isRecord(manifest)) {
      return;
    }

    expect(manifest.default_locale).toBe("en");
    expect(manifest.name).toBe("__MSG_extensionName__");
    expect(manifest.description).toBe("__MSG_extensionDescription__");
  });

  test("AMO掲載情報の11言語に欠落や空文字がない", () => {
    const metadata = readJson(resolve(projectRoot, "amo-metadata.json"));

    expect(isRecord(metadata)).toBe(true);
    if (!isRecord(metadata)) {
      return;
    }

    expect(metadata.default_locale).toBe("en-US");

    for (const field of ["name", "summary", "description"]) {
      const translations = metadata[field];
      expect(isRecord(translations)).toBe(true);
      if (!isRecord(translations)) {
        continue;
      }

      expect(Object.keys(translations).sort()).toEqual(
        [...expectedAmoLocales].sort(),
      );
      for (const locale of expectedAmoLocales) {
        expect(typeof translations[locale]).toBe("string");
        expect((translations[locale] as string).trim().length).toBeGreaterThan(
          0,
        );
      }
    }
  });
});
