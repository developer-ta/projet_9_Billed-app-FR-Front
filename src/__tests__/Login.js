/**
 * @jest-environment jsdom
 */
import Store from "../app/Store.js";
import LoginUI from "../views/LoginUI";
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";

import { localStorageMock } from "../__mocks__/localStorage.js";

import $ from "jquery";
import mockStore from "../__mocks__/store";

import { ROUTES, ROUTES_PATH } from "../constants/routes";

//Page Login employee
//original 1
describe("Given : Je suis un utilisateur non connecté sur la page de login avec le formulaire employé. ", () => {
  //original
  describe("When I do fill fields in correct format and I click on Employee button Login In", () => {
    let mockDocument, mockBills, mockOnNavigate, mockLocalStorage, mockNewLogin, mockStore, mockInputData;
    // mockPREVIOUS_LOCATION ,
    beforeEach(async () => {
      mockDocument = document;
      mockBills = bills;

      Object.defineProperty(window, "localStorage", { value: localStorageMock });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "f@test.tld",
        })
      );

      mockLocalStorage = window.localStorage;
      jest.spyOn(window.localStorage, "setItem");
    });
    afterEach(() => {
      mockLocalStorage.clear();
      mockDocument.body.innerHTML = "";
    });

    test("Then I handles employee login submission store ", () => {
      //dom
      mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

      //dependance injection

      mockOnNavigate = jest.fn(() => {
        const rootDiv = document.getElementById("root");
        rootDiv.innerHTML = BillsUI({ bills: mockBills });
      });

      mockStore = { login: jest.fn().mockResolvedValue({}) };

      //instance Login
      mockNewLogin = new Login({
        document: mockDocument,
        localStorage: window.localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });
      //if  input correct
      mockInputData = {
        type: "Employee",
        email: "employee@email.com", //admin@company.tld ; mot de passe : admin
        password: "azerty",
        status: "connected",
      };

      const $inputEmailUser = screen.getByTestId("admin-email-input"); // ok
      fireEvent.change($inputEmailUser, { target: { value: mockInputData.email } }); // ok

      expect($inputEmailUser.value).toBe(mockInputData.email); // ok

      const $inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change($inputPasswordUser, {
        target: { value: mockInputData.password },
      });
      expect($inputPasswordUser.value).toBe(mockInputData.password); // ok

      const $form = screen.getByTestId("form-admin");

      const MockHandleSubmitEmployee = jest.fn((e) => mockNewLogin.handleSubmitEmployee(e));

      $form.addEventListener("submit", MockHandleSubmitEmployee);
      fireEvent.submit($form);

      expect(MockHandleSubmitEmployee).toHaveBeenCalled();
      //expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      expect(screen.getByText("Billed")).toBeTruthy();
    });
    test("Then I handles employee login submission", () => {
      //dom
      mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

      //dependance injection

      mockOnNavigate = jest.fn(() => {
        const rootDiv = document.getElementById("root");
        rootDiv.innerHTML = BillsUI({ bills: mockBills });
      });

      mockStore = {
        login: jest.fn().mockResolvedValue({ jwt: "Connexion ok" }),
        users: () => {
          return {
            create: jest.fn().mockResolvedValue(),
          };
        },
      };

      //instance Login
      mockNewLogin = new Login({
        document: mockDocument,
        localStorage: window.localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });
      //if  input correct
      mockInputData = {
        type: "Employee",
        email: "employee@email.com",
        password: "azerty",
        status: "connected",
      };
      // jest.spyOn(mockStore, "mockStore.login");
      const $inputEmailUser = screen.getByTestId("admin-email-input"); // ok
      fireEvent.change($inputEmailUser, { target: { value: mockInputData.email } }); // ok

      expect($inputEmailUser.value).toBe(mockInputData.email); // ok

      const $inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change($inputPasswordUser, {
        target: { value: mockInputData.password },
      });
      expect($inputPasswordUser.value).toBe(mockInputData.password); // ok

      const $form = screen.getByTestId("form-admin");

      const MockHandleSubmitEmployee = jest.fn((e) => mockNewLogin.handleSubmitEmployee(e));

      $form.addEventListener("submit", MockHandleSubmitEmployee);

      fireEvent.submit($form);

      expect(MockHandleSubmitEmployee).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      //expect(mockLocalStorage.setItem).toHaveBeenCalledWith("jwt", "Connexion ok");
      expect(mockNewLogin.store.login).toHaveBeenCalled();
      expect(screen.getByText("Billed")).toBeTruthy();

      // if login return null
      mockNewLogin.store = "";
      //fireEvent.submit($form);
      //expect(MockHandleSubmitEmployee).toHaveBeenCalled();
      expect(mockNewLogin.login()).toBeNull();
      expect(mockNewLogin.createUser()).toBeNull();
    });
    test("Then I handles employee login submission login reject", async () => {
      //dom
      mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

      //dependance injection

      mockOnNavigate = jest.fn(() => {
        const rootDiv = document.getElementById("root");
        rootDiv.innerHTML = BillsUI({ bills: mockBills });
      });

      mockStore = {
        login: jest.fn().mockResolvedValue({}),
        users: () => {
          return {
            create: jest.fn().mockResolvedValue(),
          };
        },
      };

      //instance Login
      mockNewLogin = new Login({
        document: mockDocument,
        localStorage: window.localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });
      //if  input correct
      mockInputData = {
        type: "Employee",
        email: "employee@email.com",
        password: "azerty",
        status: "connected",
      };

      const mockUser = mockInputData;
      mockNewLogin.login = jest.fn().mockResolvedValue("new user");
      const message = await mockNewLogin.createUser(mockUser);

      expect(message).toBe("new user");
      expect(screen.getByText("Billed")).toBeTruthy();
    });
  });
});

//correction 1
describe("Given : Je suis un utilisateur non connecté sur la page de login avec le formulaire employé. ", () => {
  // Scénario 1 :

  describe(" Module de connexion employé : Login.js", () => {
    //Préparer l'environnement Simuler
    // L'état initial  test
    let mockDocument,
      mockBills,
      mockOnNavigate,
      mockLocalStorage,
      mockNewLogin,
      mockStore,
      mockInputData,
      //dom elements
      $inputEmailUser,
      $form,
      $inputPasswordUser;
    // mockPREVIOUS_LOCATION ,

    //mock dom
    mockDocument = document;
    mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

    mockBills = bills;

    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );

    //dependency injection
    mockLocalStorage = window.localStorage;
    mockOnNavigate = jest.fn(() => {
      const rootDiv = document.getElementById("root");
      rootDiv.innerHTML = BillsUI({ bills: mockBills });
    });

    mockStore = { login: jest.fn().mockResolvedValue({ jwt: "jwt" }) };

    //form data input
    mockInputData = {
      type: "Employee",
      email: "employee@email.com",
      password: "azerty",
      status: "connected",
    };
    //Initialisation dom elements
    $inputEmailUser = screen.getByTestId("employee-email-input");
    $inputPasswordUser = screen.getByTestId("employee-password-input");
    $form = screen.getByTestId("form-employee");

    //ok
    describe('when : Je clique sur le bouton "Se connecter" sans remplir les champs "Email" et "Mot de passe" du formulaire employé.', () => {
      beforeEach(() => {
        mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
        //instance Login
        mockNewLogin = new Login({
          document: mockDocument,
          localStorage: window.localStorage,
          onNavigate: mockOnNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });

        jest.spyOn(window.localStorage, "setItem");
      });
      afterEach(() => {
        mockLocalStorage.clear();
      });

      test("Then: Devrait appeler La méthode handleSubmitEmployee , connexion n'est pas succès et Je reste sur la page login", () => {
        fireEvent.change($inputEmailUser, { target: { value: "" } }); // ok
        expect($inputEmailUser.value).toBe(""); // ok
        fireEvent.change($inputPasswordUser, {
          target: { value: "" },
        });
        expect($inputPasswordUser.value).toBe(""); // ok
        const MockHandleSubmitEmployee = jest.fn((e) => mockNewLogin.handleSubmitEmployee(e));
        $form.addEventListener("submit", MockHandleSubmitEmployee);
        fireEvent.submit($form);
        expect(MockHandleSubmitEmployee).toHaveBeenCalled();

        expect(screen.getByText("Billed")).toBeTruthy();
      });
    });
    //ok
    describe("When : Je suis sur login page , je entre des informations manquantes ou invalides pour le champ e-mail et clique sur Se connecter.(sans la forme chaîne@chaîne.cc)", () => {
      beforeEach(() => {
        mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
        //instance Login
        mockNewLogin = new Login({
          document: mockDocument,
          localStorage: window.localStorage,
          onNavigate: mockOnNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });

        jest.spyOn(window.localStorage, "setItem");
      });
      afterEach(() => {
        mockLocalStorage.clear();
        mockDocument.body.innerHTML = "";
      });
      test("Then : je reste sur la page Login , Les messages d'erreur appropriés sont affichés et je suis invité à remplir le champ e-mail au bon format", () => {
        fireEvent.change($inputEmailUser, { target: { value: "chaîne@chaîne" } });
        expect($inputEmailUser.value).toBe("chaîne@chaîne");

        fireEvent.change($inputPasswordUser, { target: { value: "azerty" } });
        expect($inputPasswordUser.value).toBe("azerty");

        const MockHandleSubmitEmployee = jest.fn((e) => mockNewLogin.handleSubmitEmployee(e));
        $form.addEventListener("submit", MockHandleSubmitEmployee);
        fireEvent.submit($form);
        expect(screen.getByTestId("errorSpan-email").textContent).toBe("Veuillez entrer une adresse email valide");
        expect(MockHandleSubmitEmployee).toHaveBeenCalled();

        expect(screen.getByText("Billed")).toBeTruthy();
        expect($form).toBeTruthy();
      });
    });
    //ok
    describe("when je sur la page Login Appel de méthode validator avec invalide email but valide password", () => {
      beforeEach(() => {
        mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
        //instance Login
        mockNewLogin = new Login({
          document: mockDocument,
          localStorage: window.localStorage,
          onNavigate: mockOnNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });

        jest.spyOn(window.localStorage, "setItem");
      });
      afterEach(() => {
        mockLocalStorage.clear();
        mockDocument.body.innerHTML = "";
      });
      test("Then : je sur la page Login , Devrais retourner le résultat vrai ", () => {
        fireEvent.change($inputEmailUser, { target: { value: "e@ss" } });
        expect($inputEmailUser.value).toBe("e@ss");
        // email ok but password ok

        fireEvent.change($inputPasswordUser, { target: { value: mockInputData.password } });
        expect($inputPasswordUser.value).toBe(mockInputData.password);

        let isValideResult = mockNewLogin.validator($inputEmailUser, $inputPasswordUser);
        expect(isValideResult).toBe(false);
      });
    });
    describe("When : je entre des informations manquantes ou invalides pour le champ password (vide ) du login l'employé et clique sur le bouton Se connecter", () => {
      beforeEach(() => {
        mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
        //instance Login
        mockNewLogin = new Login({
          document: mockDocument,
          localStorage: window.localStorage,
          onNavigate: mockOnNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });

        jest.spyOn(window.localStorage, "setItem");
      });
      afterEach(() => {
        mockLocalStorage.clear();
        mockDocument.body.innerHTML = "";
      });

      test("Then : Je reste sur la page Login , Les messages d'erreur appropriés sont affichés et je suis invité à remplir le champ  au bon format", () => {
        fireEvent.change($inputEmailUser, { target: { value: "chaîne@chaîne" } });
        expect($inputEmailUser.value).toBe("chaîne@chaîne");

        fireEvent.change($inputPasswordUser, { target: { value: "azerty" } });
        expect($inputPasswordUser.value).toBe("azerty");

        const MockHandleSubmitEmployee = jest.fn((e) => mockNewLogin.handleSubmitEmployee(e));
        $form.addEventListener("submit", MockHandleSubmitEmployee);
        fireEvent.submit($form);
        expect(screen.getByTestId("errorSpan-password").textContent).toBe("Veuillez entrer votre mot de passe");
      });
    });

    describe("when je sur la page Login Appel de méthode validator avec valide email but  password vide", () => {
      beforeEach(() => {
        mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
        //instance Login
        mockNewLogin = new Login({
          document: mockDocument,
          localStorage: window.localStorage,
          onNavigate: mockOnNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });

        jest.spyOn(window.localStorage, "setItem");
      });
      afterEach(() => {
        mockLocalStorage.clear();
        mockDocument.body.innerHTML = "";
      });
      test("Then : je sur la page Login , Devrais retourner le résultat false", () => {
        fireEvent.change($inputEmailUser, { target: { value: mockNewLogin.email } });
        fireEvent.change($inputPasswordUser, { target: { value: " " } });
        let isValideResult = mockNewLogin.validator($inputEmailUser, $inputPasswordUser);
        expect(isValideResult).toBe(false);
      });
    });
    describe("when je sur la page Login Appel de méthode validator avec  email vide but valide  password ", () => {
      beforeEach(() => {
        mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
        //instance Login
        mockNewLogin = new Login({
          document: mockDocument,
          localStorage: window.localStorage,
          onNavigate: mockOnNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });

        jest.spyOn(window.localStorage, "setItem");
      });
      afterEach(() => {
        mockLocalStorage.clear();
        mockDocument.body.innerHTML = "";
      });
      test("Then : je sur la page Login , Devrais retourner le résultat false", () => {
        fireEvent.change($inputEmailUser, { target: { value: "" } });
        fireEvent.change($inputPasswordUser, { target: { value: mockNewLogin.password } });
        let isValideResult = mockNewLogin.validator($inputEmailUser, $inputPasswordUser);
        expect(isValideResult).toBe(false);
      });
    });
    describe("when je sur la page Login Appel de méthode validator avec  email invalide et  password vide", () => {
      beforeEach(() => {
        mockDocument.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
        //instance Login
        mockNewLogin = new Login({
          document: mockDocument,
          localStorage: window.localStorage,
          onNavigate: mockOnNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });

        jest.spyOn(window.localStorage, "setItem");
      });
      afterEach(() => {
        mockLocalStorage.clear();
        mockDocument.body.innerHTML = "";
      });

      test("Then : je sur la page Login , Devrais retourner le résultat false", () => {
        fireEvent.change($inputEmailUser, { target: { value: "emloyee@emailcom" } });
        fireEvent.change($inputPasswordUser, { target: { value: "" } });
        let isValideResult = mockNewLogin.validator($inputEmailUser, $inputPasswordUser);
        expect(isValideResult).toBe(false);
      });
    });
  });
});

describe("Given : Je suis  un employé (non connecté) ", () => {
  describe("When : je entre des informations correctes ou valide pour les champs password  et email du login l'employé et clique sur le bouton Se connecter", () => {
    test("Then :Je suis identifié comme employé dans l'application", () => {
      //Préparation environnement de test
      window.localStorage.clear();
      document.body.innerHTML = LoginUI();
      const userMock = {
        type: "Employee",
        email: "emloyee@email.com",
        password: "azerty",
        status: "connected",
      };
      const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      const login = new Login({
        document: document,
        localStorage: localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: jest.fn(),
      });
      login.login = jest.fn().mockResolvedValue({});

      //Simuler l'entrée utilisateur
      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: userMock.email } });
      expect(inputEmailUser.value).toBe(userMock.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: userMock.password } });
      expect(inputPasswordUser.value).toBe(userMock.password);

      const btnLoginEmployee = screen.getByTestId("employee-login-button");
      const handleSubmitEmployee = jest.fn((e) => login.handleSubmitEmployee(e));
      btnLoginEmployee.addEventListener("click", handleSubmitEmployee);
      fireEvent.click(btnLoginEmployee);
      // test
      expect(handleSubmitEmployee).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: userMock.email,
          password: userMock.password,
          status: "connected",
        })
      );
      expect(login.login).toHaveBeenCalled();
    });
    test("It should renders  bills page", () => {
      expect(screen.queryByText("Mes notes de frais")).toBeTruthy();
    });
  });

  test("Then, handleSubmitEmployee ", async () => {
    //mock
    jest.mock("../containers/Login.js");

    //2 mockStore
    jest.mock("../app/Store.js", () => {
      mockStore;
    });
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );
    //1 div root
    document.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

    // 3. Fonction mockOnNavigate
    const mockOnNavigate = jest.fn(() => {
      const rootDiv = document.getElementById("root");
      rootDiv.innerHTML = BillsUI({ bills });
    });

    //4 new Bills
    const mockLogin = new Login({
      document,
      onNavigate: mockOnNavigate,
      store: mockStore,
      localStorage,
      PREVIOUS_LOCATION,
    });

    const bills = await mockStore.bills().list();
    // login()
    mockLogin.login = jest.fn((user) => {
      expect(user.type).toBe("Employee");
      return Promise.reject("Error 404");
    });
    //createUser()
    mockLogin.createUser = jest.fn((user) => {
      expect(user.type).toBe("Employee");
      return Promise.resolve(`User with ${user.email} is created`);
    });
    const inputEmailUser = screen.getByTestId("employee-email-input");
    fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne" } });
    expect(inputEmailUser.value).toBe("chaîne@chaîne");

    const inputPasswordUser = screen.getByTestId("employee-password-input");
    fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
    expect(inputPasswordUser.value).toBe("azerty");

    const btnLoginEmployee = screen.getByTestId("employee-login-button");
    const handleSubmitEmployee = jest.fn((e) => mockLogin.handleSubmitEmployee(e));
    btnLoginEmployee.addEventListener("click", handleSubmitEmployee);
    fireEvent.click(btnLoginEmployee);
    expect(handleSubmitEmployee).toHaveBeenCalled();

    expect(screen.getByText("Billed")).toBeTruthy();
  });
});

//Admin
describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input"); // ok
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } }); // ok

      expect(inputEmailUser.value).toBe(inputData.email); // ok

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password); // ok

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      //expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });

    test("Then, handleSubmitAdmin() ", async () => {
      //mock
      jest.mock("../containers/Login.js");

      //2 mockStore
      jest.mock("../app/Store.js", () => {
        mockStore;
      });
      Object.defineProperty(window, "localStorage", { value: localStorageMock });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
          email: "f@test.tld",
        })
      );
      //1 div root
      document.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

      // 3. Fonction mockOnNavigate
      const mockOnNavigate = jest.fn(() => {
        const rootDiv = document.getElementById("root");
        rootDiv.innerHTML = DashboardUI({ data: bills });
      });

      //4 new Bills
      const mockLogin = new Login({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage,
        PREVIOUS_LOCATION,
      });

      const bills = await mockStore.bills().list();
      // login()
      mockLogin.login = jest.fn((user) => {
        expect(user.type).toBe("Admin");
        return Promise.reject("Error 404");
      });
      //createUser()
      mockLogin.createUser = jest.fn((user) => {
        expect(user.type).toBe("Admin");
        return Promise.resolve(`User with ${user.email} is created`);
      });
      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne" } });
      expect(inputEmailUser.value).toBe("chaîne@chaîne");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const btnSubmitAdmin = screen.getByTestId("admin-login-button");
      const handleSubmitAdmin = jest.fn((e) => mockLogin.handleSubmitAdmin(e));
      btnSubmitAdmin.addEventListener("click", handleSubmitAdmin);
      fireEvent.click(btnSubmitAdmin);
      expect(handleSubmitAdmin).toHaveBeenCalled();

      // expect(screen.getByText("Billed")).toBeTruthy();
    });

    test("Then, handleSubmitAdmin() ", async () => {
      //mock
      jest.mock("../containers/Login.js");

      //2 mockStore
      jest.mock("../app/Store.js", () => {
        mockStore;
      });
      Object.defineProperty(window, "localStorage", { value: localStorageMock });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
          email: "f@test.tld",
        })
      );
      //1 div root
      document.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

      // 3. Fonction mockOnNavigate
      const mockOnNavigate = jest.fn(() => {
        const rootDiv = document.getElementById("root");
        rootDiv.innerHTML = DashboardUI({ data: bills });
      });

      //4 new Bills
      const mockLogin = new Login({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage,
        PREVIOUS_LOCATION,
      });

      const bills = await mockStore.bills().list();
      // login()
      mockLogin.login = jest.fn((user) => {
        expect(user.type).toBe("Admin");
        return Promise.reject("Error 404");
      });
      //createUser()
      mockLogin.createUser = jest.fn((user) => {
        expect(user.type).toBe("Admin");
        return Promise.resolve(`User with ${user.email} is created`);
      });
      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne" } });
      expect(inputEmailUser.value).toBe("chaîne@chaîne");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const btnSubmitAdmin = screen.getByTestId("admin-login-button");
      const handleSubmitAdmin = jest.fn((e) => mockLogin.handleSubmitAdmin(e));
      btnSubmitAdmin.addEventListener("click", handleSubmitAdmin);
      fireEvent.click(btnSubmitAdmin);
      expect(handleSubmitAdmin).toHaveBeenCalled();

      // expect(screen.getByText("Billed")).toBeTruthy();
    });
    describe("Then, handleSubmitAdmin() correct 1  ", async () => {
      //mock
      //jest.mock("../containers/Login.js");

      //2 mockStore
      jest.mock("../app/Store.js", () => {
        login: jest.fn().mockResolvedValue();
        users: jest.fn().mockResolvedValue({ create: jest.fn().mockResolvedValue() });
      });

      Object.defineProperty(window, "localStorage", { value: localStorageMock });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
          email: "f@test.tld",
        })
      );
      //1 div root
      document.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;

      // 3. Fonction mockOnNavigate
      const mockOnNavigate = jest.fn(() => {
        const rootDiv = document.getElementById("root");
        rootDiv.innerHTML = DashboardUI({ data: bills });
      });

      //4 new Bills
      const mockLogin = new Login({
        document,
        onNavigate: mockOnNavigate,
        store: Store,
        localStorage,
        PREVIOUS_LOCATION: "",
      });

      const bills = await mockStore.bills().list();
      // login()
      mockLogin.login = jest.fn((user) => {
        expect(user.type).toBe("Admin");
        return Promise.reject("Error 404");
      });
      //createUser()
      mockLogin.createUser = jest.fn((user) => {
        expect(user.type).toBe("Admin");
        return Promise.resolve(`User with ${user.email} is created`);
      });
      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne" } });
      expect(inputEmailUser.value).toBe("chaîne@chaîne");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const btnSubmitAdmin = screen.getByTestId("admin-login-button");
      const handleSubmitAdmin = jest.fn((e) => mockLogin.handleSubmitAdmin(e));
      btnSubmitAdmin.addEventListener("click", handleSubmitAdmin);
      fireEvent.click(btnSubmitAdmin);
      expect(handleSubmitAdmin).toHaveBeenCalled();

      // expect(screen.getByText("Billed")).toBeTruthy();
    });
  });
});


describe("When : je entre des informations correctes du login Admin et clique sur le bouton Se connecter", async () => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });

  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Admin",
      email: "f@test.tld",
    })
  );
  //1 div root
  document.body.innerHTML = `<div id=root>${ROUTES({ pathname: ROUTES_PATH["Login"] })}</div>`;
  const bills = await mockStore.bills().list();

  // 3. Fonction mockOnNavigate
  const mockOnNavigate = jest.fn(() => {
    const rootDiv = document.getElementById("root");
    rootDiv.innerHTML = DashboardUI({ data: bills });
  });
  test("Then :devrais être connecté avec succès et Et je suis envoyé sur la page Dashboard", async () => {
    const mockLogin = new Login({
      document,
      onNavigate: mockOnNavigate,
      store: {
        login: jest.fn().mockResolvedValue(),
        users: jest.fn().mockReturnValue({ create: jest.fn().mockResolvedValue() }),
      },
      localStorage,
      PREVIOUS_LOCATION: "",
    });

    const inputEmailUser = screen.getByTestId("admin-email-input");
    fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne.com" } });
    expect(inputEmailUser.value).toBe("chaîne@chaîne.com");

    const inputPasswordUser = screen.getByTestId("admin-password-input");
    fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
    expect(inputPasswordUser.value).toBe("azerty");

    const btnSubmitAdmin = screen.getByTestId("admin-login-button");
    const handleSubmitAdmin = jest.fn((e) => mockLogin.handleSubmitAdmin(e));
    btnSubmitAdmin.addEventListener("click", handleSubmitAdmin);
    fireEvent.click(btnSubmitAdmin);
    await waitFor(screen.getByTestId("big-billed-icon"));
    expect(handleSubmitAdmin).toHaveBeenCalled();
    expect(screen.getByTestId("big-billed-icon")).toBeTruthy();
    
  });
  test("la méthode handleSubmitAdmin est appelée ,Je devrais être connecté avec succès", async () => {
    const mockLogin = new Login({
      document,
      localStorage,
      onNavigate: mockOnNavigate,
      PREVIOUS_LOCATION: "",
      store: {
        login: jest.fn().mockResolvedValue({ jwt: "Connexion ok" }),
        users: jest.fn().mockReturnValue({ create: jest.fn().mockResolvedValue() }),
      },
    });
    const inputEmailUser = screen.getByTestId("admin-email-input");
    fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne.com" } });
    expect(inputEmailUser.value).toBe("chaîne@chaîne.com");

    const inputPasswordUser = screen.getByTestId("admin-password-input");
    fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
    expect(inputPasswordUser.value).toBe("azerty");

    const btnSubmitAdmin = screen.getByTestId("admin-login-button");
    const handleSubmitAdmin = jest.fn((e) => mockLogin.handleSubmitAdmin(e));
    btnSubmitAdmin.addEventListener("click", handleSubmitAdmin);
    fireEvent.click(btnSubmitAdmin);

    //test result
    await waitFor(screen.getByTestId("big-billed-icon"));
    expect(handleSubmitAdmin).toHaveBeenCalled();
    expect(mockLogin.localStorage.setItem).toHaveBeenCalledWith("jwt", "jwt");
    expect(mockLogin.localStorage.getItem()).toHaveBeenCalledWith("Connexion ok");
    expect(screen.getByTestId("big-billed-icon")).toBeTruthy();
    // if store is null
    mockLogin.store = null;
    fireEvent.click(btnSubmitAdmin);
    expect(handleSubmitAdmin).toHaveBeenCalled();
    expect(handleSubmitAdmin()).toBe("ok");

    // if store.login reject
    mockLogin.store.login = jest.fn().mockRejectedValue(new Error("Connexion échoué"));
    mockLogin.createUser = jest.fn();
    fireEvent.click(btnSubmitAdmin);
    expect(handleSubmitAdmin).toHaveBeenCalled();
    expect(mockLogin.createUser).toHaveBeenCalled();
    expect(handleSubmitAdmin()).toBeNull();
  });

    test("Connexion échouée je reste sur la page login", async () => {
      const mockLogin = new Login({
        document,
        localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: {
          login: jest.fn().mockRejectedValue(new Error("Connexion échoué")),
          users: () => {
            return { create: jest.fn().mockRejectedValue("Connexion échoué") };
          },
        },
      });
      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne.com" } });
      expect(inputEmailUser.value).toBe("chaîne@chaîne.com");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const btnSubmitAdmin = screen.getByTestId("admin-login-button");
      const handleSubmitAdmin = jest.fn((e) => mockLogin.handleSubmitAdmin(e));
      btnSubmitAdmin.addEventListener("click", handleSubmitAdmin);
      fireEvent.click(btnSubmitAdmin);

      expect(handleSubmitAdmin).toHaveBeenCalled();
      expect(mockLogin.store.login).toHaveBeenCalled();
      expect(mockLogin.store.create).toHaveBeenCalled();
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
});
