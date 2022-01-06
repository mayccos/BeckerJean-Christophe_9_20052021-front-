import { fireEvent, screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { bills } from "../fixtures/bills.js";
import "@testing-library/jest-dom/extend-expect";
import Store from '../app/Store'

import Router from "../app/Router.js";
import store from '../__mocks__/store';
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      const user = JSON.stringify({ 
          type: "Employee",
          email : 'xx@xx',
      });
      window.localStorage.setItem("user", user);

      const pathname = ROUTES_PATH["NewBill"];
      Object.defineProperty(window, "location", {
          value: {
              hash: pathname
          }
      });

      document.body.innerHTML = `<div id="root"></div>`;
      Router();
    });
    test("Then the select of expense-type is required", () => {
      const selectExpenseType = screen.getByTestId("expense-type");
      expect(selectExpenseType).toBeRequired();
    })
    test("Then the input of date is required", () =>{
      const inputDate = screen.getByTestId("datepicker");
      expect(inputDate).toBeRequired();
    })
    test("Then the input of amount is required", () =>{
      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount).toBeRequired();
    })
    test("Then the input of pct is required", () =>{
      const inputPct = screen.getByTestId("pct");
      expect(inputPct).toBeRequired();
    })
    test("Then the input of Supporting documents is required", () =>{
      const inputFile = screen.getByTestId("file");
      expect(inputFile).toBeRequired();
    })
  })
  describe("When I do not fill fields and I click on send button", () =>{
    test("Then It should renders NewBill page", () =>{
      const inputName = screen.getByTestId("expense-name");
      expect(inputName.getAttribute("placeholder")).toBe("Vol Paris Londres");
      expect(inputName.value).toBe("");

      const inputDate = screen.getByTestId("datepicker");
      expect(inputDate.value).toBe("");

      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount.getAttribute("placeholder")).toBe("348");
      expect(inputAmount.value).toBe("");

      const inputVat = screen.getByTestId("vat");
      expect(inputVat.getAttribute("placeholder")).toBe("70");
      expect(inputVat.value).toBe("");

      const inputPct = screen.getByTestId("pct");
      expect(inputPct.getAttribute("placeholder")).toBe("20");
      expect(inputPct.value).toBe("");

      const inputComment = screen.getByTestId("commentary");
      expect(inputComment.value).toBe("");

      const inputFile = screen.getByTestId("file");
      expect(inputFile.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      userEvent.click(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })
  

  describe("When I do fill required fileds in good format and I click on submit button", () => {
            
    test("Then it should render the bills page", () => {
      api.storage.ref = jest.fn().mockImplementation(() => {
          return {
              put: jest.fn().mockImplementation((e) => {
                  return {
                        then : jest.fn().mockResolvedValue(),
                  }
              }),
          }
        });
      store.bills = () => ({ 
          get: jest.fn().mockResolvedValue(),
          add: jest.fn().mockResolvedValue() 
      });

      const inputData = {
          expense: "Transports",
          date: "2022-01-06",
          amount: "500",
          pct: "20",
          file: "image.jpg",
      };

      /*const inputType = screen.getByTestId("expense-type");
      expect(inputType.value).toBe(inputData.expense);*/

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, {
          target: { value: inputData.date },
      });
      expect(inputDate.value).toBe(inputData.date);

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, {
          target: { value: inputData.amount },
      });
      expect(inputAmount.value).toBe(inputData.amount);

      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, {
            target: { value: inputData.pct },
      });
      expect(inputPct.value).toBe(inputData.pct);

      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, {
          target: {
              files: [
                  new File(["(⌐□_□)"], inputData.file, {
                      type: "image/jpg",
                  }),
              ],
          },
      });

      const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: bills });
      };

      const newBill = new NewBill({
          document,
          onNavigate,
          store,
      });
      const submitButton = screen.getByText("Envoyer");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      submitButton.addEventListener("click", handleSubmit);
      userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();

      const billsPage = screen.getByText("Mes notes de frais");
      expect(billsPage).toBeTruthy();
    });
  })
})