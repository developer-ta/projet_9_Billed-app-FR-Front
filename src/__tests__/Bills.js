/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import "@testing-library/jest-dom/extend-expect";

describe("Given I am connected as an employee", () => {
  //1
  describe("When I am on on Bills page but it is loading", () => {
    afterEach(() => (document.body.innerHTML = ""));

    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = `<div id=root></div>`;
      document.getElementById("root").innerHTML = BillsUI({ data: [], loading: true });

      expect(screen.getAllByText("Loading...")).toBeTruthy();
      expect(screen.getByText("Billed")).toBeTruthy();
    });
  });
  //2
  describe("When I am on on Bills Page  but it is error", () => {
    afterEach(() => (document.body.innerHTML = ""));

    test("Then, error page should be rendered", () => {
      document.body.innerHTML = `<div id=root></div>`;
      document.getElementById("root").innerHTML = BillsUI({ data: [], loading: false, error: "some error message" });

      expect(screen.getByTestId("error-message")).toBeTruthy();
      console.log("xxx", screen.getByTestId("error-message").textContent);
      //expect(screen.getByTestId("error-message").textContent).toBe("some error message");
    });
  });
  //3
  describe("When I am on on Bills Page there are bills list", () => {
    afterEach(() => (document.body.innerHTML = ""));

    test("Then, error page should be rendered", () => {
      document.body.innerHTML = `<div id=root></div>`;
      document.getElementById("root").innerHTML = BillsUI({ data: bills });

      expect(screen.getByText(bills[0].type)).toBeTruthy();
    });
  });
  //4
  describe("When I am on on Bills Page there are highlighted bill icon in vertical layout", () => {
    afterEach(() => (document.body.innerHTML = ""));

    test("Then bill icon in vertical layout should be highlighted", async () => {
      document.body.innerHTML = `<div id=root></div>`;
      router();
      window.onNavigate("#employee/bills");

      expect(screen.getByTestId("icon-window")).toBeTruthy();
      expect(screen.getByTestId("icon-window")).toHaveClass("active-icon");
      // expect(screen.getByTestId("icon-window").contains("active-icon")).toBe(true);
    });
  });
  //5
  describe("When I am on Bills Page 1", () => {
    let isLoading = true;
    let mockBills = [];

    const mockHtml = (htmlRender) => {
      document.body.innerHTML = `<div id=root></div>`;
      document.getElementById("root").innerHTML = htmlRender;
    };

    afterEach(() => (document.body.innerHTML = ""));

    test("Then , Loading page should be rendered", () => {
      mockHtml(BillsUI({ data: mockBills, loading: isLoading }));

      expect(screen.getByText("Loading...")).toBeTruthy();
      expect(screen.getByText("Billed")).toBeTruthy();
    });

    test("Then , bills table should be rendered", () => {
      mockBills = bills;
      mockHtml(BillsUI({ data: mockBills }));

      expect(screen.getByText("Billed")).toBeTruthy();
    });

    test("Then, Error page should be rendered", () => {
      mockHtml(BillsUI({ error: "some error" }));

      expect(screen.getByTestId("error-message")).toBeTruthy();
      expect(screen.getByText("Erreur")).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      mockBills = bills;
      mockHtml(BillsUI({ data: mockBills }));

      const resultDates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      // const datesSorted = [...dates].sort(antiChrono);
      const datesSorted = mockBills.map((data) => data.date).sort(antiChrono);

      expect(resultDates).toEqual(datesSorted);
    });
  });
  //6
  describe("When I am on Bills Page 2", () => {
    let mockStore = null;
    let mockBills = null;
    let billsDataList = [];

    const mockDocument = () => {
      billsDataList = bills;
      document.body.innerHTML = `<div id=root>${BillsUI({ data: billsDataList })}</div>`;

      document.title = "Bills";
      return document;
    };

    const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );

    beforeEach(() => {
      mockBills = new Bills({
        document: mockDocument(),
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    });

    afterEach(() => {
      document.body.innerHTML = "";
      jest.clearAllMocks();
    });

    test("Then, should appear Bills list", async () => {
      await waitFor(() => screen.getAllByTestId("icon-eye"));
      jest.mock("jquery", () => {
        const originalModule = jest.requireActual("jquery");
        return {
          ...originalModule,
          modal: jest.fn(),
        };
      });

      const $iconEyes = screen.getAllByTestId("icon-eye");

      let mockHandleClickIconEye = jest.fn((icon) => mockBills.handleClickIconEye(icon));

      $iconEyes.forEach(($iconEye) => {
        $iconEye.addEventListener("click", () => mockHandleClickIconEye($iconEye));
      });

      userEvent.click($iconEyes[0]);
      await waitFor(() => $("#myModal"));
      expect(mockBills.document.title).toEqual("Bills");
      expect(mockHandleClickIconEye).toHaveBeenCalled();
    });

    test("Then, should appear NewBill", async () => {
      await waitFor(() => screen.getByTestId("btn-new-bill"));

      const handleClickNewBill = jest.fn((e) => mockBills.handleClickNewBill(e));
      const $newBillBtn = screen.getByTestId("btn-new-bill");

      $newBillBtn.addEventListener("click", handleClickNewBill);

      userEvent.click($newBillBtn);

      expect(screen.getByText("Billed")).toBeTruthy();
      expect($newBillBtn).toBeTruthy();
      expect(handleClickNewBill).toHaveBeenCalled();
    });

    test("Then, should handleClickNewBill called and appear NewBill ", async () => {
      await waitFor(() => screen.getByTestId("btn-new-bill"));

      const handleClickNewBill = jest.fn((e) => mockBills.handleClickNewBill(e));
      const $newBillBtn = screen.getByTestId("btn-new-bill");
      $newBillBtn.addEventListener("click", handleClickNewBill);
      userEvent.click($newBillBtn);

      expect(screen.getByText("Billed")).toBeTruthy();
      expect(screen.getByTestId("icon-window")).toBeTruthy();
      expect(screen.getByTestId("icon-mail")).toBeTruthy();

      expect($newBillBtn).toBeTruthy();
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
  //7
  describe("When I am on Bills Page 3", () => {
    beforeEach(() => {
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
    });

    afterEach(() => {
      document.body.innerHTML = "";
      jest.clearAllMocks();
    });

    test("Then,Devrait model justificatif apparaître ,lorsque je clique sur iconEyes", async () => {
      const mockOnNavigate = (data, error) =>
        (document.body.innerHTML = `<div id=root>${BillsUI({ data, error })}</div>`);

      const mockBills = new Bills({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage,
      });
      const data = await mockBills.getBills();
      mockBills.onNavigate(data, "");

      document.title = "Bills";

      await waitFor(() => screen.getAllByTestId("icon-eye"));

      const $iconEyes = screen.getAllByTestId("icon-eye");

      let mockHandleClickIconEye = jest.fn((icon) => mockBills.handleClickIconEye(icon));

      $iconEyes.forEach(($iconEye) => {
        $iconEye.addEventListener("click", () => mockHandleClickIconEye($iconEye));
      });

      userEvent.click($iconEyes[0]);

      await waitFor(() => $("#myModal"));
      expect($("#myModal")).toBeTruthy();
      expect(mockBills.document.title).toEqual("Bills");
      expect(mockHandleClickIconEye).toHaveBeenCalled();
    });
    test("Then, Devrait avoir Liste de billes ,lorsqu'on appelle méthode getBills", async () => {
      //1 div root

      document.body.innerHTML = `<div id=root></div>`;
      //2 mockStore
      const mockStore = {
        bills: jest.fn(() => {
          return {
            list: () => {
              return Promise.resolve([new Error("snapshot")]);
            },
          };
        }),
      };

      // 3. Fonction mockOnNavigate
      const mockOnNavigate = jest.fn();

      //4 new Bills
      const billsInstance = new Bills({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage,
      });
      let res = await billsInstance.getBills();

      expect(res).not.toBeNull();

      billsInstance.store = null;
      res = await billsInstance.getBills();
      expect(res).toBeUndefined();
    });
    test("Then,  Devrait avoir Erreur 404 ,lorsqu'on appelle méthode getBills", async () => {
      //1 div root
      jest.mock("../containers/Bills.js");
      document.body.innerHTML = `<div id=root></div>`;
      //2 mockStore
      const mockStore = {
        bills: () => {
          return {
            list: () => {
              return Promise.reject("Erreur 404");
            },
          };
        },
      };

      // 3. Fonction mockOnNavigate
      const mockOnNavigate = jest.fn();

      //4 new Bills
      const mockBills = new Bills({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage,
      });
      // Implementer la méthode getBills pour simuler la récupération
      mockBills.getBills = jest.fn(() => {
        return mockStore.bills().list();
      });
      try {
        await mockBills.getBills();
      } catch (error) {
        const rootDiv = document.getElementById("root");
        rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH.Bills, error });
        expect(rootDiv.innerHTML).toContain("Erreur 404");
      }

      await new Promise(process.nextTick);

      document.title = "Bills";
      await waitFor(() => screen.getByTestId("error-message"));
      let messageError = screen.getByTestId("error-message").innerHTML;

      expect(screen.getByTestId("error-message")).toBeTruthy();

      expect(mockBills.document.title).toEqual("Bills");
    });
  });
});
