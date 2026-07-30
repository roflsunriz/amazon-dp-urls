import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { Builder, By, Key, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dir, "../..");
const extensionDir = resolve(projectRoot, "dist");
const menuTitle = "AmazonのクリーンURLをコピー";
const productUrl =
  "https://www.amazon.co.jp/dp/4873115655?tag=e2e-tracking-22&ref_=e2e";
const expectedUrl = "https://www.amazon.co.jp/dp/4873115655";

async function setClipboard(text: string): Promise<void> {
  const escapedText = text.replaceAll("'", "''");

  await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-Command",
    `Set-Clipboard -Value '${escapedText}'`
  ]);
}

async function getClipboard(): Promise<string> {
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-Command",
    "Get-Clipboard -Raw"
  ]);

  return stdout.trim();
}

const options = new firefox.Options();
const firefoxBinary =
  process.env.FIREFOX_BINARY ??
  (process.platform === "win32"
    ? "C:\\Program Files\\Mozilla Firefox\\firefox.exe"
    : undefined);

if (firefoxBinary && existsSync(firefoxBinary)) {
  options.setBinary(firefoxBinary);
}

const service = new firefox.ServiceBuilder().addArguments(
  "--allow-system-access"
);
const driver = await new Builder()
  .forBrowser("firefox")
  .setFirefoxOptions(options)
  .setFirefoxService(service)
  .build() as firefox.Driver;

try {
  const addonId = await driver.installAddon(extensionDir, true);
  assert.equal(
    addonId,
    "{62a86475-7d33-4b50-8010-02390be8758e}",
    "想定した拡張機能がインストールされていません。"
  );

  await setClipboard("E2E_NOT_COPIED");
  await driver.get(productUrl);

  const body = await driver.wait(until.elementLocated(By.css("body")), 20_000);
  await driver.actions().contextClick(body).perform();

  await driver.setContext(firefox.Context.CHROME);
  await driver.sleep(500);

  const menuItem = await driver.wait(
    until.elementLocated(
      By.xpath(`//*[@label=${JSON.stringify(menuTitle)}]`)
    ),
    10_000,
    "拡張機能のコンテキストメニュー項目が表示されませんでした。"
  );

  assert.equal(
    await menuItem.isDisplayed(),
    true,
    "コンテキストメニュー項目が非表示です。"
  );
  const menuIcon = await driver.executeScript<string>(
    `const item = arguments[0];
    return item.getAttribute("image") ||
      getComputedStyle(item).listStyleImage ||
      getComputedStyle(item).getPropertyValue("--menuitem-icon");`,
    menuItem
  );
  assert.match(
    menuIcon,
    /moz-extension:\/\/.+\/icons\/icon-(?:16|32|48|96|128)\.png/,
    "独自アイコンがコンテキストメニューへ適用されていません。"
  );
  await menuItem.click();
  await driver.setContext(firefox.Context.CONTENT);

  await driver.wait(async () => (await getClipboard()) === expectedUrl, 10_000);
  assert.equal(await getClipboard(), expectedUrl);

  await setClipboard("E2E_NON_AMAZON_UNCHANGED");
  await driver.get("https://example.com/");
  const nonAmazonBody = await driver.wait(
    until.elementLocated(By.css("body")),
    20_000
  );
  await driver.actions().contextClick(nonAmazonBody).perform();
  await driver.setContext(firefox.Context.CHROME);
  const nonAmazonMenuItem = await driver.wait(
    until.elementLocated(
      By.xpath(`//*[@label=${JSON.stringify(menuTitle)}]`)
    ),
    10_000
  );
  await nonAmazonMenuItem.click();
  await driver.setContext(firefox.Context.CONTENT);
  await driver.sleep(500);
  assert.equal(
    await getClipboard(),
    "E2E_NON_AMAZON_UNCHANGED",
    "Amazon以外のページでクリップボードが変更されました。"
  );

  console.log(
    "E2E passed: Firefox menu/icon → clean URL → clipboard; non-Amazon no-op"
  );
} finally {
  await driver.quit();
}
