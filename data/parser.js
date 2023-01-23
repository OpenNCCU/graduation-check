import fs from 'fs';
import required from './required.js';

const parse = () => {
  const data = required;
  const result = { ...data };
  result.aaa = data['107'].map((e) => e.children.map((subject) => {
    const r = {};
    r.name = subject['科目名稱'];
    r.type = subject['修別'];
    r.semester = [subject['第一學期上']];
    return r;
  }));
  fs.writeFileSync('./data/test.json', JSON.stringify(result, null, 2));
  return result;
};

export default parse;
