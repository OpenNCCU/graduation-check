// import fs from 'fs';
import required from './required.js';

const parse = () => {
  const data = required;
  const result = { ...data };
  Object.keys(result).forEach((year) => {
    result[year] = result[year].map((item) => {
      const r = { ...item };

      r.year = item.year;
      r.department_name = item.department_name;
      r.group_name = item.group_name;
      r.requireCredit = item.requireCredit;
      r.minTotalCredit = item.group_condition.find((text) => text.includes('本系最低畢業總學分數'));
      r.spacialty = item.spacialty;

      r.subjects = item.children.map((subject) => ({
        name: subject['科目名稱'],
        type: subject['修別'].substring(0, 1),
        semester: [subject['第一學年上'], subject['第一學年下'], subject['第二學年上'], subject['第二學年下'], subject['第三學年上'], subject['第三學年下'], subject['第四學年上'], subject['第四學年下']].map((e) => e !== '無'),
        group: subject['修別'].includes('群') ? subject['修別'].substring(1, 2) : '',
        maxCredit: subject['規定學分'],
        minCredit: subject['規定學分'],
        semCount: subject['學期數'],
        // eslint-disable-next-line no-nested-ternary
        constraint: subject['須修本門課之科目代碼'] === '無' ? (subject['認定方式'] === '不限' ? '' : item.dept.substring(0, (subject['認定方式'] === '需為本系開課' ? 3 : 1))) : subject['須修本門課之科目代碼'],
        note: subject['備註(先修科目說明)'],
      }));
      return r;
    });

    // fs.writeFileSync('./data/test.json', JSON.stringify(result, null, 2));
  });
  return result;
};

export default parse;
