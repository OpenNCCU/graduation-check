import fs from 'fs';
import departmentMap from './departmentMap.js';
import deptRefer from './departmentRefer.js';
import dummydata from './.dummydata.js';
import dataFilter from '../src/modules/dataFilter.js';

const parse = () => {
  const departmentData = departmentMap;
  const {
    addition1, addition2, addition3, registerHistory,
  } = dataFilter(dummydata);
  let processData = [
    { year: parseInt(addition1.replace(/.*：.*\((\d+)\)/, '$1'), 10), text: addition1.replace(/.*：(.*)\(\d+\)/, '$1') },
    { year: parseInt(addition2.replace(/.*：.*\((\d+)\)/, '$1'), 10), text: addition2.replace(/.*：(.*)\(\d+\)/, '$1') },
    { year: parseInt(addition3.replace(/.*：.*\((\d+)\)/, '$1'), 10), text: addition3.replace(/.*：(.*)\(\d+\)/, '$1') },
    ...registerHistory.map((e) => ({
      year: parseInt(e.year.replace(/(\d+).*\/.*(\d).*\(.*/, '$1'), 10),
      text: e.gradename.replace(/(\w|\s|\(|\)|['&,.-])+/, '').split(' ')[0],
    })),
  ];
  processData = processData.filter((e) => e.text.length > 0).map((e) => {
    const { year, text } = e;
    const splitText = e.text.split(/([系一二三四])/g);
    const nameText = splitText[0]; // 系所、組別
    const { deptName, deptID } = deptRefer[nameText];
    const otherText = splitText[2].replace(/([甲乙丙丁])/, ''); // 組別
    const group = otherText.length > 0 ? otherText : 0;
    const gradeText = splitText[1];
    const grade = '系一二三四'.indexOf(gradeText); // 要剔除0
    return {
      year,
      text,
      deptName,
      deptID,
      group,
      grade,
      nameText,
      gradeText,
      otherText,
    };
  });
  processData.forEach((e) => {
    const {
      deptName, deptID, group, grade,
    } = e;
    departmentData[e.year][e.text] = { deptName, deptID, group };
    if (grade > 0) {
      departmentData[e.year][e.text].grade = grade;
    }
  });
  fs.writeFileSync('./data/departmentMap.js', `const data = ${JSON.stringify(departmentData, null, 2)}\n\nexport default data;\n`);
  return departmentData;
};

export default parse;
