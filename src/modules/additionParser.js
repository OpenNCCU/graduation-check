import departmentMap from '../../data/departmentMap.js';

const additionParser = (attr) => {
  const additionArray = attr
    .split('：')
    .flatMap((e) => e.split('('))
    .flatMap((e) => e.replace(')', '')); // split by '：' and '(' and ')'
  const additionType = additionArray[0];
  const additionDept = additionArray[1];
  const additionYear = parseInt(additionArray[2], 10);
  if (additionArray.length !== 3) {
    return undefined;
  }
  const result = {
    type: additionType.includes('輔系') ? 'minor' : 'major',
    deptString: additionDept,
    year: additionYear,
    ...departmentMap[additionYear][additionDept],
  };
  return result;
};

export default additionParser;
