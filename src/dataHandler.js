// methods
import dataFilter from './modules/dataFilter.js';
import additionParser from './modules/additionParser.js';
import registerHistoryParser from './modules/registerHistoryParser.js';
import creditParser from './modules/creditParser.js';
import additionReducer from './modules/additionReducer.js';
import registerHistoryReducer from './modules/registerHistoryReducer.js';
import requireFetcher from './modules/requireFetcher.js';
import requireComparator from './modules/requireComparator.js';

const handleData = (data) => {
  const preData = dataFilter(data);

  preData.addition1 = additionParser(preData.addition1);
  preData.addition2 = additionParser(preData.addition2);
  preData.addition3 = additionParser(preData.addition3);
  preData.registerHistory = registerHistoryParser(preData.registerHistory);
  preData.credits = creditParser(preData.credits);
  preData.replaceCredits = creditParser(preData.replaceCredits);

  preData.registers = [];
  if (preData.registerHistory) {
    preData.registers.push(registerHistoryReducer(preData.registerHistory));
  }
  if (preData.addition1) {
    preData.registers.push(additionReducer(preData.addition1));
  }
  if (preData.addition2) {
    preData.registers.push(additionReducer(preData.addition2));
  }
  if (preData.addition3) {
    preData.registers.push(additionReducer(preData.addition3));
  }
  // return preData;

  const result = {
    requires: preData.registers.map((register) => requireFetcher(register)),
    credits: preData.credits,
    replaceCredits: preData.replaceCredits,
  };
  result.requires = result.requires.map((require) => requireComparator(require, preData.credits, preData.replaceCredits));

  return result;
};

export default handleData;
