import fs from 'fs';
import required from './required.js';

const parse = () => {
  const data = required;
  const result = { ...data };
  result.subjects = data.children.map((subject) => {
    const r = {};
    r.name = subject['科目名稱'];
    r.type = subject['修別'];
    return r;
  });
  fs.writeFileSync('./data/test.json', JSON.stringify(result, null, 2));
  return result;
};

export default parse;
