import { configureStore } from '@reduxjs/toolkit';
import ingredientsSlice, {
  fetchIngredients,
  selectIngredients,
  selectBuns,
  selectMains,
  selectSauces,
  selectIsLoading
} from '../ingredients-slice';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';

// Мок для API с элементами кулинарного шоу
jest.mock('@api', () => ({
  getIngredientsApi: jest.fn(() => Promise.resolve([
    {
      _id: 'golden-bun',
      name: 'Золотая булочка',
      type: 'bun',
      proteins: 10,
      fat: 5,
      carbohydrates: 15,
      calories: 100,
      price: 999,
      image: 'golden-bun.jpg'
    },
    {
      _id: 'dragon-steak',
      name: 'Стейк из дракона',
      type: 'main',
      proteins: 99,
      fat: 30,
      carbohydrates: 0,
      calories: 500,
      price: 1999,
      image: 'dragon-steak.jpg'
    },
    {
      _id: 'unicorn-sauce',
      name: 'Соус единорога',
      type: 'sauce',
      proteins: 5,
      fat: 2,
      carbohydrates: 10,
      calories: 50,
      price: 499,
      image: 'unicorn-sauce.jpg'
    }
  ]))
}));

const mockedGetIngredientsApi = getIngredientsApi as jest.MockedFunction<
  typeof getIngredientsApi
>;

describe('Кулинарная книга волшебных ингредиентов (тест ingredientsSlice)', () => {
  /* Ингредиенты из меню ресторана "Хогвартс" */
  const magicalIngredients: TIngredient[] = [
    {
      _id: 'golden-bun',
      name: 'Золотая булочка',
      type: 'bun',
      proteins: 10,
      fat: 5,
      carbohydrates: 15,
      calories: 100,
      price: 999,
      image: 'golden-bun.jpg',
      image_mobile: 'golden-bun-mobile.jpg',
      image_large: 'golden-bun-large.jpg'
    },
    {
      _id: 'dragon-steak',
      name: 'Стейк из дракона',
      type: 'main',
      proteins: 99,
      fat: 30,
      carbohydrates: 0,
      calories: 500,
      price: 1999,
      image: 'dragon-steak.jpg',
      image_mobile: 'dragon-steak-mobile.jpg',
      image_large: 'dragon-steak-large.jpg'
    },
    {
      _id: 'unicorn-sauce',
      name: 'Соус единорога',
      type: 'sauce',
      proteins: 5,
      fat: 2,
      carbohydrates: 10,
      calories: 50,
      price: 499,
      image: 'unicorn-sauce.jpg',
      image_mobile: 'unicorn-sauce-mobile.jpg',
      image_large: 'unicorn-sauce-large.jpg'
    }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Когда книга только открыта, все страницы пусты', () => {
    expect(ingredientsSlice(undefined, { type: 'unknown' })).toEqual({
      items: [],
      buns: [],
      mains: [],
      sauces: [],
      isLoading: true,
      error: null
    });
  });

  describe('Заклинание загрузки ингредиентов (fetchIngredients)', () => {
    it('Когда волшебник начинает заклинание, появляется индикатор загрузки', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = ingredientsSlice(undefined, action);
      expect(state).toEqual({
        items: [],
        buns: [],
        mains: [],
        sauces: [],
        isLoading: true,
        error: null
      });
    });

    it('При успешном заклинании в книге появляются все ингредиенты', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: magicalIngredients
      };
      const state = ingredientsSlice(undefined, action);

      expect(state).toEqual({
        items: magicalIngredients,
        buns: magicalIngredients.filter((item) => item.type === 'bun'),
        mains: magicalIngredients.filter((item) => item.type === 'main'),
        sauces: magicalIngredients.filter((item) => item.type === 'sauce'),
        isLoading: false,
        error: null
      });
    });

    it('Если заклинание прерывается, в книге появляется сообщение об ошибке', () => {
      const error = { message: 'Заклинание не сработало!' };
      const action = {
        type: fetchIngredients.rejected.type,
        error
      };
      const state = ingredientsSlice(undefined, action);

      expect(state).toEqual({
        items: [],
        buns: [],
        mains: [],
        sauces: [],
        isLoading: false,
        error
      });
    });

    it('Успешное чтение древнего кулинарного свитка', async () => {
      mockedGetIngredientsApi.mockResolvedValue(magicalIngredients);

      const store = configureStore({
        reducer: {
          ingredients: ingredientsSlice
        }
      });

      await store.dispatch(fetchIngredients());

      const state = store.getState().ingredients;
      expect(state.items).toContainEqual(
        expect.objectContaining({ name: 'Золотая булочка' })
      );
      expect(state.buns.length).toBe(1);
      expect(state.mains[0].name).toContain('дракона');
      expect(state.sauces[0].name).toContain('единорога');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('Дракон сжег кулинарный свиток', async () => {
      const errorMessage = 'Дракон сжег ингредиенты!';
      mockedGetIngredientsApi.mockRejectedValue(new Error(errorMessage));

      const store = configureStore({
        reducer: {
          ingredients: ingredientsSlice
        }
      });

      await store.dispatch(fetchIngredients());

      const state = store.getState().ingredients;
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error?.message).toEqual(errorMessage);
    });
  });

  describe('Волшебные указатели (селекторы)', () => {
    const mockState = {
      ingredients: {
        items: magicalIngredients,
        buns: magicalIngredients.filter((item) => item.type === 'bun'),
        mains: magicalIngredients.filter((item) => item.type === 'main'),
        sauces: magicalIngredients.filter((item) => item.type === 'sauce'),
        isLoading: false,
        error: null
      },
      feed: {} as any,
      builder: {} as any,
      order: {} as any,
      user: {} as any
    };

    it('Указатель на все ингредиенты показывает полный список', () => {
      expect(selectIngredients(mockState)).toEqual(magicalIngredients);
    });

    it('Указатель на булки находит только волшебные булочки', () => {
      const buns = selectBuns(mockState);
      expect(buns.length).toBe(1);
      expect(buns[0].price).toBe(999); // Золотая булочка дорогая!
    });

    it('Указатель на начинки находит только мясо дракона', () => {
      const mains = selectMains(mockState);
      expect(mains.length).toBe(1);
      expect(mains[0].proteins).toBe(99); // Очень протеиновое!
    });

    it('Указатель на соусы находит только соус единорога', () => {
      const sauces = selectSauces(mockState);
      expect(sauces.length).toBe(1);
      expect(sauces[0].name).toMatch(/единорога/i);
    });

    it('Указатель загрузки показывает, идет ли чтение заклинаний', () => {
      expect(selectIsLoading(mockState)).toBe(false);
      expect(selectIsLoading({
        ...mockState,
        ingredients: { ...mockState.ingredients, isLoading: true }
      })).toBe(true);
    });
  });
});