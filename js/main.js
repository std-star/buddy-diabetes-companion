/**
 * main.js — shared site behavior across all Buddy pages.
 * ES6 class handling the sticky navbar (mobile toggle + active link state).
 */
class NavBar {
  constructor() {
    this.toggleBtn = document.querySelector('.nav-toggle');
    this.linksEl = document.querySelector('.nav-links');
    this.init();
  }

  init() {
    if (this.toggleBtn && this.linksEl) {
      this.toggleBtn.addEventListener('click', () => this.toggleMenu());
      this.linksEl.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => this.closeMenu());
      });
    }
    this.highlightActiveLink();
  }

  toggleMenu() {
    const isOpen = this.linksEl.classList.toggle('open');
    this.toggleBtn.setAttribute('aria-expanded', String(isOpen));
  }

  closeMenu() {
    this.linksEl.classList.remove('open');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
  }

  highlightActiveLink() {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    this.linksEl.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NavBar();
});
