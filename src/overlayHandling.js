export const showOverlay = (overlay) => {
  overlay.classList.remove("overlay-appearence-down");
  overlay.classList.add("overlay-appearence-up");
};
export const hideOverlay = (overlay) => {
  overlay.classList.remove("overlay-appearence-up");
  overlay.classList.add("overlay-appearence-down");
};
export const getEditOverlay = () => document.getElementById("edit-form");
export const getDeleteOverlay = () => document.getElementById("delete-form");
export const getCreateOverlay = () => document.getElementById("create-form");
export const getAllOverlays = () =>
  document.querySelectorAll(".overlay-background");
export const clearAllErrorBlocks = () => {
  const errorBlocks = document.querySelectorAll(".error-block");
  errorBlocks.forEach((errorBlock) => {
    errorBlock.style.visibility = "hidden";
    errorBlock.innerText = "";
  });
};
export const getCreateForm = () => document.querySelector("#create-form form");
export const getEditForm = () => document.querySelector("#edit-form form");
