// playground/src/ui/ThemePicker.js
// ─────────────────────────────────────────────────────────────────────────────
// Tiny floating theme-picker button for Playground Mode.
// Renders itself into the DOM; call mount() once after the page is ready.
//
// Usage:
//   import ThemePicker from "../ui/ThemePicker.js";
//   const picker = new ThemePicker(themeEngine);
//   picker.mount();
// ─────────────────────────────────────────────────────────────────────────────

import { THEMES, THEME_ORDER } from "../core/ThemeEngine.js";

class ThemePicker {
  constructor(engine) {
    this.engine  = engine;
    this._open   = false;
    this._btn    = null;
    this._popover = null;
  }

  mount() {
    // ── Outer wrapper (fixed position, sits top-right of canvas area) ────────
    const wrap = document.createElement("div");
    wrap.id = "theme-picker-wrap";

    // ── Toggle button ────────────────────────────────────────────────────────
    const btn = document.createElement("button");
    btn.id = "theme-picker-btn";
    btn.title = "Change color theme";
    btn.setAttribute("aria-label", "Color theme picker");
    btn.innerHTML = this._btnInner(this.engine.current);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggle();
    });
    this._btn = btn;

    // ── Popover panel ────────────────────────────────────────────────────────
    const popover = document.createElement("div");
    popover.id = "theme-picker-popover";
    popover.setAttribute("aria-hidden", "true");

    const label = document.createElement("div");
    label.className = "tp__label";
    label.textContent = "Color Theme";
    popover.appendChild(label);

    const grid = document.createElement("div");
    grid.className = "tp__grid";

    THEME_ORDER.forEach(key => {
      const t    = THEMES[key];
      const item = document.createElement("button");
      item.className = "tp__item";
      item.dataset.theme = key;
      item.setAttribute("aria-label", `Apply ${t.label} theme`);
      item.innerHTML = `
        <span class="tp__swatch" style="background:${this._swatchGradient(t.three)}"></span>
        <span class="tp__name">${t.icon} ${t.label}</span>
      `;
      if (key === this.engine.current) item.classList.add("tp__item--active");

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.engine.apply(key);
        this._updateActive(key);
        this._btn.innerHTML = this._btnInner(key);
        this._close();
      });

      grid.appendChild(item);
    });

    popover.appendChild(grid);
    this._popover = popover;

    wrap.appendChild(btn);
    wrap.appendChild(popover);
    document.body.appendChild(wrap);

    // Close on outside click
    document.addEventListener("click", () => this._close());

    // Update active state when theme changes externally
    this.engine.onChange((key) => {
      this._updateActive(key);
      if (this._btn) this._btn.innerHTML = this._btnInner(key);
    });
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _toggle() {
    this._open ? this._close() : this._open_();
  }

  _open_() {
    this._open = true;
    this._popover.classList.add("tp__popover--visible");
    this._popover.setAttribute("aria-hidden", "false");
    this._btn.classList.add("tp__btn--active");
  }

  _close() {
    if (!this._open) return;
    this._open = false;
    this._popover.classList.remove("tp__popover--visible");
    this._popover.setAttribute("aria-hidden", "true");
    this._btn.classList.remove("tp__btn--active");
  }

  _updateActive(key) {
    if (!this._popover) return;
    this._popover.querySelectorAll(".tp__item").forEach(item => {
      item.classList.toggle("tp__item--active", item.dataset.theme === key);
    });
  }

  _btnInner(key) {
    const t = THEMES[key];
    return `<span class="tp__btn-icon">${t.icon}</span><span class="tp__btn-label">${t.label}</span>`;
  }

  // Build a tiny 3-stop gradient swatch from a theme's Three.js palette
  _swatchGradient(three) {
    const toHex = (n) => `#${n.toString(16).padStart(6, "0")}`;
    const c1 = toHex(three.node);
    const c2 = toHex(three.nodePlaced);
    const c3 = toHex(three.nodeTraverse);
    return `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
  }
}

export default ThemePicker;
