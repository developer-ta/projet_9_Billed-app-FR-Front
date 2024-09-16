/**
 * @jest-environment jsdom
 */


import NewBill from "../containers/NewBill.js";
import { fireEvent, screen, waitFor, queryByTestId } from "@testing-library/dom";

import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

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

    // window.location.hash = "#employee/bill/new";
    // // window.on = "#employee/bill/new";
    // window.onNavigate("#employee/bill/new");

    afterEach(() => {
      document.body.innerHTML = "";
      jest.clearAllMocks();
    });
    // Test partie interface graphique
    test("Then ... test newBilleUi", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
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

    //test level newBille constructor
    test("Then ... test newBille constructor", () => {
      expect(mockNewBill.document.title).toEqual("newBille");
      expect(mockNewBill.$errorSpan.style.display).toEqual("none");
    });

    //test level newBille Dowland file event
    test("Then ... test newBille event handleChangeFile", () => {
      /**
// 填写表单字段
fireEvent.change(inputEmailUser, { target: { value: 'admin@example.com' } });
fireEvent.change(inputPasswordUser, { target: { value: 'password123' } });

// 提交表单
fireEvent.submit(form);

// 验证
expect(inputEmailUser.value).toBe('admin@example.com');
expect(inputPasswordUser.value).toBe('password123'); */
      let mockFile = new File(["test blob file", "", ""], "profil.jpg", { type: "image.jpg" });
      const $fileInput = screen.getByTestId("file");
      const $btnSubmit = screen.getByText("Envoyer");
      // $btnSubmit = document.querySelector("#btn-send-bill");
      const mockHandleChangeFile = jest.spyOn(mockNewBill, "handleChangeFile");
      $fileInput.addEventListener("change", mockHandleChangeFile);
      fireEvent.change($fileInput, { target: { files: [mockFile] } });

      //expect($mockFormNewBill).toBeTruthy();
      expect($fileInput).toBeTruthy();
      expect($btnSubmit.disabled).toBe(false);
      expect($fileInput.files).toBeTruthy();
      expect($fileInput.files[0]).toBe(mockFile);
      expect($fileInput.files[0].name).toBe("profil.jpg");
      expect(mockHandleChangeFile).toHaveBeenCalled();
    });
    test("Then ... test newBille event handleChangeFile if ", () => {
      let mockFile = new File(["test blob file"], "profil.txt", {
        type: "text/plain",
        lastModified: new Date(),
      });
      const $fileInput = screen.getByTestId("file");
      const $errorSpan = mockNewBill.$errorSpan;
      const mockHandleChangeFile = jest.spyOn(mockNewBill, "handleChangeFile");
      $fileInput.addEventListener("change", mockHandleChangeFile);
      fireEvent.change($fileInput, { target: { files: [mockFile] } });

      //expect($mockFormNewBill).toBeTruthy();
      expect($fileInput).toBeTruthy();
      expect($errorSpan.style.display).toBe("block");
      expect(mockHandleChangeFile).toHaveBeenCalled();

      expect($fileInput.files[0].name).toBe("profil.txt");
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

  describe("When I am on Bills Page 3", () => {});
});
