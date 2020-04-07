import attachFile from './attachFile';
import attachDirectory from './attachDirectory';

const initialize = () => {
  Cypress.Commands.add('attachFile', { prevSubject: true }, attachFile);
  Cypress.Commands.add('attachDirectory', { prevSubject: true }, attachDirectory);
};

initialize();
