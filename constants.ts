import { Employee } from './types';

export const INITIAL_DATA: Employee[] = [
  { id: '1', name: 'RONAN', admissionDate: '01/06/2022', vacationStart: '05/01/2026', vacationEnd: '03/02/2026', returnDate: '04/02/2026' },
  { id: '2', name: 'IGOR', admissionDate: '04/01/2023', vacationStart: '05/01/2026', vacationEnd: '03/02/2026', returnDate: '04/02/2026' },
  { id: '3', name: 'PAULO', admissionDate: '03/01/2022', vacationStart: '05/01/2026', vacationEnd: '03/02/2026', returnDate: '04/02/2026' },
  { id: '4', name: 'RENATO CESAR', admissionDate: '01/10/2016', vacationStart: '02/02/2026', vacationEnd: '03/03/2026', returnDate: '04/03/2026' }, // Adjusted end date based on start logic (Feb->Mar)
  { id: '5', name: 'MARCELO', admissionDate: '03/01/2022', vacationStart: '02/02/2026', vacationEnd: '03/03/2026', returnDate: '04/03/2026' }, // Adjusted end date based on start logic (Feb->Mar)
  { id: '6', name: 'BELCHIOR', admissionDate: '01/11/2023', vacationStart: '02/09/2026', vacationEnd: '01/10/2026', returnDate: '02/10/2026' },
  { id: '7', name: 'FABIO CESAR', admissionDate: '03/01/2022', vacationStart: '02/03/2026', vacationEnd: '31/03/2026', returnDate: '01/04/2026' },
  { id: '8', name: 'REINALDO ROBERTO', admissionDate: '03/01/2017', vacationStart: '06/04/2026', vacationEnd: '05/05/2026', returnDate: '06/05/2026' },
  { id: '9', name: 'RODRIGO', admissionDate: '01/04/2025', vacationStart: '06/04/2026', vacationEnd: '05/05/2026', returnDate: '06/05/2026' },
  { id: '10', name: 'FELIPE', admissionDate: '07/02/2023', vacationStart: '06/04/2026', vacationEnd: '05/05/2026', returnDate: '06/05/2026' },
  { id: '11', name: 'ANDERSON CLAUDIO', admissionDate: '07/01/2020', vacationStart: '04/05/2026', vacationEnd: '02/06/2026', returnDate: '03/06/2026' },
  { id: '12', name: 'MARCOS EDUARDO', admissionDate: '01/11/2024', vacationStart: '01/06/2026', vacationEnd: '30/06/2026', returnDate: '01/07/2026' },
  { id: '13', name: 'CLEISSON', admissionDate: '07/01/2019', vacationStart: '01/06/2026', vacationEnd: '30/06/2026', returnDate: '01/07/2026' },
  { id: '14', name: 'ABNER MATIAS', admissionDate: '01/11/2024', vacationStart: '06/07/2026', vacationEnd: '04/08/2026', returnDate: '05/08/2026' },
  { id: '15', name: 'GIOVANNI CELERI', admissionDate: '18/12/2018', vacationStart: '06/07/2026', vacationEnd: '04/08/2026', returnDate: '05/08/2026' },
  { id: '16', name: 'ERLEN SILVA', admissionDate: '01/02/2016', vacationStart: '03/08/2026', vacationEnd: '01/09/2026', returnDate: '02/09/2026' },
  { id: '17', name: 'RICARDO', admissionDate: '01/07/2020', vacationStart: '03/08/2026', vacationEnd: '01/09/2026', returnDate: '02/09/2026' },
  { id: '18', name: 'RAFAEL PERPETUO', admissionDate: '06/08/2021', vacationStart: '05/10/2026', vacationEnd: '03/11/2026', returnDate: '04/11/2026' },
  { id: '19', name: 'WILLIAN CARDOSO', admissionDate: '01/06/2022', vacationStart: '05/10/2026', vacationEnd: '03/11/2026', returnDate: '04/11/2026' },
  { id: '20', name: 'EDUARDO SANT ANNA', admissionDate: '02/10/2017', vacationStart: '05/10/2026', vacationEnd: '03/11/2026', returnDate: '04/11/2026' },
  { id: '21', name: 'PEDRO HENRIQUE', admissionDate: '01/03/2022', vacationStart: '02/11/2026', vacationEnd: '01/12/2026', returnDate: '02/12/2026' },
  { id: '22', name: 'WELINGTON HENRIQUE', admissionDate: '01/08/2018', vacationStart: '07/12/2026', vacationEnd: '05/01/2027', returnDate: '06/01/2027' } // Fixed year rollover to 2027
];