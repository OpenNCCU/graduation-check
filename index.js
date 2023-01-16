const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
// app.use(express.static(path.join(__dirname, "build")));

// app.use("/api/test", require("./test"));

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.get("*", (req, res) => {
  // console.log(req.url)
  req.body = require("./.dummydata"); // dummy data

  const preData = dataFilter(req.body);

  preData.add1 = addParser(preData.add1);
  preData.add2 = addParser(preData.add2);
  preData.add3 = addParser(preData.add3);
  preData.registerHistory = registerHistoryParser(preData.registerHistory);
  preData.credits = creditParser(preData.credits);
  preData.replaceCredits = creditParser(preData.replaceCredits);

  
  preData.registers = [];
  preData.registerHistory && preData.registers.push(registerHistoryReducer(preData.registerHistory));
  preData.add1 && preData.registers.push(addReducer(preData.add1));
  preData.add2 && preData.registers.push(addReducer(preData.add2));
  preData.add3 && preData.registers.push(addReducer(preData.add3));
  
  const data = {};
  data.requires = preData.registers.map(register => getRequire(register));

  data.credits = preData.credits;
  data.replaceCredits = preData.replaceCredits;
  data.requires = data.requires.map(require => checkRequire(require, preData.credits, preData.replaceCredits));

  const result = { data: data, success: false, error: "NULL PATH." };
  res.send(result);
});

const dataFilter = (data) => {
  const getKeyItem = (key) => {
    if (!data) return undefined;
    if (!Array.isArray(data)) return undefined;
    if (data.length === 0) return undefined;
    if (data.find(e => Object.keys(e)[0] === key) === undefined) return undefined;
    if (data.find(e => Object.keys(e)[0] === key)[key] === undefined) return undefined;
    return data.find(e => Object.keys(e)[0] === key)[key];
  };

  const result = {};
  const student = getKeyItem('基本資料');
  if (!student) return undefined;

  result.add1 = student.STUDENT_ADD_MJR;
  if (typeof result.add1 !== 'string') return undefined;
  result.add2 = student.STUDENT_ADD_MJR2;
  if (typeof result.add2 !== 'string') return undefined;
  result.add3 = student.STUDENT_ADD_MJR3;
  if (typeof result.add3 !== 'string') return undefined;

  const registration = getKeyItem('學籍歷程');
  if (!registration) return undefined;

  result.registerHistory = registration.registerHistoryDataArray;
  if (!result.registerHistory) return undefined;

  const credit = getKeyItem('課業學習');
  if (!credit) return undefined;

  result.credits = credit.creditDataArray;
  if (!result.credits) return undefined;
  result.replaceCredits = credit.replaceCreditDataArray;
  if (!result.replaceCredits) return undefined;

  return result;
}

const addParser = (attribute) => {
  const departmentMap = require("./departmentMap");
  const addArray = attribute.split('：').flatMap(e => e.split('(')).flatMap(e => e.replace(')', ''));
  const addType = addArray[0];
  const addDept = addArray[1];
  const addYear = parseInt(addArray[2]);
  const result = addArray.length === 3 ? {
    type: addType.includes('輔系') ? 'minor' : 'major',
    deptString: addDept,
    year: addYear,
    ...departmentMap[addYear][addDept]
  } : undefined;
  return result;
};

const registerHistoryParser = (attribute) => {
  const departmentMap = require("./departmentMap");

  let result = null;
  if (attribute.length > 0) {
    result = attribute.map(e => {
      const yearAndSemester = e.year.split('(')[0].split('/').map(e => parseInt(e.trim()));
      const year = yearAndSemester[0];
      const semester = yearAndSemester[1];
      const regsts = e.regsts.split(' ')[0];
      const gradename = e.gradename.split(' ')[0];

      return {
        year: year,
        semester: semester,
        regsts: regsts,
        gradename: gradename,
        ...departmentMap[year][gradename]
      }
    });
  }
  return result;
};

const creditParser = (attribute) => {
  let result = attribute;
  if (attribute.length > 0) {
    result = attribute.map(e => {
      const year = parseInt(e.year.trim());
      const semester = parseInt(e.semester.trim());
      const subNum = e.subNum;
      const subName = e.subName.trim();
      const subSel = e.subSel.trim();
      const subPnt = e.subPnt;
      const score = e.score;

      return {
        year: year,
        semester: semester,
        subNum: subNum,
        subName: subName,
        subSel: subSel,
        subPnt: subPnt,
        score: score
      }
    });
  }
  return result;
};

const addReducer = (attribute) => {
  if (!attribute) return undefined;
  return {
    main: false,
    type: attribute.type,
    dept: attribute.dept,
    group: attribute.group,
    year: attribute.year
  }
}

const registerHistoryReducer = (attribute) => {
  let notRegNum = 0;
  for (let i = 1; i <= attribute.length; i++) {
    if (attribute[attribute.length - i].regsts !== '註冊') {
      notRegNum++;
    }
    if (i === attribute.length ||
      attribute[attribute.length - i].dept !== attribute[attribute.length - i - 1].dept) {
      const regDept = attribute[attribute.length - i];
      const dept = regDept.dept;
      const group = regDept.group;
      const regNum = (i - notRegNum) + (regDept.grade - 1) * 2 - (regDept.semester - 1);
      const regYear = regDept.year - (regDept.grade - 1);
      return {
        main: true,
        type: 'major',
        dept: dept,
        group: group,
        year: regYear,
        regNum: regNum
      };
    }
  }
}

const getRequire = (register) => {
  return {
    ...register,
  };
}

const checkRequire = (require, credit, replaceCredit) => {
  credit.forEach(element => {
    
  });
  replaceCredit.forEach(element => {

  });
  return {
    ...require,
  };
};