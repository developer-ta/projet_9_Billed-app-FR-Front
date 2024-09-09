import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import $ from "jquery";
import mockStore from "../__mocks__/store";
import VerticalLayout from "../views/VerticalLayout.js";
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
      Router();
      window.onNavigate("#employee/bills");

      expect(await screen.getByTestId("icon-window")).toBeTruthy();
      expect(await screen.getByTestId("icon-window")).toHaveClass("active-icon");
      // expect(screen.getByTestId("icon-window").contains("active-icon")).toBe(true);
    });
  });
  //5
  describe("When I am on Bills Page", () => {
    let isLoading = true;
    let billsDataList = [];

    const mockHtml = (htmlRender) => {
      document.body.innerHTML = `<div id=root></div>`;
      document.getElementById("root").innerHTML = htmlRender;
    };

    afterEach(() => (document.body.innerHTML = ""));

    test("Then , Loading page should be rendered", () => {
      mockHtml(BillsUI({ data: billsDataList, loading: isLoading }));

      expect(screen.getByText("Loading...")).toBeTruthy();
      expect(screen.getByText("Billed")).toBeTruthy();
    });

    test("Then , bills table should be rendered", () => {
      billsDataList = bills;
      mockHtml(BillsUI({ data: billsDataList }));

      expect(screen.getByText("Billed")).toBeTruthy();
    });

    test("Then, Error page should be rendered", () => {
      mockHtml(BillsUI({ error: "some error" }));

      expect(screen.getByTestId("error-message")).toBeTruthy();
      expect(screen.getByText("Erreur")).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      billsDataList = bills;
      mockHtml(BillsUI({ data: billsDataList }));

      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });
  });
  //2
  describe("When I am on Bills Page 2", () => {
    let mockStore = null;
    let mockBills = null;
    let billsDataList = [];

    const mockDocument = () => {
      billsDataList = bills;
      document.body.innerHTML = `<div id=root>${BillsUI({ data: billsDataList })}</div>`;
      //console.log("BillsUI({ data: mockBills }: ", VerticalLayout(120));
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
      // mockHandleClickIconEye.mockReturnValue();
      $iconEyes.forEach(($iconEye) => {
        $iconEye.addEventListener("click", () => mockHandleClickIconEye($iconEye));
      });

      // let handleClickIconEyeSpy = jest.spyOn(mockBills, "handleClickIconEye").mockReturnValue("called");
      userEvent.click($iconEyes[0]);
      //mockBills.handleClickIconEye();
      await waitFor(() => $("#myModal"));
      //expect($("#myModal").hasClass("show")).toBe(true);
      expect(mockBills.document.title).toEqual("Bills");
      expect(mockHandleClickIconEye).toHaveBeenCalled();
      //  expect(mockBills.handleClickIconEye()).toEqual("called");
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

    test("Then, should appear NewBill 2", async () => {
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
  //2.1
  describe("When I am on Bills Page 2.1", () => {
    jest.mock("../app/Store.js", () => {
      mockStore;
    });

    //const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );

    document.body.innerHTML = `<div id=root></div>`;
    document.title = "Bills";
    router();
    window.onNavigate(ROUTES_PATH.Bills);
    const mockBills = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage,
    });

    afterEach(() => {
      document.body.innerHTML = "";
      jest.clearAllMocks();
    });

    test("Then, should appear Bills list", async () => {
      const rootDiv = document.getElementById("root");
      const data = await mockBills.getBills();
      rootDiv.innerHTML = BillsUI({ data });

      await waitFor(() => screen.getAllByTestId("icon-eye"));

      const $iconEyes = screen.getAllByTestId("icon-eye");

      let mockHandleClickIconEye = jest.fn((icon) => mockBills.handleClickIconEye(icon));
      // mockHandleClickIconEye.mockReturnValue();
      $iconEyes.forEach(($iconEye) => {
        $iconEye.addEventListener("click", () => mockHandleClickIconEye($iconEye));
      });

      // let handleClickIconEyeSpy = jest.spyOn(mockBills, "handleClickIconEye").mockReturnValue("called");
      userEvent.click($iconEyes[0]);
      //mockBills.handleClickIconEye();
      await waitFor(() => $("#myModal"));
      expect($("#myModal")).toBeTruthy();
      expect(mockBills.document.title).toEqual("Bills");
      expect(mockHandleClickIconEye).toHaveBeenCalled();
      //  expect(mockBills.handleClickIconEye()).toEqual("called");
    });
  });
  // 3
  describe("When I am on Bills Page 3", () => {
    const mockNewBillUI = () => ROUTES({ pathname: "#employee/bill/new", loading: true });
    let mockStoreNewBill = mockStore;

    const mockDocument = () => {
      document.body.innerHTML = `<div id=root>${mockNewBillUI()}</div>`;
      document.title = "Bills";

      console.log("document: ", document);

      return document;
    };

    const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    const mockLocalStorage = () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "f@test.tld",
        })
      );
    };

    beforeEach(() => {
      mockLocalStorage();
      mockNewBillUI = new NewBill({
        document: mockDocument(),
        onNavigate: mockOnNavigate,
        store: mockStoreNewBill,
        localStorage: window.localStorage,
      });

      test("Then, should appear NewBill 3", async () => {
        await waitFor(() => screen.getByTestId("btn-new-bill"));

        console.log("document: ", document.body.innerHTML);
        const handleClickNewBill = jest.fn((e) => mockBills.handleClickNewBill(e));
        const $newBillBtn = screen.getByTestId("btn-new-bill");

        $newBillBtn.addEventListener("click", handleClickNewBill);

        userEvent.click($newBillBtn);

        expect(screen.getByText("Billed")).toBeTruthy();
        expect(screen.getByTestId("icon-window")).toBeTruthy();
        expect(screen.getByTestId("icon-mail")).toBeTruthy();
        //  expect(screen.getByTestId("tbody")).toBeTruthy();
        expect($newBillBtn).toBeTruthy();
        expect(handleClickNewBill).toHaveBeenCalled();
      });
    });
  });
});

// get
describe("When an error occurs on API", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Admin",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
  });
  test("fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.Dashboard);
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Dashboard);
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
