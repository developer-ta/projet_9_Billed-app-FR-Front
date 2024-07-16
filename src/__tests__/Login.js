/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
// import BillsUI from "../views/BillsUI.js";
// import { bills } from "../fixtures/bills.js";
// import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

// import $ from "jquery";
import mockStore from "../__mocks__/store";
// import VerticalLayout from "../views/VerticalLayout.js";
// import Router from "../app/Router.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes";

//Scénario 1  : Test de l'Interface Utilisateur (UI)/Page de Login

describe("Given : Je suis  un employé (non connecté) ", () => {
  describe("When : je suis sur login page", () => {
    afterEach(() => {
      document.body.innerHTML = "";
    });
    test("Then : devrait afficher le formulaire de login l'employé", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
  });
  describe("When : Je suis sur login page , je entre des informations manquantes ou invalides pour le champ e-mail et clique sur Se connecter.(sans la forme chaîne@chaîne.cc)", () => {
    afterEach(() => {
      document.body.innerHTML = "";
    });

    // document mock
    document.body.innerHTML = LoginUI();

    //localStorage mock
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );

    // onNavigate mock
    const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    test("Then : je reste sur la page Login , Les messages d'erreur appropriés sont affichés et je suis invité à remplir le champ e-mail au bon format", () => {
      document.body.innerHTML = LoginUI();
      const login = new Login({
        document: document,
        localStorage: localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });
      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne" } });
      expect(inputEmailUser.value).toBe("chaîne@chaîne");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const btnLoginEmployee = screen.getByTestId("employee-login-button");
      const handleSubmitEmployee = jest.fn((e) => login.handleSubmitEmployee(e));
      btnLoginEmployee.addEventListener("click", handleSubmitEmployee);
      fireEvent.click(btnLoginEmployee);
      expect(screen.getByTestId("errorSpan-email").textContent).toBe(
        "L'email que vous avez saisie est invalide. Veuillez réessayer"
      );
      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
    test("Then : je reste sur la page Login , Devrais retourner le résultat vrai c'est Remplir avec l'information correcte sinon retourner fausse comme résultat", () => {
      //Préparation environnement de test
      window.localStorage.clear();
      document.body.innerHTML = LoginUI();
      const userMock = {
        type: "Employee",
        email: "emloyee@email.com",
        password: "azerty",
        status: "connected",
      };
      const login = new Login({
        document: document,
        localStorage: localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });

      //Simuler l'entrée utilisateur
      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: userMock.email } });
      expect(inputEmailUser.value).toBe(userMock.email);
      // email ok but password ok
      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: userMock.password } });
      expect(inputPasswordUser.value).toBe(userMock.password);
      let isValideResult = login.validator(inputEmailUser, inputPasswordUser);
      expect(isValideResult).toBe(true);
      // email ok but password no
      fireEvent.change(inputEmailUser, { target: { value: userMock.email } });
      fireEvent.change(inputPasswordUser, { target: { value: " " } });
      isValideResult = login.validator(inputEmailUser, inputPasswordUser);
      expect(isValideResult).toBe(false);
      // email no but password ok
      fireEvent.change(inputEmailUser, { target: { value: "" } });
      fireEvent.change(inputPasswordUser, { target: { value: userMock.password } });
      isValideResult = login.validator(inputEmailUser, inputPasswordUser);
      expect(isValideResult).toBe(false);
      // email no but password no
      fireEvent.change(inputEmailUser, { target: { value: "emloyee@emailcom" } });
      fireEvent.change(inputPasswordUser, { target: { value: " " } });
      isValideResult = login.validator(inputEmailUser, inputPasswordUser);
      expect(isValideResult).toBe(false);

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
      // isValideResult = login.validator("emloyee@emailcom", "");
      // expect(isValideResult).toBe(false);

      // isValideResult = login.validator("emloyee@emailcom", userMock.password);
      // expect(isValideResult).toBe(false);

      // const btnLoginEmployee = screen.getByTestId("employee-login-button");
      // const handleSubmitEmployee = jest.fn((e) => login.handleSubmitEmployee(e));
      // btnLoginEmployee.addEventListener("click", handleSubmitEmployee);
      // fireEvent.change(inputEmailUser, { target: { value: "chaîne@chaîne" } });
      // fireEvent.click(btnLoginEmployee);
      // expect(screen.getByTestId("errorSpan-email").textContent).toBe(
      //   "L'email que vous avez saisie est invalide. Veuillez réessayer"
      // );
    });
  });
  describe("When : je entre des informations manquantes ou invalides pour le champ password (vide ) du login l'employé et clique sur le bouton Se connecter", () => {
    afterEach(() => {
      document.body.innerHTML = "";
    });

    // document mock
    document.body.innerHTML = LoginUI();

    //localStorage mock
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );

    // onNavigate mock
    const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    test("Then : Je reste sur la page Login , Les messages d'erreur appropriés sont affichés et je suis invité à remplir le champ  au bon format", () => {
      document.body.innerHTML = LoginUI();
      const login = new Login({
        document: document,
        localStorage: localStorage,
        onNavigate: mockOnNavigate,
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });
      const inputPasswordUser = screen.getByTestId("employee-password-input");
      const btnLoginEmployee = screen.getByTestId("employee-login-button");
      const handleSubmitEmployee = jest.fn((e) => login.handleSubmitEmployee(e));
      btnLoginEmployee.addEventListener("click", handleSubmitEmployee);
      fireEvent.change(inputPasswordUser, { target: { value: "" } });
      fireEvent.click(btnLoginEmployee);
      expect(screen.getByTestId("errorSpan-password").textContent).toBe("Veuillez entrer votre mot de passe");

      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
  });

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
});

//   describe("When I do not fill fields and I click on employee button Login In", () => {
//     test("Then It should renders Login page", () => {
//       document.body.innerHTML = LoginUI();

//       const inputEmailUser = screen.getByTestId("employee-email-input");
//       expect(inputEmailUser.value).toBe("");

//       const inputPasswordUser = screen.getByTestId("employee-password-input");
//       expect(inputPasswordUser.value).toBe("");

//       const form = screen.getByTestId("form-employee");
//       const handleSubmit = jest.fn((e) => e.preventDefault());

//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(screen.getByTestId("form-employee")).toBeTruthy();
//     });
//   });

//   describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
//     test("Then It should renders Login page", () => {
//       document.body.innerHTML = LoginUI();

//       const inputEmailUser = screen.getByTestId("employee-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
//       expect(inputEmailUser.value).toBe("pasunemail");
//       //console.log("inputEmailUser.value:************************************* ", inputEmailUser.value);

//       const inputPasswordUser = screen.getByTestId("employee-password-input");
//       fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
//       expect(inputPasswordUser.value).toBe("azerty");

//       const form = screen.getByTestId("form-employee");
//       const handleSubmit = jest.fn((e) => e.preventDefault());

//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(screen.getByTestId("form-employee")).toBeTruthy();
//     });
//   });

//   describe("When I do fill fields in correct format and I click on employee button Login In", () => {
//     test("Then I should be identified as an Employee in app", () => {
//       document.body.innerHTML = LoginUI();
//       const inputData = {
//         email: "johndoe@email.com",
//         password: "azerty",
//       };

//       const inputEmailUser = screen.getByTestId("employee-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
//       expect(inputEmailUser.value).toBe(inputData.email);

//       const inputPasswordUser = screen.getByTestId("employee-password-input");
//       fireEvent.change(inputPasswordUser, {
//         target: { value: inputData.password },
//       });
//       expect(inputPasswordUser.value).toBe(inputData.password);

//       const form = screen.getByTestId("form-employee");

//       // localStorage should be populated with form data
//       Object.defineProperty(window, "localStorage", {
//         value: {
//           getItem: jest.fn(() => null),
//           setItem: jest.fn(() => null),
//         },
//         writable: true,
//       });

//       // we have to mock navigation to test it
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname });
//       };

//       let PREVIOUS_LOCATION = "";

//       const store = jest.fn();

//       const login = new Login({
//         document,
//         localStorage: window.localStorage,
//         onNavigate,
//         PREVIOUS_LOCATION,
//         store,
//       });

//       const handleSubmit = jest.fn(login.handleSubmitEmployee);
//       login.login = jest.fn().mockResolvedValue({});
//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(handleSubmit).toHaveBeenCalled();
//       expect(window.localStorage.setItem).toHaveBeenCalled();
//       expect(window.localStorage.setItem).toHaveBeenCalledWith(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//           email: inputData.email,
//           password: inputData.password,
//           status: "connected",
//         })
//       );
//     });

//     test("It should renders Bills page", () => {
//       expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
//     });
//   });
// });
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
  //-----------------------------------------------------------------------------------------------
  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com", //admin@company.tld ; mot de passe : admin
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input"); // ok
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } }); // ok

      expect(inputEmailUser.value).toBe(inputData.email); // ok

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      }); //?
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

      // expect(jest.fn()).toHaveBeenCalled()

      // Expected number of calls: >= 1
      // Received number of calls:    0
      //const handleSubmit = jest.fn(login.handleSubmitAdmin);
      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      //console.log("handleSubmit ----------------------------------: ", handleSubmit.mock.calls.length);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
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
  });
});
