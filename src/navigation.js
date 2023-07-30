const getNavElements = () => document.querySelectorAll("nav ul li");

const setNavElementUnderlineWidth = (navElement, width) =>
  navElement.style.setProperty("--nav-underline-width", width);

getNavElements().forEach((navElement) => {
  navElement.addEventListener("click", (e) => {
    getNavElements().forEach((navElement) => {
      setNavElementUnderlineWidth(navElement, "0%");
    });
    const navElement = e.target;
    setNavElementUnderlineWidth(navElement, "100%");
  });
});

const setTableMargin = (margin) =>
  document
    .querySelectorAll("table")
    .forEach((table) => table.style.setProperty("--table-margin", margin));

const getSectionWidth = () =>
  document.querySelector("section").getBoundingClientRect().width;

const mainTab = document.getElementById("main-tab");
const summaryTab = document.getElementById("summary-tab");
const archivedTab = document.getElementById("archived-tab");

mainTab.addEventListener("click", () => {
  setTableMargin("0px");
});
summaryTab.addEventListener("click", () => {
  setTableMargin(`${-getSectionWidth()}px`);
});
archivedTab.addEventListener("click", () => {
  setTableMargin(`${-2 * getSectionWidth()}px`);
});
