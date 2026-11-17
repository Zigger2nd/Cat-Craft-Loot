export function initIntroductionPage() {
  const page = document.getElementById("introduction");

  if (!page) {
    console.warn("Introduction page not found.");
    return;
  }

  const homeButton = page.querySelector(".intro-home-btn");

  if (!homeButton) {
    return;
  }

  homeButton.addEventListener("click", () => {
    window.location.hash = "home";
  });
}
