import React from 'react'
import { createRoot } from 'react-dom/client'

/**
 * Creates a custom element that mounts a React component into a shadow root.
 * The element observes `data-src` (URL to JSON) and passes it as `src` prop.
 */
export function defineWebComponent(tagName, Component) {
  if (customElements.get(tagName)) return

  class TortugaElement extends HTMLElement {
    constructor() {
      super()
      this._root = null
      this._reactRoot = null
    }

    connectedCallback() {
      this._root = this.attachShadow({ mode: 'open' })
      const container = document.createElement('div')
      this._root.appendChild(container)
      this._reactRoot = createRoot(container)
      this._render()
    }

    disconnectedCallback() {
      this._reactRoot?.unmount()
    }

    static get observedAttributes() {
      return ['data-src']
    }

    attributeChangedCallback() {
      this._render()
    }

    _render() {
      if (!this._reactRoot) return
      const src = this.getAttribute('data-src') || '/data/summary.json'
      this._reactRoot.render(<Component src={src} />)
    }
  }

  customElements.define(tagName, TortugaElement)
}
