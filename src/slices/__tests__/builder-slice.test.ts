import builderSlice, {
  addBunBuilder,
  addItemBuilder,
  deleteItemBuilder,
  moveItems,
  clearBuilder,
  selectConstructorItems,
  selectBun,
  selectConstructorTotalCount
} from '../builder-slice';
import { TConstructorIngredient, TIngredient } from '@utils-types';
import { v4 as uuidv4 } from 'uuid';

describe('Бургерное королевство (тест builderSlice)', () => {
  /* Волшебные ингредиенты из кулинарной книги алхимика */
  const galacticBun: TIngredient = {
    _id: 'galactic-bun',
    name: 'Галактическая булочка',
    type: 'bun',
    proteins: 42,
    fat: 13,
    carbohydrates: 77,
    calories: 1337,
    price: 450,
    image: 'galactic-bun.png',
    image_mobile: 'galactic-bun-mobile.png',
    image_large: 'galactic-bun-large.png'
  };

  const dragonScaleSauce: TConstructorIngredient = {
    _id: 'dragon-scale',
    name: 'Соус из драконьей чешуи',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 5,
    calories: 300,
    price: 200,
    image: 'dragon-sauce.png',
    image_mobile: 'dragon-sauce-mobile.png',
    image_large: 'dragon-sauce-large.png',
    id: uuidv4()
  };

  const unicornMeat: TConstructorIngredient = {
    _id: 'unicorn-meat',
    name: 'Филе единорога',
    type: 'main',
    proteins: 99,
    fat: 5,
    carbohydrates: 0,
    calories: 500,
    price: 999,
    image: 'unicorn-meat.png',
    image_mobile: 'unicorn-meat-mobile.png',
    image_large: 'unicorn-meat-large.png',
    id: uuidv4()
  };

  const phoenixFeather: TConstructorIngredient = {
    _id: 'phoenix-feather',
    name: 'Перо феникса',
    type: 'main',
    proteins: 70,
    fat: 10,
    carbohydrates: 20,
    calories: 250,
    price: 750,
    image: 'phoenix-feather.png',
    image_mobile: 'phoenix-feather-mobile.png',
    image_large: 'phoenix-feather-large.png',
    id: uuidv4()
  };

  it('Когда королевство только создано, в нём нет ни булочек, ни ингредиентов', () => {
    expect(builderSlice(undefined, { type: '' })).toEqual({
      constructorItems: {
        bun: null,
        ingredients: []
      }
    });
  });

  describe('Церемония добавления булочки', () => {
    it('Галактическая булочка должна занять трон конструктора', () => {
      const emptyKingdom = {
        constructorItems: {
          bun: null,
          ingredients: []
        }
      };

      expect(builderSlice(emptyKingdom, addBunBuilder(galacticBun))).toEqual({
        constructorItems: {
          bun: galacticBun,
          ingredients: []
        }
      });
    });

    it('Когда на троне уже есть булочка, новая должна её заменить', () => {
      const kingdomWithBun = {
        constructorItems: {
          bun: galacticBun,
          ingredients: []
        }
      };

      const blackHoleBun: TIngredient = {
        ...galacticBun,
        _id: 'black-hole-bun',
        name: 'Булочка из чёрной дыры',
        price: 1000
      };

      expect(builderSlice(kingdomWithBun, addBunBuilder(blackHoleBun))).toEqual({
        constructorItems: {
          bun: blackHoleBun,
          ingredients: []
        }
      });
    });
  });

  describe('Магические ингредиенты', () => {
    it('Драконий соус должен появиться в свитке ингредиентов', () => {
      const action = addItemBuilder({
        ...dragonScaleSauce,
        id: undefined as unknown as string
      });

      const result = builderSlice({
        constructorItems: {
          bun: galacticBun,
          ingredients: []
        }
      }, action);

      expect(result.constructorItems.ingredients).toHaveLength(1);
      expect(result.constructorItems.ingredients[0].name).toContain('драконьей');
    });

    it('Филе единорога должно получить магический идентификатор', () => {
      const action = addItemBuilder({
        ...unicornMeat,
        id: undefined as unknown as string
      });

      const result = builderSlice({
        constructorItems: {
          bun: galacticBun,
          ingredients: []
        }
      }, action);

      expect(result.constructorItems.ingredients[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('Опасные эксперименты с ингредиентами', () => {
    const initialState = {
      constructorItems: {
        bun: galacticBun,
        ingredients: [dragonScaleSauce, unicornMeat, phoenixFeather]
      }
    };

    it('Удаление драконьего соуса должно оставить только благородные ингредиенты', () => {
      const action = deleteItemBuilder({
        id: dragonScaleSauce.id,
        type: 'sauce'
      });

      const result = builderSlice(initialState, action);

      expect(result.constructorItems.ingredients).toHaveLength(2);
      expect(result.constructorItems.ingredients.some(i => i.name.includes('дракон'))).toBeFalsy();
    });

    it('Перо феникса должно взлететь вверх при правильном заклинании', () => {
      const action = moveItems({
        index: 2, // перо феникса в конце
        direction: 'up'
      });

      const result = builderSlice(initialState, action);

      expect(result.constructorItems.ingredients[1].name).toBe('Перо феникса');
    });

    it('Филе единорога не должно исчезнуть при попытке удалить несуществующий ингредиент', () => {
      const action = deleteItemBuilder({
        id: 'non-existent',
        type: 'main'
      });

      const result = builderSlice(initialState, action);
      expect(result.constructorItems.ingredients).toHaveLength(3);
    });
  });

  describe('Ритуал очищения', () => {
    it('Волшебный артефакт должен вернуть королевство в исходное состояние', () => {
      const messyKingdom = {
        constructorItems: {
          bun: galacticBun,
          ingredients: [dragonScaleSauce, unicornMeat, phoenixFeather]
        }
      };

      const result = builderSlice(messyKingdom, clearBuilder());
      
      expect(result).toEqual({
        constructorItems: {
          bun: null,
          ingredients: []
        }
      });
    });
  });

  describe('Мудрые советники королевства (селекторы)', () => {
    const kingdomState = {
      builder: {
        constructorItems: {
          bun: galacticBun,
          ingredients: [dragonScaleSauce, unicornMeat]
        }
      }
    };

    it('Главный советник должен знать всё о булочках', () => {
      // @ts-ignore
      expect(selectBun(kingdomState)).toEqual(galacticBun);
    });

    it('Хранитель свитков должен пересчитывать все ингредиенты', () => {
      // @ts-ignore
      expect(selectConstructorTotalCount(kingdomState)).toBe(2);
    });

    it('Совет мудрейших должен видеть полную картину', () => {
      // @ts-ignore
      expect(selectConstructorItems(kingdomState)).toEqual({
        bun: galacticBun,
        ingredients: [dragonScaleSauce, unicornMeat]
      });
    });
  });
});