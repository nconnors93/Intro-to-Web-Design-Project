const messageSelect = document.getElementById("message");
const preorderOptions = document.getElementById("preorder-options");
const productTypeSelect = document.getElementById("product-type");
const productSelect = document.getElementById("product");
const detailsField = document.getElementById("item-details");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const nameCheckmark = document.getElementById("name-checkmark");
const emailCheckmark = document.getElementById("email-checkmark");
const form = document.querySelector("form");
const draftStatus = document.getElementById("draft-status");
const clearDraftButton = document.getElementById("clear-draft");
const draftStorageKey = "northStarBakeryContactDraft";
const draftFields = ["name", "email", "message", "product-type", "product", "item-details", "allergy"]
  .map((id) => document.getElementById(id));
const productsByType = {
  bread: ["Whole Wheat Bread", "White Bread", "Rye Bread", "Sourdough Bread", "Baguette"],
  cookies: ["Chocolate Chip Cookies", "Oatmeal Raisin Cookies", "Peanut Butter Cookies"],
  cake: ["Chocolate Cake", "Vanilla Cake"]
};

function updateProductOptions() {
  productSelect.replaceChildren(new Option("Choose a product", ""));
  const products = productsByType[productTypeSelect.value] || [];
  products.forEach((product) => productSelect.add(new Option(product, product)));
  productSelect.disabled = products.length === 0;
  productSelect.required = products.length > 0;
}

function updateRequestFields() {
  const isPreorder = messageSelect.value === "pre-order";
  preorderOptions.hidden = !isPreorder;
  productTypeSelect.required = isPreorder;
  productTypeSelect.disabled = !isPreorder;
  productSelect.disabled = !isPreorder || !productsByType[productTypeSelect.value];
  productSelect.required = !productSelect.disabled;
  detailsField.required = !isPreorder;
  detailsField.placeholder = isPreorder ? "Optional details about your preorder" : "";
}

function updateCheckmark(field, checkmark) {
  const isValid = field.validity.valid;
  checkmark.hidden = !isValid;
  checkmark.textContent = isValid ? "✓" : "";
}

function updateFieldCheckmarks() {
  updateCheckmark(nameField, nameCheckmark);
  updateCheckmark(emailField, emailCheckmark);
}

function saveDraft() {
  const draft = Object.fromEntries(draftFields.map((field) => [field.id, field.value]));
  try {
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    draftStatus.textContent = "Draft saved in this browser.";
  } catch (error) {
    console.error("Unable to save the contact form draft.", error);
    draftStatus.textContent = "Unable to save your draft in this browser.";
  }
}

function restoreDraft() {
  let savedDraft;
  try {
    const storedDraft = localStorage.getItem(draftStorageKey);
    if (storedDraft === null) return;
    savedDraft = JSON.parse(storedDraft);
    if (savedDraft === null || Array.isArray(savedDraft) || typeof savedDraft !== "object") {
      throw new Error("Saved draft has an invalid format.");
    }
  } catch (error) {
    console.error("Unable to restore the contact form draft.", error);
    draftStatus.textContent = "Unable to restore your saved draft.";
    return;
  }

  draftFields.forEach((field) => {
    if (field.id !== "product" && typeof savedDraft[field.id] === "string") {
      field.value = savedDraft[field.id];
    }
  });
  updateProductOptions();
  if (typeof savedDraft.product === "string") {
    productSelect.value = savedDraft.product;
  }
  updateRequestFields();
  draftStatus.textContent = "Saved draft restored.";
}

function clearDraft() {
  try {
    localStorage.removeItem(draftStorageKey);
    draftStatus.textContent = "Saved draft cleared.";
  } catch (error) {
    console.error("Unable to clear the saved contact form draft.", error);
    draftStatus.textContent = "Unable to clear your saved draft.";
  }
  form.reset();
  updateProductOptions();
  updateRequestFields();
  updateFieldCheckmarks();
}

messageSelect.addEventListener("change", updateRequestFields);
productTypeSelect.addEventListener("change", updateProductOptions);
form.addEventListener("input", updateFieldCheckmarks);
form.addEventListener("change", updateFieldCheckmarks);
form.addEventListener("input", saveDraft);
form.addEventListener("change", saveDraft);
form.addEventListener("submit", () => {
  saveDraft();
  const name = nameField.value.trim();
  const message = messageSelect.value === "pre-order"
    ? `Thank you for your preorder, ${name}!`
    : `Thank you for your feedback, ${name}!`;
  window.alert(message);
});
clearDraftButton.addEventListener("click", clearDraft);
updateProductOptions();
updateRequestFields();
restoreDraft();
updateFieldCheckmarks();