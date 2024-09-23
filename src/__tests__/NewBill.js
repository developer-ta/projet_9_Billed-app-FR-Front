/**
 * @jest-environment jsdom
 */

import NewBill from "../containers/NewBill.js";
import { fireEvent, screen, waitFor, queryByTestId } from "@testing-library/dom";

import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js";
import mockStore from "../__mocks__/store";
import Router from "../app/Router";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    //  préparation l'environnement des test
    let mockStoreNewBill = mockStore;
    let mockNewBill = null;
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "f@test.tld",
        })
      );

      document.body.innerHTML = `<div id=root></div>`;
      document.title = "newBille";
      window.location.hash = "#employee/bill/new";
      Router();

      mockNewBill = new NewBill({
        document: document,
        onNavigate: window.onNavigate,
        store: mockStoreNewBill,
        localStorage: window.localStorage,
      });
    });

    afterEach(() => {
      document.body.innerHTML = "";
      jest.clearAllMocks();
    });
    // Test partie interface graphique
    test("Then,should test newBille Ui", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(screen.getByTestId("icon-window")).toBeTruthy();
      expect(screen.getByTestId("icon-mail")).toBeTruthy();
    });

    //test level newBille constructor
    test("Then,Devrait avoir un instant de newBille ", () => {
      expect(mockNewBill.document.title).toEqual("newBille");
      expect(mockNewBill.$errorSpan.style.display).toEqual("none");
    });

    //test level newBille Dowland file event
    test("Then,Devrais télécharger un fichier image , lorsque on appelle  handleChangeFile", () => {
      let mockFile = new File(["test blob file", "", ""], "profil.jpg", { type: "image.jpg" });
      const $fileInput = screen.getByTestId("file");
      const $btnSubmit = screen.getByText("Envoyer");

      const mockHandleChangeFile = jest.spyOn(mockNewBill, "handleChangeFile");
      $fileInput.addEventListener("change", mockHandleChangeFile);
      fireEvent.change($fileInput, { target: { files: [mockFile] } });

      expect($fileInput).toBeTruthy();
      expect($btnSubmit.disabled).toBe(false);
      expect($fileInput.files).toBeTruthy();
      expect($fileInput.files[0]).toBe(mockFile);
      expect($fileInput.files[0].name).toBe("profil.jpg");
      expect(mockHandleChangeFile).toHaveBeenCalled();
    });
    test("Then,Un message d'erreur apparaît pour m'avertir de télécharger uniquement des fichiers de type PNG, JPG ou JPEG ", () => {
      let mockFile = new File(["test blob file"], "profil.txt", {
        type: "text/plain",
        lastModified: new Date(),
      });
      const $fileInput = screen.getByTestId("file");
      const $errorSpan = mockNewBill.$errorSpan;
      const mockHandleChangeFile = jest.spyOn(mockNewBill, "handleChangeFile");
      $fileInput.addEventListener("change", mockHandleChangeFile);
      fireEvent.change($fileInput, { target: { files: [mockFile] } });

      expect($fileInput).toBeTruthy();
      expect($errorSpan.style.display).toBe("block");
      expect(mockHandleChangeFile).toHaveBeenCalled();

      expect($fileInput.files[0].name).toBe("profil.txt");
    });

    test("Then, Devrait n'y a aucune erreur ou alerte qui s'affiche , lorsque je sélectionne un fichier de type PNG ", () => {
      let mockFile = new File(["test blob file"], "profil.png", {
        type: "text/plain",
        lastModified: new Date(),
      });
      //2 mockStore
      const mockStore = {
        bills: () => {
          return {
            create: () => {
              return Promise.reject("Erreur 404");
            },
          };
        },
      };
      mockNewBill.store = mockStore;
      const $fileInput = screen.getByTestId("file");

      const mockHandleChangeFile = jest.spyOn(mockNewBill, "handleChangeFile");
      $fileInput.addEventListener("change", mockHandleChangeFile);
      fireEvent.change($fileInput, { target: { files: [mockFile] } });

      expect(mockHandleChangeFile).toHaveBeenCalled();

      expect($fileInput.files[0].name).toBe("profil.png");
    });

    test("Then ... test newBille event handleSubmit", () => {
      const $mockFormNewBill = screen.getByTestId("form-new-bill");
      const $fileInput = screen.getByTestId("file");

      const mockHandleSubmit = jest.spyOn(mockNewBill, "handleSubmit");
      $mockFormNewBill.addEventListener("submit", mockHandleSubmit);
      fireEvent.submit($mockFormNewBill);

      expect($mockFormNewBill).toBeTruthy();
      expect($fileInput).toBeTruthy();
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe("When I am on newBills Page Lorsque je soumettre formulaire", () => {
    const mockNewBillUi = () => ROUTES({ pathname: "#employee/bill/new", loading: true });
    let mockStoreNewBill = mockStore;
    let mockNewBill;
    const mockDocument = () => {
      document.body.innerHTML = `<div id=root>${mockNewBillUi()}</div>`;
      document.title = "Bills";

      return document;
    };

    const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    const mockLocalStorage = () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
    };

    beforeEach(() => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "f@test.tld",
        })
      );

      mockLocalStorage();
      mockNewBill = new NewBill({
        document: mockDocument(),
        onNavigate: mockOnNavigate,
        store: mockStoreNewBill,
        localStorage: window.localStorage,
      });

      test("Then: Devrait retourner page Bill", async () => {
        const $mockFormNewBill = screen.getByTestId("form-new-bill");
        //const $fileInput = screen.getByTestId("file");

        const mockHandleSubmit = jest.spyOn(mockNewBill, "handleSubmit");
        $mockFormNewBill.addEventListener("submit", mockHandleSubmit);
        //mockNewBill.onNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));
        fireEvent.submit($mockFormNewBill);
        waitFor(() => screen.getByTestId("btn-new-bill"));
        expect(mockHandleSubmit).toHaveBeenCalled();
        expect(screen.getByTestId("btn-new-bill").toBeTruthy());
      });

      //   mockNewBill.store = () => {
      //     return {
      //       bills: () => {
      //         return { update: jest.fn().mockResolvedValue({}) };
      //       },
      //     };
      //   };
      //   const $mockFormNewBill = screen.getByTestId("form-new-bill");

      //   const mockHandleSubmit = jest.fn((event) => mockNewBill.handleSubmit(event));
      //   $mockFormNewBill.addEventListener("submit", mockHandleSubmit);

      //   fireEvent.submit($mockFormNewBill);
      //   waitFor(() => screen.getByTestId("btn-new-bill"));
      //   expect(mockHandleSubmit).toHaveBeenCalled();
      //   expect(screen.getByTestId("btn-new-bill").toBeTruthy());
      // });
    });
  });

  describe("When I am on newBills Page, Lorsque Mise à jour new bill rejeté", () => {
    const mockNewBillUi = () => ROUTES({ pathname: "#employee/bill/new", loading: true });
    let mockStoreNewBill = mockStore;
    let mockNewBill;
    const mockDocument = () => {
      document.body.innerHTML = `<div id=root>${mockNewBillUi()}</div>`;
      document.title = "Bills";

      return document;
    };

    const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    const mockLocalStorage = () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
    };

    beforeEach(() => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "f@test.tld",
        })
      );

      mockLocalStorage();
      mockNewBill = new NewBill({
        document: mockDocument(),
        onNavigate: mockOnNavigate,
        store: mockStoreNewBill,
        localStorage: window.localStorage,
      });

      test("Then , Devrais avoir erreur ", async () => {
        mockNewBill.store = () => {
          return {
            bills: () => {
              return { update: jest.fn().mockRejectedValue(new Error("error")) };
            },
          };
        };

        const mockUpdateBill = jest.fn(() => mockNewBill.updateBill(bills));
        try {
          await mockUpdateBill();
        } catch (error) {
          expect(error).toBeTruthy();
        }

        expect(mockUpdateBill).toHaveBeenCalled();
      });
    });
  });
});
describe("When I am on NewBills Page,Lorsque POST new bill submit form ", () => {
  const mockNewBillUi = () => ROUTES({ pathname: "#employee/bill/new", loading: true });
  let mockStoreNewBill = mockStore;
  let mockNewBill;
  const mockDocument = () => {
    document.body.innerHTML = `<div id=root>${mockNewBillUi()}</div>`;
    document.title = "Bills";

    return document;
  };

  const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

  const mockLocalStorage = () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
  };

  beforeEach(() => {
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );

    mockLocalStorage();
    mockNewBill = new NewBill({
      document: mockDocument(),
      onNavigate: mockOnNavigate,
      store: mockStoreNewBill,
      localStorage: window.localStorage,
    });

    test("Then :Devrait avoir nouveau new bill ID", () => {
      mockNewBill.store = () => {
        return {
          bills: () => {
            return {
              create: jest.fn().mockResolvedValue({ fileUrl: "https://localhost:3456/images/test.jpg", key: "1234" }),
            };
          },
        };
      };

      let mockFile = new File(["test blob file", "", ""], "profil.jpg", { type: "image.jpg" });
      const $fileInput = screen.getByTestId("file");

      const mockHandleChangeFile = jest.spyOn(mockNewBill, "handleChangeFile");
      $fileInput.addEventListener("change", mockHandleChangeFile);
      fireEvent.change($fileInput, { target: { files: [mockFile] } });

      expect($fileInput.files[0].name).toBe("profil.jpg");

      const $mockFormNewBill = screen.getByTestId("form-new-bill");
      const mockHandleSubmit = jest.fn((event) => mockNewBill.handleSubmit(event));
      $mockFormNewBill.addEventListener("submit", mockHandleSubmit);

      fireEvent.submit($mockFormNewBill);
      let storeCreate = mockNewBill.store.bills();
      expect(mockHandleSubmit).toHaveBeenCalled();
      expect(storeCreate.create).toHaveBeenCalled();
      expect(mockNewBill.billId).toContain("1234");

      // expect(screen.getByTestId("btn-new-bill").toBeTruthy());
    });
  });
});
