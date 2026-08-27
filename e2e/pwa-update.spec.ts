import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { expect, test, type Page } from "@playwright/test";

const workerPath = resolve("apps/web/dist/sw.js");
const updatePromptName = "Mise à jour de Loya";

async function openControlledPage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);

  if (
    !(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
  ) {
    await page.reload();
  }

  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
}

async function prepareTenantEntry(page: Page, email: string) {
  await page.getByText("Accéder à l’espace Locataire", { exact: true }).click();
  const emailInput = page.getByRole("textbox", { name: "Adresse e-mail" });
  await emailInput.fill(email);
  await emailInput.focus();
  await expect(emailInput).toBeFocused();
}

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

test("préserve les saisies X-01 pendant un cycle PWA multi-onglet", async ({
  context,
}) => {
  test.setTimeout(90_000);

  const originalWorker = await readFile(workerPath, "utf8");
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const pageC = await context.newPage();

  try {
    await openControlledPage(pageA);
    await openControlledPage(pageB);
    await openControlledPage(pageC);
    await prepareTenantEntry(pageA, "onglet-a@example.test");
    await prepareTenantEntry(pageB, "onglet-b@example.test");
    await prepareTenantEntry(pageC, "onglet-c@example.test");

    let pageANavigations = 0;
    let pageBNavigations = 0;
    let pageCNavigations = 0;
    pageA.on("framenavigated", (frame) => {
      if (frame === pageA.mainFrame()) pageANavigations += 1;
    });
    pageB.on("framenavigated", (frame) => {
      if (frame === pageB.mainFrame()) pageBNavigations += 1;
    });
    pageC.on("framenavigated", (frame) => {
      if (frame === pageC.mainFrame()) pageCNavigations += 1;
    });

    await writeFile(
      workerPath,
      `${originalWorker}\n/* e2e-update-${Date.now()} */\n`,
      "utf8",
    );
    await pageA.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) throw new Error("Service Worker non enregistré");
      await registration.update();
    });

    await expect
      .poll(() =>
        pageA.evaluate(async () => {
          const registration = await navigator.serviceWorker.getRegistration();
          return Boolean(registration?.waiting);
        }),
      )
      .toBe(true);

    const promptA = pageA.getByRole("complementary", {
      name: updatePromptName,
    });
    const promptB = pageB.getByRole("complementary", {
      name: updatePromptName,
    });
    const promptC = pageC.getByRole("complementary", {
      name: updatePromptName,
    });
    await expect(promptA).toContainText(
      "Une nouvelle version de Loya est disponible.",
    );
    await expect(promptB).toContainText(
      "Une nouvelle version de Loya est disponible.",
    );
    await expect(promptC).toContainText(
      "Une nouvelle version de Loya est disponible.",
    );
    await expect(
      pageA.getByRole("textbox", { name: "Adresse e-mail" }),
    ).toHaveValue("onglet-a@example.test");
    await expect(
      pageB.getByRole("textbox", { name: "Adresse e-mail" }),
    ).toHaveValue("onglet-b@example.test");
    await expect(
      pageB.getByRole("textbox", { name: "Adresse e-mail" }),
    ).toBeFocused();
    await expect(
      pageC.getByRole("textbox", { name: "Adresse e-mail" }),
    ).toHaveValue("onglet-c@example.test");

    const targetSizes = await promptA
      .getByRole("button")
      .evaluateAll((buttons) =>
        buttons.map((button) => {
          const { width, height } = button.getBoundingClientRect();
          return { width, height };
        }),
      );
    for (const { width, height } of targetSizes) {
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    }
    expect(await hasHorizontalOverflow(pageA)).toBe(false);

    await promptB.getByRole("button", { name: "Plus tard" }).click();
    await expect(promptB).toHaveCount(0);
    expect(pageBNavigations).toBe(0);
    const emailB = pageB.getByRole("textbox", { name: "Adresse e-mail" });
    await expect(emailB).toHaveValue("onglet-b@example.test");
    await expect(emailB).toBeFocused();

    const dismissC = promptC.getByRole("button", { name: "Plus tard" });
    await dismissC.focus();
    await expect(dismissC).toBeFocused();

    await promptA
      .getByRole("button", { name: "Mettre à jour et recharger" })
      .click();
    await expect.poll(() => pageANavigations).toBeGreaterThan(0);

    await expect(promptB).toContainText(
      "La nouvelle version est prête. Rechargez pour l’utiliser.",
    );
    expect(pageBNavigations).toBe(0);
    await expect(
      pageB.getByRole("textbox", { name: "Adresse e-mail" }),
    ).toHaveValue("onglet-b@example.test");
    await expect(emailB).toBeFocused();
    await expect(
      promptB.getByRole("button", { name: "Plus tard" }),
    ).toHaveCount(0);

    await expect(promptC).toContainText(
      "La nouvelle version est prête. Rechargez pour l’utiliser.",
    );
    expect(pageCNavigations).toBe(0);
    const emailC = pageC.getByRole("textbox", { name: "Adresse e-mail" });
    await expect(emailC).toHaveValue("onglet-c@example.test");
    await expect(emailC).toBeFocused();

    await promptC.getByRole("button", { name: "Recharger maintenant" }).click();
    await expect.poll(() => pageCNavigations).toBeGreaterThan(0);
  } finally {
    await writeFile(workerPath, originalWorker, "utf8");
  }
});
