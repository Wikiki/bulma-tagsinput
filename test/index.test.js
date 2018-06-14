'use strict';

const bulmaTagsinput = require('../src/js/index').default;

describe('bulmaTagsinput', () => {
  test('Should throw exception if instanciate with no/wrong selector', () => {
    expect(() => {
      new bulmaTagsinput();
    }).toThrow('An invalid selector or non-DOM node has been provided.');
  });

  test('Should return an array', () => {
    var instances = bulmaTagsinput.attach('.selector');
    expect(Array.isArray(instances)).toBe(true);
  });

  test('Should return an array of bulmaTagsinput instances', () => {
    var instances = bulmaTagsinput.attach();
    instances.every(i => expect(i).toBeInstanceOf(bulmaTagsinput));
  });

  test('Should return an array of bulmaTagsinput instances with options', () => {
    var instances = bulmaTagsinput.attach('[type="date"]', {
      minDate: '2018-01-01',
      maxDate: '2018-12-31',
      dateFormat: 'yyyy-mm-dd',
    });
    instances.every(i => expect(i).toBeInstanceOf(bulmaTagsinput));
  });
});
