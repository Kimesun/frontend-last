import { configureStore } from '@reduxjs/toolkit';
import feedSlice, {
  feedThunk,
  selectFeed,
  selectLoading,
  selectError,
  selectOrders,
  initialState
} from '../feed-slice';
import { TOrdersData, TOrder } from '@utils-types';
import { getFeedsApi } from '@api';

// Мок для API с элементами фантастики
jest.mock('@api', () => ({
  getFeedsApi: jest.fn(() => Promise.resolve({
    success: true,
    orders: [{
      _id: 'quantum-order-1',
      name: 'Квантовый бургер',
      status: 'warping',
      ingredients: ['antimatter-sauce', 'neutrino-bun'],
      number: 42,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    }],
    total: 1337,
    totalToday: 42
  }))
}));

const mockedGetFeedsApi = getFeedsApi as jest.MockedFunction<typeof getFeedsApi>;

describe('Космическая станция заказов (тест feedSlice)', () => {
  /* Заказы из будущего */
  const quantumOrder: TOrder = {
    _id: 'quantum-order-1',
    name: 'Квантовый бургер',
    status: 'warping',
    ingredients: ['antimatter-sauce', 'neutrino-bun'],
    number: 42,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  };

  const galaxyOrdersData: TOrdersData = {
    orders: [quantumOrder],
    total: 1337,
    totalToday: 42
  };

  const mockApiResponse = {
    ...galaxyOrdersData,
    success: true
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Когда станция только запущена, все системы в режиме ожидания', () => {
    expect(feedSlice(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Квантовый канал передачи данных (feedThunk)', () => {
    it('При активации канала включается индикатор загрузки', () => {
      const action = { type: feedThunk.pending.type };
      const state = feedSlice(initialState, action);
      expect(state).toEqual({
        ...initialState,
        loading: true
      });
    });

    it('При успешной передаче данных квантовые заказы появляются на экране', () => {
      const action = {
        type: feedThunk.fulfilled.type,
        payload: mockApiResponse
      };
      const state = feedSlice(initialState, action);
      expect(state).toEqual({
        ...initialState,
        items: mockApiResponse,
        loading: false
      });
    });

    it('При квантовой интерференции возникает ошибка', () => {
      const error = { message: 'Гравитационные волны нарушили передачу' };
      const action = { type: feedThunk.rejected.type, error };
      const state = feedSlice(initialState, action);
      expect(state).toEqual({
        ...initialState,
        loading: false,
        error
      });
    });

    it('Успешная синхронизация с центральным сервером заказов', async () => {
      mockedGetFeedsApi.mockResolvedValue(mockApiResponse);

      const store = configureStore({
        reducer: {
          feed: feedSlice
        }
      });

      await store.dispatch(feedThunk());

      const state = store.getState().feed;
      expect(state.items?.orders[0].name).toContain('Квантовый');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('Черная дыра прерывает соединение с сервером', async () => {
      const errorMessage = 'Гравитационный коллапс!';
      mockedGetFeedsApi.mockRejectedValue(new Error(errorMessage));

      const store = configureStore({
        reducer: {
          feed: feedSlice
        }
      });

      await store.dispatch(feedThunk());

      const state = store.getState().feed;
      expect(state.items).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error?.message).toEqual(errorMessage);
    });
  });

  describe('Голографические интерфейсы (селекторы)', () => {
    const mockRootState = {
      feed: {
        items: mockApiResponse,
        loading: false,
        error: null
      },
      builder: {} as any,
      ingredients: {} as any,
      order: {} as any,
      user: {} as any
    };

    const blackHoleState = {
      feed: {
        items: null,
        loading: false,
        error: { message: 'Черная дыра поглотила данные' }
      },
      builder: {} as any,
      ingredients: {} as any,
      order: {} as any,
      user: {} as any
    };

    it('Главный экран отображает поток заказов', () => {
      expect(selectFeed(mockRootState)).toEqual(mockApiResponse);
    });

    it('Индикатор загрузки показывает статус передачи', () => {
      expect(selectLoading(mockRootState)).toBe(false);
      expect(selectLoading({
        ...mockRootState,
        feed: { ...initialState, loading: true }
      })).toBe(true);
    });

    it('Система оповещения о критических ошибках', () => {
      expect(selectError(mockRootState)).toBeNull();
      expect(selectError(blackHoleState)).toEqual(
        { message: 'Черная дыра поглотила данные' }
      );
    });

    it('Список активных заказов на навигационной панели', () => {
      expect(selectOrders(mockRootState)).toEqual([quantumOrder]);
      expect(
        selectOrders({
          ...mockRootState,
          feed: { ...initialState }
        })
      ).toEqual([]);
    });
  });
});