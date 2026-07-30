"use strict";

import { toCleanAmazonUrl } from "./clean-url";

const MENU_ID = "copy-amazon-clean-dp-url";
const menuTitle = browser.i18n.getMessage("contextMenuCopyCleanUrl");

if (!menuTitle) {
  throw new Error("Missing i18n message: contextMenuCopyCleanUrl");
}

browser.contextMenus.create({
  id: MENU_ID,
  title: menuTitle,
  contexts: ["all"],
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
  },
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  const cleanUrl = toCleanAmazonUrl(info.pageUrl || (tab && tab.url) || "");

  if (cleanUrl) {
    await navigator.clipboard.writeText(cleanUrl);
  }
});
