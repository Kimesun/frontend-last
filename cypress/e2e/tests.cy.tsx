// Повторяющиеся селекторы
const SELECTORS = {
  userApi: '/api/auth/user',
  ingredientsApi: '/api/ingredients',
  orderApi: '/api/orders',
  userNameInput: 'input[name="name"]',
  testUserName: 'Kiss me',
  profileUrlPart: '/profile',
  homeUrl: 'http://localhost:4000/',
  bunName: 'Флюоресцентная булка R2-D3',
  fillingName: 'Биокотлета из марсианской Магнолии',
  bunOption: 'Краторная булка',
  bunPlaceholder: 'Выберите булки',
  fillingPlaceholder: 'Выберите начинку',
  orderButton: 'Оформить заказ',
  orderConfirmationText: 'идентификатор заказа',
  constructorTitle: 'Соберите бургер',
  personalCabinet: 'Личный кабинет',
  // Добавлены новые селекторы для конструктора
  constructorBunTop: '[data-cy="constructor-bun-top"]',
  constructorBunBottom: '[data-cy="constructor-bun-bottom"]',
  constructorIngredientsList: '[data-cy="constructor-ingredients"]',
  ingredientInConstructor: '[data-cy="ingredient-in-constructor"]'
};

describe('Авторизация и профиль', () => {
  it('Переход в профиль после входа', () => {
    cy.intercept('GET', SELECTORS.userApi, {
      statusCode: 200,
      body: {
        success: true,
        user: {
          email: 'Kimesun1@yandex.ru',
          name: SELECTORS.testUserName,
        }
      }
    }).as('getUser');

    cy.loginByApi();
    cy.visit('/');
    cy.contains(SELECTORS.personalCabinet).click();
    cy.wait('@getUser');

    cy.contains(SELECTORS.testUserName).click();
    cy.url().should('include', SELECTORS.profileUrlPart);
    cy.get('form', { timeout: 10000 }).should('exist');
    cy.get(SELECTORS.userNameInput).should('have.value', SELECTORS.testUserName);
  });
});

describe('Функциональность конструктора бургеров', () => {
  beforeEach(() => {
    cy.fixture('ingredients.json').as('ingredientsData');
    cy.fixture('user.json').as('userData');

    cy.intercept('GET', SELECTORS.ingredientsApi, {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    cy.intercept('GET', SELECTORS.userApi, {
      fixture: 'user.json'
    }).as('getUser');

    cy.setCookie('accessToken', 'mockToken');
    cy.window().then(win => {
      win.localStorage.setItem('refreshToken', 'mockToken');
    });

    cy.visit('/');
    cy.contains(SELECTORS.constructorTitle, { timeout: 10000 }).should('exist');
  });

  it('Нет булки при старте', () => {
    cy.contains(SELECTORS.bunPlaceholder).should('exist');
    cy.contains(SELECTORS.fillingPlaceholder).should('exist');
  });

  it('Добавление булки в конструктор', () => {
    cy.contains(SELECTORS.bunName).next().click();
    cy.contains(SELECTORS.bunName, { timeout: 10000 }).should('exist');
  });

  it('Добавление начинки в конструктор', () => {
    // 1. Открываем раздел "Начинки" и кликаем на ингредиент
    cy.contains('Начинки').scrollIntoView().click({ force: true });
    cy.contains(SELECTORS.fillingName).next().click();
  
    // 2. Проверяем, что ингредиент появился в конструкторе
    cy.get('.constructor-element')  // Ищем элемент с классом constructor-element
      .should('exist')              // Проверяем, что он существует
      .and('contain', SELECTORS.fillingName);  // И содержит нужный текст
  });

  it('Добавление ингредиентов в заказ и очистка конструктора', () => {
    cy.intercept('POST', SELECTORS.orderApi, {
      fixture: 'makeOrder.json',
      statusCode: 200
    }).as('newOrder');
  
    // Добавляем булку
    cy.contains(SELECTORS.bunName).next().click();
    // Добавляем начинку
    cy.contains('Начинки').scrollIntoView();
    cy.contains(SELECTORS.fillingName).next().click();
  
    // Оформляем заказ
    cy.contains(SELECTORS.orderButton).should('not.be.disabled').click();
    cy.wait('@newOrder', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
  
    // Закрываем модальное окно
    cy.contains(SELECTORS.orderConfirmationText).should('be.visible');
    cy.get('body').type('{esc}');
  
    // Проверяем очистку конструктора
    // 1. Проверяем плейсхолдеры
    cy.contains(SELECTORS.bunPlaceholder).should('be.visible');
    cy.contains(SELECTORS.fillingPlaceholder).should('be.visible');
    
    // 2. Проверяем, что добавленные ингредиенты не видны
    // Вариант 1: проверка по названию
    cy.contains(SELECTORS.bunName).should('not.be.visible');
    cy.contains(SELECTORS.fillingName).should('not.be.visible');
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    // Кликаем по ингредиенту
    cy.contains(SELECTORS.bunOption).click();
  
    // Проверяем модальное окно по найденному классу
    cy.get('.xqsNTMuGR8DdWtMkOGiM').as('modal').should('be.visible');
  
    // Проверяем содержимое внутри модалки
    cy.get('@modal').within(() => {
      cy.contains('h3', SELECTORS.bunOption).should('be.visible'); // Или проверяем заголовок "Детали ингредиента"
    });
  
    // Закрываем модалку
    cy.get('body').type('{esc}');
  
    // Проверяем, что она исчезла
    cy.get('.xqsNTMuGR8DdWtMkOGiM').should('not.exist');
  });

  it('Закрытие модального окна через клик на оверлей', () => {
    cy.contains(SELECTORS.bunOption).click();
    cy.get('body').click(10, 10);
    cy.url().should('eq', SELECTORS.homeUrl);
  });
});