const getKeyItem = (data, key) => {
  if (!data) {
    return undefined;
  }
  if (!Array.isArray(data)) {
    return undefined;
  }
  if (data.length === 0) {
    return undefined;
  }
  if (data.find((e) => Object.keys(e)[0] === key) === undefined) {
    return undefined;
  }
  if (data.find((e) => Object.keys(e)[0] === key)[key] === undefined) {
    return undefined;
  }
  return data.find((e) => Object.keys(e)[0] === key)[key];
};

const dataFilter = (data) => {
  const studentInfo = getKeyItem(data, '基本資料');
  const registerHistory = getKeyItem(data, '學籍歷程');
  const credit = getKeyItem(data, '課業學習');

  if (!studentInfo) {
    return undefined;
  }
  if (typeof studentInfo.STUDENT_ADD_MJR !== 'string') {
    return undefined;
  }
  if (typeof studentInfo.STUDENT_ADD_MJR2 !== 'string') {
    return undefined;
  }
  if (typeof studentInfo.STUDENT_ADD_MJR3 !== 'string') {
    return undefined;
  }
  if (!registerHistory) {
    return undefined;
  }
  if (!registerHistory.registerHistoryDataArray) {
    return undefined;
  }
  if (!credit) {
    return undefined;
  }
  if (!credit.creditDataArray) {
    return undefined;
  }
  if (!credit.replaceCreditDataArray) {
    return undefined;
  }

  const result = {};
  result.addition1 = studentInfo.STUDENT_ADD_MJR;
  result.addition2 = studentInfo.STUDENT_ADD_MJR2;
  result.addition3 = studentInfo.STUDENT_ADD_MJR3;
  result.registerHistory = registerHistory.registerHistoryDataArray;
  result.credits = credit.creditDataArray;
  result.replaceCredits = credit.replaceCreditDataArray;

  return result;
};

export default dataFilter;
