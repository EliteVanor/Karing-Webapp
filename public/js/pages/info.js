// info.html: expand and collapse the stroke information sections.
for (const button of document.querySelectorAll(".collapsible")) {
  const panel = button.nextElementSibling;
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => {
    const open = button.classList.toggle("active");
    button.setAttribute("aria-expanded", String(open));
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : null;
  });
}
