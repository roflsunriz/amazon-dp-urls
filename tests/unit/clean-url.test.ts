import { describe, expect, test } from "bun:test";
import { toCleanAmazonUrl } from "../../src/clean-url";

describe("toCleanAmazonUrl", () => {
  test.each([
    [
      "https://www.amazon.co.jp/dp/B0ABC12345?tag=tracking-22",
      "https://www.amazon.co.jp/dp/B0ABC12345",
    ],
    [
      "https://amazon.com/gp/product/b012345678/ref=something",
      "https://www.amazon.com/dp/B012345678",
    ],
    [
      "https://smile.amazon.de/gp/aw/d/B0ZZZZZZZZ/",
      "https://www.amazon.de/dp/B0ZZZZZZZZ",
    ],
    [
      "https://www.amazon.com.au/dp/1234567890/ref=abc",
      "https://www.amazon.com.au/dp/1234567890",
    ],
    [
      "https://m.amazon.com.be/dp/B012345678",
      "https://www.amazon.com.be/dp/B012345678",
    ],
  ])("%s を正規化する", (input, expected) => {
    expect(toCleanAmazonUrl(input)).toBe(expected);
  });

  test.each([
    "not a url",
    "https://example.com/dp/B012345678",
    "https://amazon.com.evil.example/dp/B012345678",
    "https://www.amazon.co.jp/s?k=keyboard",
    "https://www.amazon.co.jp/dp/TOO-SHORT",
  ])("%s を拒否する", (input) => {
    expect(toCleanAmazonUrl(input)).toBeNull();
  });
});
