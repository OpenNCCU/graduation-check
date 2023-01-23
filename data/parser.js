import fs from 'fs';
import required from './required.js';

const parse = () => {
  const data = required;
  const result = { ...data };
  Object.keys(result).forEach((year) => {
    result[year].map((item) => {
      const r = { ...item };
      r.subjects = item.children.map((subject) => {
        const r1 = {};
        r1.name = subject['科目名稱'];
        r1.type = subject['修別'];
        r1.semester = [subject['第一學年上'], subject['第一學年下'], subject['第二學年上'], subject['第二學年下'], subject['第三學年上'], subject['第三學年下'], subject['第四學年上'], subject['第四學年下']].map((e) => e !== '無');
        return r1;
      });
      return r;
    });

    fs.writeFileSync('./data/test.json', JSON.stringify(result, null, 2));
    return result;
  });
};

export default parse;
