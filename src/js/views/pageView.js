import View from './View';
import icons from '../../img/icons.svg';

class PageView extends View {
  _parentEl = document.querySelector('.pagination');

  addHandlerPage(handler) {
    this._parentEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      handler(Number(btn.dataset.page));
    });
  }

  _generateMarkup() {
    const currPage = this._data.page;
    const numPages = Math.ceil(
      Number(this._data.results.length / this._data.resultsPerPage)
    );

    if (currPage === 1 && numPages > 1) {
      return `
      <button data-page="${
        currPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${currPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
      `;
    }

    if (currPage === numPages && currPage > 1) {
      return `
      <button data-page="${
        currPage - 1
      }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${currPage - 1}</span>
      </button>
      `;
    }

    if (currPage > 1 && currPage < numPages) {
      return `
      <button data-page="${
        currPage - 1
      }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${currPage - 1}</span>
      </button>

      <button data-page="${
        currPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${currPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
      `;
    }

    if (currPage === 1 && currPage === numPages) {
      return '';
    }
  }
}

export default new PageView();
