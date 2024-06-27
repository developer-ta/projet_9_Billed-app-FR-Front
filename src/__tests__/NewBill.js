/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import $ from "jquery";
import mockStore from "../__mocks__/store";
import Router from "../app/Router";
jest.mock("../app/store", () => mockStore);
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    /**
     this.onNavigate(ROUTES_PATH["NewBill"]); x
     "#employee/bill/new" x
     new NewBill({ document, onNavigate, store, localStorage });x
   
    'form[data-testid="form-new-bill"]'
    formNewBill.addEventListener("submit", this.handleSubmit);
    'input[data-testid="file"]'
     divIcon2.classList.add('active-icon')
 // document.body.innerHTML = `<div id=root></div>`;
      // console.log("document: ", document.body.innerHTML);
      // window.location.hash = "#employee/bill/new";
      // Router();
      // window.onNavigate("#employee/bill/new");
     
      console.log("document: ", document.body.innerHTML);
    */

    //const mockNewBillUI = () => ROUTES({ pathname: "#employee/bill/new", loading: true });

    // const mockDocument = () => {
    //   document.body.innerHTML = `<div id=root>${mockNewBillUI()}</div>`;
    //   document.title = "Bills";

    //   console.log("document: ", document);

    //   return document;
    // };

    // const mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    // const mockLocalStorage = () => {
    //   Object.defineProperty(window, "localStorage", { value: localStorageMock });
    //   window.localStorage.setItem(
    //     "user",
    //     JSON.stringify({
    //       type: "Employee",
    //       email: "f@test.tld",
    //     })
    //   );
    // };

    // beforeEach(() => {
    //   mockLocalStorage();
    //   mockNewBill = new NewBill({
    //     document: mockDocument(),
    //     onNavigate: mockOnNavigate,
    //     store: mockStoreNewBill,
    //     localStorage: window.localStorage,
    //   });
    // });
    let mockStoreNewBill = mockStore;
    let mockNewBill = null;
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "f@test.tld",
      })
    );
    document.body.innerHTML = `<div id=root></div>`;
    Router();
    window.location.hash = "#employee/bill/new";
    // window.on = "#employee/bill/new";
    window.onNavigate("#employee/bill/new");

    mockNewBill = new NewBill({
      document: document,
      onNavigate: window.onNavigate,
      store: mockStoreNewBill,
      localStorage: window.localStorage,
    });

    test("Then ...", () => {
      //    this.onNavigate(ROUTES_PATH["NewBill"]); x
      //  "#employee/bill/new" x
      //  new NewBill({ document, onNavigate, store, localStorage });x

      // 'form[data-testid="form-new-bill"]'x
      // formNewBill.addEventListener("submit", this.handleSubmit);x
      // 'input[data-testid="file"]'x
      //  divIcon2.classList.add('active-icon')
      // formNewBill.addEventListener("submit", this.handleSubmit);
      

      const $mockFormNewBill = screen.getByTestId("form-new-bill");
      // //const $fileInput = screen.getByTestId("file");

      // const mockHandleSubmit = jest.spyOn(mockNewBill, "handleSubmit");
      // $mockFormNewBill.addEventListener("submit", mockHandleSubmit);

      // expect($mockFormNewBill).toBeTruthy();
      // expect($fileInput).toBeTruthy();
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
  });

  describe("When I am on Bills Page 3", () => {});
});
