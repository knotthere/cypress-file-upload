import { DEFAULT_PROCESSING_OPTIONS, EVENTS_BY_SUBJECT_TYPE } from './constants';
import { validateFile, validateOptions } from './validators';

import { getFileBlobAsync, getFileMimeType, getFileEncoding } from '../lib/file';
import { merge } from '../lib/object';

export default function attachDirectory(subject, fixtureDir, processingOptions) {
  const { subjectType, force, allowEmpty } = merge(processingOptions, DEFAULT_PROCESSING_OPTIONS);
  validateOptions({ subjectType, force, allowEmpty });
  // Only one
  const dataTransfer = new DataTransfer();
  // Get all the files...
  const fixtures = `${Cypress.config('fixturesFolder')}/`;
  // This would be OS specific...
  cy.exec(`find ${fixtures}${fixtureDir} -type f`)
    .then(contents => {
      // "this" is still the test context object
      const files = contents.stdout.split('\n').map(item => item.replace(fixtures, ''));
      // files.forEach(console.log)
      files.forEach(filePath => {
        // Only support default mime and encoding...
        const fileMimeType = getFileMimeType(filePath);
        const fileEncoding = getFileEncoding(filePath);
        Cypress.cy.fixture(filePath, fileEncoding).then(fileContent => {
          return getFileBlobAsync({
            filePath,
            fileContent,
            mimeType: fileMimeType,
            encoding: fileEncoding,
            fullPath: true,
          }).then(file => {
            validateFile(file, allowEmpty);
            dataTransfer.items.add(file);
          });
        });
      });
    })
    .then(() => {
      const events = EVENTS_BY_SUBJECT_TYPE[subjectType];
      const eventPayload = {
        bubbles: true,
        cancelable: true,
        detail: dataTransfer,
      };
      events.forEach(e => {
        const event = new CustomEvent(e, eventPayload);
        Object.assign(event, { dataTransfer });
        subject[0].dispatchEvent(event);
      });
    });

  return Cypress.cy.wrap(subject, { log: false });
}
