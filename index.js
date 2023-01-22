const express = require('express');
const cors = require('cors');
// const path = require('path')

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
// app.use(express.static(path.join(__dirname, "build")));
// app.use("/api/test", require("./test"));

app.listen(port, () => {
  // console.log(`App listening at http://localhost:${port}`);
});

/*
 * Dummy data.
 */
const dummydata = require('./.dummydata');
const departmentMap = require('./departmentMap');
// const required = require('./required');

/*
 * Filter.
 */
const dataFilter = (data) => {
  const result = {};

  const getKeyItem = (key) => {
    if (!data) { return undefined; }
    if (!Array.isArray(data)) { return undefined; }
    if (data.length === 0) { return undefined; }
    if (data.find((e) => Object.keys(e)[0] === key) === undefined) { return undefined; }
    if (data.find((e) => Object.keys(e)[0] === key)[key] === undefined) { return undefined; }
    return data.find((e) => Object.keys(e)[0] === key)[key];
  };

  const studentInfo = getKeyItem('基本資料');
  const registerHistory = getKeyItem('學籍歷程');
  const credit = getKeyItem('課業學習');

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

  result.addition1 = studentInfo.STUDENT_ADD_MJR;
  result.addition2 = studentInfo.STUDENT_ADD_MJR2;
  result.addition3 = studentInfo.STUDENT_ADD_MJR3;
  result.registerHistory = registerHistory.registerHistoryDataArray;
  result.credits = credit.creditDataArray;
  result.replaceCredits = credit.replaceCreditDataArray;

  return result;
};

/*
 * Parser.
 */
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

const registerHistoryParser = (attr) => {
  let result = null;
  if (attr.length > 0) {
    result = attr.map((e) => {
      const yearAndSemester = e.year
        .split('(')[0]
        .split('/')
        .map((yearOrSemester) => parseInt(yearOrSemester.trim(), 10));
      const year = yearAndSemester[0];
      const semester = yearAndSemester[1];
      const regsts = e.regsts.split(' ')[0];
      const gradename = e.gradename.split(' ')[0];

      return {
        year,
        semester,
        regsts,
        gradename,
        ...departmentMap[year][gradename],
      };
    });
  }
  return result;
};

const creditParser = (attr) => {
  let result = attr;
  if (attr.length > 0) {
    result = attr.map((e) => {
      const year = parseInt(e.year.trim(), 10);
      const semester = parseInt(e.semester.trim(), 10);
      const { subNum } = e;
      const subName = e.subName.trim();
      const subSel = e.subSel.trim();
      const { subPnt } = e;
      const { score } = e;

      return {
        year,
        semester,
        subNum,
        subName,
        subSel,
        subPnt,
        score,
      };
    });
  }
  return result;
};

/*
 * Reducer.
 */
const addReducer = (attr) => {
  if (!attr) {
    return undefined;
  }
  return {
    main: false,
    type: attr.type,
    dept: attr.dept,
    group: attr.group,
    year: attr.year,
  };
};

const registerHistoryReducer = (attr) => {
  let notRegNum = 0;
  for (let i = 1; i <= attr.length; i += 1) {
    if (attr[attr.length - i].regsts !== '註冊') {
      notRegNum += 1;
    }
    if (i === attr.length
      || attr[attr.length - i].dept !== attr[attr.length - i - 1].dept) {
      const regDept = attr[attr.length - i];
      const { dept } = regDept;
      const { group } = regDept;
      const regNum = (i - notRegNum) + (regDept.grade - 1) * 2 - (regDept.semester - 1);
      const regYear = regDept.year - (regDept.grade - 1);
      return {
        main: true,
        type: 'major',
        dept,
        group,
        year: regYear,
        regNum,
      };
    }
  }
  return undefined;
};

/*
 * Fetcher.
 */
const getRequire = (register) => ({
  ...register,
});

/*
 * Comparator.
 */
const checkRequire = () => {
  // const checkRequire = (require, credit, replaceCredit) => {
  // credit.forEach(element => {
  //   console.log(element)
  //   // TODO: check require
  // })
  // replaceCredit.forEach(element => {
  //   console.log(element)
  //   // TODO: check require
  // })
  // return {
  //   ...require
  // }
};

/*
 * Main.
 */
const handleData = (data) => {
  const preData = dataFilter(data);

  preData.addition1 = additionParser(preData.addition1);
  preData.addition2 = additionParser(preData.addition2);
  preData.addition3 = additionParser(preData.addition3);
  preData.registerHistory = registerHistoryParser(preData.registerHistory);
  preData.credits = creditParser(preData.credits);
  preData.replaceCredits = creditParser(preData.replaceCredits);

  preData.registers = [];
  if (preData.registerHistory) preData.registers.push(registerHistoryReducer(preData.registerHistory));
  if (preData.addition1) preData.registers.push(addReducer(preData.addition1));
  if (preData.addition2) preData.registers.push(addReducer(preData.addition2));
  if (preData.addition3) preData.registers.push(addReducer(preData.addition3));

  const result = {};
  result.requires = preData.registers.map((register) => getRequire(register));

  result.credits = preData.credits;
  result.replaceCredits = preData.replaceCredits;
  result.requires = result.requires.map((require) => checkRequire(require, preData.credits, preData.replaceCredits));

  return result;
};

app.get('*', (req, res) => {
  // console.log(req.url)
  req.body = dummydata; // dummy data
  const data = handleData(req.body);
  const result = { data, success: false, error: 'NULL PATH.' };
  res.send(result);
});
