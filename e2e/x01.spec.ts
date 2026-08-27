import { expect, test, type Page } from "@playwright/test";

const agencyDoorName = /Accéder à l’espace Agence/;
const tenantDoorName = /Accéder à l’espace Locataire/;
const ownerDoorName = /Accéder à l’espace Propriétaire/;

async function selectTenant(page: Page) {
  await page.getByText("Accéder à l’espace Locataire", { exact: true }).click();
  await expect(page.getByRole("radio", { name: tenantDoorName })).toBeChecked();
}

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("rend exactement les trois portes publiques sans présélection", async ({
  page,
}) => {
  const radios = page.getByRole("radio");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Choisissez votre espace",
  );
  await expect(
    page.getByRole("group", { name: "Choisir l’espace de connexion" }),
  ).toBeVisible();
  await expect(radios).toHaveCount(3);
  await expect(
    page.getByRole("radio", { name: agencyDoorName }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("radio", { name: tenantDoorName }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("radio", { name: ownerDoorName }),
  ).not.toBeChecked();
  await expect(page.getByText("Un seul compte Loya")).toContainText(
    "peut donner accès à plusieurs espaces",
  );
  await expect(page.getByText(/Plateforme|Super Admin/)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Continuer avec Google" }),
  ).toHaveCount(0);
});

test("respecte l’ordre clavier et replie Google vers l’e-mail", async ({
  page,
}) => {
  const skipLink = page.getByRole("link", { name: "Aller au contenu" });
  const main = page.getByRole("main");
  const agencyRadio = page.getByRole("radio", { name: agencyDoorName });
  const tenantRadio = page.getByRole("radio", { name: tenantDoorName });
  const ownerRadio = page.getByRole("radio", { name: ownerDoorName });
  const googleButton = page.getByRole("button", {
    name: "Continuer avec Google",
  });
  const emailInput = page.getByRole("textbox", { name: "Adresse e-mail" });

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(main).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(agencyRadio).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(tenantRadio).toBeChecked();
  await expect(tenantRadio).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(ownerRadio).toBeChecked();
  await expect(ownerRadio).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(googleButton).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(emailInput).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(googleButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(emailInput).toBeFocused();
  await expect(page.getByRole("status")).toContainText(
    "Vous pouvez continuer par e-mail",
  );
  await expect(ownerRadio).toBeChecked();
});

test("annonce l’e-mail invalide puis restitue le focus à la porte", async ({
  page,
}) => {
  await selectTenant(page);

  const emailInput = page.getByRole("textbox", { name: "Adresse e-mail" });
  await page.getByRole("button", { name: "RECEVOIR UN CODE" }).click();

  await expect(emailInput).toBeFocused();
  await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveText(
    /Saisissez une adresse e-mail valide/,
  );

  await page.getByRole("button", { name: "Changer d’espace" }).click();
  const tenantRadio = page.getByRole("radio", { name: tenantDoorName });
  await expect(tenantRadio).toBeFocused();
  await expect(tenantRadio).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Continuer avec Google" }),
  ).toHaveCount(0);
});

test("reste neutre pour un e-mail valide et pour le hors-ligne", async ({
  page,
}) => {
  const authProviderRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.hostname.endsWith("supabase.co") ||
      url.hostname === "accounts.google.com" ||
      /\/(?:auth|oauth)(?:\/|$)/i.test(url.pathname)
    ) {
      authProviderRequests.push(`${url.hostname}${url.pathname}`);
    }
  });

  await selectTenant(page);

  const emailInput = page.getByRole("textbox", { name: "Adresse e-mail" });
  await page.getByRole("button", { name: "Continuer avec Google" }).click();
  await expect(emailInput).toBeFocused();
  await expect(page.getByRole("status")).toContainText(
    "Vous pouvez continuer par e-mail",
  );
  expect(authProviderRequests).toEqual([]);

  await emailInput.fill("locataire@example.test");
  await page.getByRole("button", { name: "RECEVOIR UN CODE" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Envoi du code temporairement indisponible",
  );
  await expect(page.getByText(/compte existe|compte inexistant/i)).toHaveCount(
    0,
  );

  await page.context().setOffline(true);
  await page.getByRole("button", { name: "RECEVOIR UN CODE" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Connexion indisponible hors ligne",
  );
  await page.getByRole("button", { name: "Continuer avec Google" }).click();
  await expect(emailInput).toBeFocused();
  await expect(page.getByRole("status")).toContainText(
    "Connexion indisponible hors ligne",
  );
  expect(authProviderRequests).toEqual([]);
});

test("empile à 599 px et aligne trois colonnes à 600 px sans débordement", async ({
  page,
}) => {
  const cards = page.locator(".door-card");

  await page.setViewportSize({ width: 599, height: 900 });
  const stackedBoxes = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().toJSON()),
  );
  expect(stackedBoxes[1]?.y).toBeGreaterThan(stackedBoxes[0]?.y ?? 0);
  expect(stackedBoxes[2]?.y).toBeGreaterThan(stackedBoxes[1]?.y ?? 0);
  expect(await hasHorizontalOverflow(page)).toBe(false);

  await page.setViewportSize({ width: 600, height: 900 });
  const columnBoxes = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().toJSON()),
  );
  expect(columnBoxes[1]?.x).toBeGreaterThan(columnBoxes[0]?.x ?? 0);
  expect(columnBoxes[2]?.x).toBeGreaterThan(columnBoxes[1]?.x ?? 0);
  expect(
    Math.abs((columnBoxes[1]?.y ?? 0) - (columnBoxes[0]?.y ?? 0)),
  ).toBeLessThan(1);
  expect(
    Math.abs((columnBoxes[2]?.y ?? 0) - (columnBoxes[0]?.y ?? 0)),
  ).toBeLessThan(1);
  expect(await hasHorizontalOverflow(page)).toBe(false);

  await selectTenant(page);
  const panelBox = await page.locator(".auth-panel").boundingBox();
  expect(panelBox?.width).toBeLessThanOrEqual(420);

  const targetSizes = await page
    .locator(".door-card, .auth-panel button, .auth-panel input")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const { width, height } = element.getBoundingClientRect();
        return { width, height };
      }),
    );
  for (const { width, height } of targetSizes) {
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  }

  expect(await hasHorizontalOverflow(page)).toBe(false);
});
