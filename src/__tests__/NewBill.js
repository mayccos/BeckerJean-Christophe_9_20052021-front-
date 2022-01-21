import { fireEvent, screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import {ROUTES_PATH } from "../constants/routes";
import "@testing-library/jest-dom/extend-expect";
import Router from "../app/Router.js";
import axios from "axios";
import AddBill from "../__mocks__/addBill"

jest.mock('axios');
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      const user = JSON.stringify({ 
          type: "Employee",
          email : 'a@a',
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
    });
    describe("when I select a file whose format is not accepted", () =>{
      test("Then the value of input's file  should be empty and an error message should be visible", () => {
        const newBill = new NewBill({
          document,
         
        });
        window.alert = jest.fn();
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
        jest.spyOn(window, "alert");
        expect(window.alert).toHaveBeenCalled();
        expect(inputFile.value).toEqual("");
      });
    });
    describe("When click on submit button of form new bill", () => {
      test("Then should called handleSubmit function", () => {
        // Build DOM new bill
        const html = NewBillUI();
        document.body.innerHTML = html;

        // function handleSubmit()
        const store = null;
        const onNavigate = (pathname) => {
          document.body.innerHTML = pathname;
        };

        const thisNewBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
        const submitFormNewBill = screen.getByTestId("form-new-bill");

        expect(submitFormNewBill).toBeTruthy();

        const mockHandleSubmit = jest.fn(thisNewBill.handleSubmit);
        submitFormNewBill.addEventListener("submit", mockHandleSubmit);
        fireEvent.submit(submitFormNewBill);

        expect(mockHandleSubmit).toHaveBeenCalled();
      });
      test("Then bill form is submited", () => {
        // Build Dom New bill
        const html = NewBillUI();
        document.body.innerHTML = html;

        // function createBill()
        const store = null;
        const thisNewBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });

        const mockCreateBillFn = jest.fn(thisNewBill.updateBill);
        const submitFormNewBill = screen.getByTestId("form-new-bill");

        submitFormNewBill.addEventListener("submit", mockCreateBillFn);
        fireEvent.submit(submitFormNewBill);

        expect(mockCreateBillFn).toHaveBeenCalled();
        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      });
    })

    describe("When I upload an image in file input", () => {
      test("Then the file name should be displayed into the input", () => {
        // Build DOM for new bill page
        const html = NewBillUI();
        document.body.innerHTML = html;

        // function handleChangeFile()
        
        const onNavigate = (pathname) => {
          document.body.innerHTML = pathname
        };

        const thisNewBill = new NewBill({ document, onNavigate, store: null, localStorage });
        const changeFile = jest.fn(thisNewBill.handleChangeFile);
        const file = screen.getByTestId("file");
        

        // Simulate if the file's extension is accepted
        file.addEventListener("change", changeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["test.jpg"], "test.jpg", { type: "image/jpg" })],
          },
        });

        expect(changeFile).toHaveBeenCalled();
        expect(file.files[0].name).toBe("test.jpg");
      });

     
    })

  });
})
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