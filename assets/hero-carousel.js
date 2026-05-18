import { Component } from '@theme/component';

/**
 * Hero carousel controls component.
 * Manages progress bar animations on thumbnail navigation buttons.
 * Listens for aria-selected changes from the parent slideshow-component
 * and restarts the CSS progress animation on the active thumbnail.
 *
 * @typedef {Object} HeroCarouselControlsRefs
 * @property {HTMLElement[]} [dots] - Thumbnail dot/button elements
 *
 * @extends {Component<HeroCarouselControlsRefs>}
 */
class HeroCarouselControls extends Component {
  /** @type {MutationObserver|null} */
  #observer = null;

  /** @type {HTMLElement|null} */
  #slideshow = null;

  /** @type {MutationObserver|null} */
  #pauseObserver = null;

  connectedCallback() {
    super.connectedCallback();

    this.#slideshow = this.closest('slideshow-component');

    this.#setupAriaObserver();
    this.#setupPauseObserver();

    // Initialize the active state on the first dot
    this.#syncActiveState();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }

    if (this.#pauseObserver) {
      this.#pauseObserver.disconnect();
      this.#pauseObserver = null;
    }
  }

  /**
   * Observe aria-selected changes on all dot elements
   * to restart the progress bar animation on the active thumbnail.
   */
  #setupAriaObserver() {
    const dots = this.refs.dots;
    if (!dots?.length) return;

    this.#observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'aria-selected'
        ) {
          this.#syncActiveState();
          return;
        }
      }
    });

    for (const dot of dots) {
      this.#observer.observe(dot, {
        attributes: true,
        attributeFilter: ['aria-selected'],
      });
    }
  }

  /**
   * Observe the parent slideshow-component for paused attribute changes
   * to toggle animation-play-state on progress bars.
   */
  #setupPauseObserver() {
    if (!this.#slideshow) return;

    this.#pauseObserver = new MutationObserver(() => {
      this.#updatePauseState();
    });

    this.#pauseObserver.observe(this.#slideshow, {
      attributes: true,
      attributeFilter: ['paused'],
    });

    this.#updatePauseState();
  }

  /**
   * Sync the active class on dots and restart the progress bar animation.
   */
  #syncActiveState() {
    const dots = this.refs.dots;
    if (!dots?.length) return;

    for (const dot of dots) {
      const isActive = dot.getAttribute('aria-selected') === 'true';
      const progressFill = dot.querySelector('.hero-carousel__progress-fill');

      if (isActive) {
        dot.classList.add('is-active');

        // Restart the animation by removing and re-adding the element
        if (progressFill) {
          progressFill.style.animation = 'none';
          // Force reflow to restart animation
          void progressFill.offsetWidth;
          progressFill.style.animation = '';
        }
      } else {
        dot.classList.remove('is-active');
      }
    }
  }

  /**
   * Toggle animation-play-state based on paused state.
   */
  #updatePauseState() {
    if (!this.#slideshow) return;

    const isPaused = this.#slideshow.hasAttribute('paused');
    this.toggleAttribute('paused', isPaused);
  }
}

if (!customElements.get('hero-carousel-controls')) {
  customElements.define('hero-carousel-controls', HeroCarouselControls);
}
