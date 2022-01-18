import { fireEvent, screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import {create} from "../../../BeckerJean-Christophe_9_20052021-back-/controllers/bill"

import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { bills } from "../fixtures/bills.js";
import "@testing-library/jest-dom/extend-expect";
import Store from '../app/Store';
import Router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage";
import axios from "axios";
import firebase from "../__mocks__/firebase";
import AddBill from "../__mocks__/users"

jest.mock('axios');
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
  

    describe("When I do fill required files in good format and I click on submit button", () => {
            
      test("Then it should render the bills page with the new bill", () => {
        axios.storage.ref = jest.fn().mockImplementation(() => {
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
          date: "2021-12-22",
          amount: "310",
          pct: "20",
          file: "image.jpg",
      };

      const inputType = screen.getByTestId("expense-type");
      expect(inputType.value).toBe(inputData.expense);

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
          firestore,
      });
      const submitButton = screen.getByText("Envoyer");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      submitButton.addEventListener("click", handleSubmit);
      userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();

      const billsPage = screen.getByText("Mes notes de frais");
      expect(billsPage).toBeTruthy();
  });
});
    describe("when I select a file whose format is not accepted", () =>{
      test("Then the value of input's file  should be empty and an error message should be visible", () => {
        const newBill = new NewBill({
          document,
       });

        const inputData = {
          file: "pdf.pdf",
        };

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const inputFile = screen.getByTestId("file");
        inputFile.addEventListener("change", handleChangeFile);

        fireEvent.change(inputFile, {
          target: {
              files: [
                  new File(["image"], inputData.file, {
                      type: "application/pdf",
                  }),
              ],
          },
        });

        expect(inputFile.parentNode).toHaveAttribute(
          "data-error-visible",
          "true"
        );
        expect(inputFile.value).toEqual("");
      });
    });
    describe("when I select a file whose format is  accepted", () =>{
      test("Then the value of input's file  should be empty and an error message should be visible", () => {
        const newBill = new NewBill({
          document,
       });

        const inputData = {
          file: "image.png",
        };

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const inputFile = screen.getByTestId("file");
        inputFile.addEventListener("change", handleChangeFile);

        fireEvent.change(inputFile, {
          target: {
              files: [
                  new File(["image"], inputData.file, {
                      type: "image/png",
                  }),
              ],
          },
        });

        expect(inputFile.parentNode).toHaveAttribute(
          "data-error-visible",
          "false"
        );
        expect(inputFile.value).toBe(inputData.file);
      });

    });
  })
});

// Test d'integration post

describe("When I am an user connected as Employee", () =>{
  describe("When I do fill required files in good format and I click on submit button", () =>{
    test("Then Add new bill to mock API POST", async () => {
      const addBill =[ 
        {
          email: 'a@a',
          type: 'Transports',
          name:  'Train Paris-Suisse',
          amount: '300€',
          date:  '2022-01-10',
          vat: 10,
          pct: 20,
          commentary: "",
          fileUrl: 'https://stockimage.com/image.png',
          fileName: 'image.png',
          status: 'pending'
        }];
      const resp = {data: addBill};
      axios.post.mockResolvedValue(resp);
      return AddBill.post().then(data => expect(data).toEqual(addBill));
      
    
    });
    
    test("fetches bills from an API and fails with 404 message error", async () => {
      axios.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      axios.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})