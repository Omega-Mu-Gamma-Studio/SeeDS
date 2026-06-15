// =============================================================
//  SeeDS — Toolbar.js
//  Top bar UI. Slimmed down — DS selection + demos now live in
//  AlgoPanel (left sidebar). This bar keeps:
//    - Brand / logo
//    - Camera reset button
//    - Fullscreen button
//  Communicates exclusively via eventBus.
// =============================================================

import eventBus from '../core/eventBus.js';
import { EVENTS, APP, THEME } from '../core/constants.js';


class Toolbar {
  constructor(containerEl) {
    this._container = containerEl;
    this._build();
  }


  // -----------------------------------------------------------
  //  Build DOM
  // -----------------------------------------------------------
  _build() {
    this._container.innerHTML = '';
    this._container.className = 'toolbar';

    // Brand
    const brand = document.createElement('div');
    brand.className   = 'toolbar__brand';
    brand.textContent = 'SeeDS';
    this._container.appendChild(brand);

    // Mode badge
    const badge = document.createElement('div');
    badge.className = 'toolbar__mode-badge';
    badge.textContent = 'Standard Mode';
    this._container.appendChild(badge);

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    this._container.appendChild(spacer);

    // Right group — fullscreen, camera reset
    const right = document.createElement('div');
    right.className = 'toolbar__right';

    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className   = 'toolbar__btn toolbar__btn--icon';
    fullscreenBtn.textContent = '⛶ Fullscreen';
    fullscreenBtn.title       = 'Toggle fullscreen view';
    fullscreenBtn.addEventListener('click', () => {
      eventBus.emit('fullscreen:set', { enabled: !document.body.classList.contains('fullscreen-mode') });
    });
    eventBus.on('fullscreen:set', ({ enabled }) => {
      fullscreenBtn.textContent = enabled ? '✕ Exit' : '⛶ Fullscreen';
    });
    right.appendChild(fullscreenBtn);

    const resetBtn = document.createElement('button');
    resetBtn.className   = 'toolbar__btn toolbar__btn--icon';
    resetBtn.textContent = '⌖ Reset';
    resetBtn.title       = 'Reset camera to default position';
    resetBtn.addEventListener('click', () => {
      eventBus.emit(EVENTS.PLAYBACK_RESET);
      eventBus.emit('camera:reset');
    });
    right.appendChild(resetBtn);
    this._container.appendChild(right);
  }


  // -----------------------------------------------------------
  //  Cleanup
  // -----------------------------------------------------------
  dispose() {
    this._container.innerHTML = '';
  }
}


export default Toolbar;