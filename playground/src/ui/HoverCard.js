// playground/src/ui/HoverCard.js

class HoverCard {
  constructor() {
    this.el = document.getElementById("hover-card");
  }

  show(brick, anchorEl, brickState) {
    this.el.querySelector(".hc__title").textContent = brick.label;
    this.el.querySelector(".hc__body").textContent  = brick.plain_english;
    this.el.querySelector(".hc__code pre").textContent = brick.code_snippet.join("\n");

    const depsEl = this.el.querySelector(".hc__deps");
    if (brick.depends_on.length === 0) {
      depsEl.textContent = "No dependencies — can be placed first.";
      depsEl.classList.remove("hc__deps--warning");
    } else {
      depsEl.textContent = "Needs: " + brick.depends_on.join(", ");
      depsEl.classList.toggle("hc__deps--warning", brickState === "locked");
    }

    this.el.querySelector(".hc__scene").textContent = "▸ " + brick.scene_description;

    // Position to the right of the anchor
    const rect = anchorEl.getBoundingClientRect();
    const cardH = 280; // approx — clamp to viewport
    let top = rect.top;
    if (top + cardH > window.innerHeight) top = window.innerHeight - cardH - 8;
    this.el.style.top  = top + "px";
    this.el.style.left = (rect.right + 12) + "px";

    this.el.classList.add("hover-card--visible");
  }

  hide() {
    this.el.classList.remove("hover-card--visible");
  }
}

export default HoverCard;
