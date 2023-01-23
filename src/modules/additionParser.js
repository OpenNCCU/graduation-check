import departmentMap from '../../data/departmentMap.js';

const additionParser = (attr) => {
  if (attr.length === 0) {
    return undefined;
  }
  // const additionArray = attr
  //   .split('：')
  //   .flatMap((e) => e.split('('))
  //   .flatMap((e) => e.replace(')', '')); // split by '：' and '(' and ')'
  // if (additionArray.length !== 3) {
  //   return undefined;
  // }
  // const additionType = additionArray[0];
  // const additionDept = additionArray[1];
  // const additionYear = parseInt(additionArray[2], 10);
  const additionType = attr.replace(/(.*)：.*\(\d+\)/, '$1');
  const additionDept = attr.replace(/.*：(.*)\(\d+\)/, '$1');
  const additionYear = parseInt(attr.replace(/.*：.*\((\d+)\)/, '$1'), 10);
  const result = {
    // type: additionType.includes('輔系') ? 'minor' : 'major',
    type: additionType.replace(/輔系.*/, 'minor').replace(/雙主修.*/, 'major'),
    deptString: additionDept,
    year: additionYear,
    ...departmentMap[additionYear][additionDept],
  };
  return result;
};

export default additionParser;
