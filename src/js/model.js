import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config';
import { AJAX, getJSON, sendJSON } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const getRecipe = function (data) {
  let { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);

    state.recipe = getRecipe(data);

    if (state.bookmarks.some((book) => book.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
};

export const loadSearch = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map((rec) => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getSearchResults = function (pageNum = state.search.page) {
  const startRes = (pageNum - 1) * state.search.resultsPerPage;
  const endRes = pageNum * state.search.resultsPerPage;
  return state.search.results.slice(startRes, endRes);
};

export const updateServings = function (newServings = state.recipe.servings) {
  state.recipe.ingredients.forEach((ing) => {
    ing.quantity *= newServings / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  saveBookmark();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex((el) => el.id === id);

  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  saveBookmark();
};

const saveBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

const init = function () {
  const storageBM = localStorage.getItem('bookmarks');

  if (storageBM) {
    state.bookmarks = JSON.parse(storageBM);
  }
};
init();

export const uploadRecipe = async function (newData) {
  try {
    const ingredients = Object.entries(newData)
      .filter((entry) => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map((ing) => {
        const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error('Please use the correct Format for ingredients!');
        const [quantity, unit, description] = ingArr;
        return {
          quantity: quantity ? Number(quantity) : null,
          unit,
          description,
        };
      });

    const recipe = {
      title: newData.title,
      publisher: newData.publisher,
      source_url: newData.sourceUrl,
      image_url: newData.image,
      servings: Number(newData.servings),
      cooking_time: Number(newData.cookingTime),
      ingredients,
    };

    const recipeData = await AJAX(`${API_URL}?key=${KEY}`, recipe);

    state.recipe = getRecipe(recipeData);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
