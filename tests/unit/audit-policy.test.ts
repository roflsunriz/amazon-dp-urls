import { expect, test } from "bun:test";
import {
  deepmergeAdvisory,
  minimatchAdvisory,
  validateAuditReport,
  verifyDeepmergeLayout,
} from "../../scripts/audit-policy";

test("監査は既知の修復対象以外を拒否する", () => {
  expect(() => validateAuditReport({}, 0)).not.toThrow();
  expect(() =>
    validateAuditReport(
      {
        deepmerge: [{ url: deepmergeAdvisory }],
        minimatch: [{ url: minimatchAdvisory }],
      },
      1,
    ),
  ).not.toThrow();
  expect(() =>
    validateAuditReport({ other: [{ url: deepmergeAdvisory }] }, 1),
  ).toThrow();
  expect(() =>
    validateAuditReport(
      { deepmerge: [{ url: "https://example.invalid/new" }] },
      1,
    ),
  ).toThrow();
  expect(() =>
    validateAuditReport(
      {
        minimatch: [
          { url: minimatchAdvisory },
          { url: "https://example.invalid/new" },
        ],
      },
      1,
    ),
  ).toThrow();
  expect(() => validateAuditReport({}, 1)).toThrow();
  expect(() =>
    validateAuditReport({ deepmerge: [{ url: deepmergeAdvisory }] }, 0),
  ).toThrow();
  expect(() => validateAuditReport({}, 2)).toThrow();
});

test("未確認のdeepmergeコピーを拒否する", () => {
  expect(() =>
    verifyDeepmergeLayout({ deepmerge: ["deepmerge@4.3.1"] }),
  ).not.toThrow();
  expect(() => verifyDeepmergeLayout({})).toThrow();
  expect(() =>
    verifyDeepmergeLayout({
      deepmerge: ["deepmerge@4.3.1"],
      "other/deepmerge": null,
    }),
  ).toThrow();
  expect(() =>
    verifyDeepmergeLayout({ deepmerge: ["deepmerge@5.0.0"] }),
  ).toThrow();
  expect(() =>
    verifyDeepmergeLayout({
      deepmerge: ["deepmerge@4.3.1"],
      "other/deepmerge": ["deepmerge@4.3.1"],
    }),
  ).toThrow();
});
