/**
 * @jest-environment jsdom
 */
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy()

    })
    test("Then get bills ", async () => {
      const getSpy = jest.spyOn(mockStore, 'bills');

        // get bills
       const bills = await mockStore.bills().list();

        // expected results
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(bills.length).toBe(4)
        //expect(bills.data.length).toBe(4);

    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })  
  describe('When I am on Bills page and I click on an icon eye', () => {
  test('Then a modal should open', () => {

      // page bills
      const html = BillsUI({
        data: bills
    });
    document.body.innerHTML = html;
    // initialisation bills
    const store = null;
    const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
    };
    const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage, });
    // simulation modale
    $.fn.modal = jest.fn();
    const icon = screen.getAllByTestId('icon-eye')[0];
    const handleClickIconEye = jest.fn(() =>
        billsList.handleClickIconEye(icon)
    );
    icon.addEventListener('click', handleClickIconEye);
    // déclenchement de l'événement
    fireEvent.click(icon);
    expect(handleClickIconEye).toHaveBeenCalled();
    const modale = document.getElementById('modaleFile');
    expect(modale).toBeTruthy();
  });

})

describe('When I am on Bills page and I click on Nouvelle Facture', () => {
  test('Then I should be in "Nouvelle Facture" Page', () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    document.body.innerHTML = BillsUI({ bills });

    // init bills display
    const billsContainer = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    // get DOM element
 
     // appelle l'evenement clique sur l'icone
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
      const btnFacture = screen.getByTestId('btn-new-bill');
      btnFacture.addEventListener('click', handleClickNewBill);
      userEvent.click(btnFacture); 

    // Attends le résultat
     expect(handleClickNewBill).toHaveBeenCalled();
     expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
      //expect(billsContainer.handleClickNewBill()).toBe()


  });
})

describe('When I am on Bills page and there are note Bills', () => {
  test('Then I should have no bills in my array" Page', () => {
    document.body.innerHTML = BillsUI({ data:[] });

    // get DOM element
    const eyeIcon = screen.queryByTestId('icon-eye');

    // expected result
    expect(eyeIcon).toBeNull();
      //expect(billsContainer.handleClickNewBill()).toBe()


  });
})

/* 
 describe('When I am on Bills page and I click on Nouvelle Facture', () => {
  test('Then I should be in "Nouvelle Facture" Page', () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    document.body.innerHTML = BillsUI({ bills });

    // init bills display
    const billsContainer = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    // get DOM element
 
     // appelle l'evenement clique sur l'icone
     const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
     const btnFacture = screen.getByTestId('btn-new-bill');
    btnFacture.addEventListener('click', handleClickNewBill);
     userEvent.click(btnFacture);

    // Attends le résultat
     expect(handleClickNewBill).toHaveBeenCalled();
    // expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
      //expect(billsContainer.handleClickNewBill()).toBe()


  });
})  */

describe('When I am on Bills page ', () => {
  test('Then I should see the good date format', async () => {
   // document.body.innerHTML = BillsUI({ bills });

    // init bills display
    const billsContainer = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    // get DOM element
    const listBill = await billsContainer.getBills()
      expect(listBill[0].date).toBe("4 Avr. 04")
  });
})

describe("When an error occurs on API", () => {
  test("fetches bills from an API and fails with 404 message error", async() => {
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
  })

  test("fetches messages from an API and fails with 500 message error", async() => {
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
  })
})
}

)

