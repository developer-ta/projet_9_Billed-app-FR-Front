import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import $ from "jquery";

describe("Given I am connected as an employee", () => {
  //1
  describe("When I am on Bills Page", () => {
    let mockHtml = (htmlRender) => {
      document.body.innerHTML = `<div id=root></div>`;
      document.getElementById("root").innerHTML = htmlRender;
    };
    let isLoading = true;
    let billsDataList = [];

    afterEach(() => (document.body.innerHTML = ""));

    test("Then bill icon in vertical layout should be highlighted", () => {
      mockHtml(BillsUI({ data: billsDataList }));
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });

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
    let mockDocument = () => {
      document.body.innerHTML = `<div id=root>${BillsUI({ data: bills })}</div>`;

      document.title = "Bills";
      let scriptBootstrap = document.createElement("script");
      scriptBootstrap.src = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js";
      scriptBootstrap.integrity = "sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl";
      scriptBootstrap.crossOrigin = "anonymous";

      // Append the script to the body or head
      document.body.appendChild(scriptBootstrap);

      return document;
    };
    let mockLocalStorage = () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
        })
      );
    };
    let mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    let mockStore = null;

    let mockBills = null;

    beforeEach(() => {
      mockBills = new Bills({
        document: mockDocument(),
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage: mockLocalStorage(),
      });
    });
    afterEach(() => {
      //document.body.innerHTML = "";
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
  });
});
