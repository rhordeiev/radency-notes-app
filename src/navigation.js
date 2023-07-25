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
