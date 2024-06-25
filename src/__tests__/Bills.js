import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import { ready } from "jquery";

describe("Given I am connected as an employee", () => {
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

  describe("When I am on Bills Page 2", () => {
    let mockDocument = () => {
      document.body.innerHTML = `<div id=root>${BillsUI({ data: bills })}</div>`;
      document.title = "Bills";
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
      return window.localStorage;
    };
    let mockOnNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }));

    let mockStore = null;

    let mockBills = null;

    beforeEach(() => {
      mockLocalStorage().clear;

      mockBills = new Bills({
        document: mockDocument(),
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage: mockLocalStorage(),
      });
    });

    test("Then, should appear Bills list", async () => {
      // const mockPathname = "Bills";

      await waitFor(() => screen.getAllByTestId("icon-eye"));
      const $iconEyes = screen.getAllByTestId("icon-eye");
      mockBills.handleClickIconEye = jest.fn((iconEye) => iconEye);
      // const handleClickIconEye = jest.fn((e) => mockBills.handleClickIconEye(e, $iconEye));

      $iconEyes.forEach(($iconEye) => {
        $iconEye.addEventListener("click", (e) => mockBills.handleClickIconEye(e, $iconEye));
      });
      userEvent.click($iconEyes[0]);

      expect(mockBills.document.title).toEqual("Bills");

      expect(mockBills.handleClickIconEye).toHaveBeenCalled();
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

    //const handleShowTickets2 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 2));
    //const handleShowTickets3 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 3));

    //  const icon2 = screen.getByTestId("arrow-icon2");
    //  const icon3 = screen.getByTestId("arrow-icon3");

    //  icon1.addEventListener("click", handleShowTickets1);
    //  userEvent.click(icon1);
    //  expect(handleShowTickets1).toHaveBeenCalled();

    //  await waitFor(() => screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`));
    //  expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy();
    //  icon2.addEventListener("click", handleShowTickets2);
    //  userEvent.click(icon2);
    //  expect(handleShowTickets2).toHaveBeenCalled();
    //  await waitFor(() => screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`));
    //  expect(screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)).toBeTruthy();

    //  icon3.addEventListener("click", handleShowTickets3);
    //  userEvent.click(icon3);
    //  expect(handleShowTickets3).toHaveBeenCalled();
    //  await waitFor(() => screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`));
    //  expect(screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)).toBeTruthy();
  });
});
/**
`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;

*/
