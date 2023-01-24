import fs from 'fs';
import { isArray } from 'util';
// import requiredSource from './requiredSource_test.js';

// const read = () => {
//   const input = fs.readFileSync('./data/result.json');
//   const data = JSON.parse(input);
//   const result = {};
//   data.forEach((d) => {
//     d.children.forEach((g) => {
//       g.children.forEach((y) => {
//         if (!result[y.year]) {
//           result[y.year] = [];
//         }
//         result[y.year].push({
//           dept: d.department_id,
//           group: g.group_id,
//           ...y,
//         });
//       });
//     });
//   });
//   fs.writeFileSync('./data/result1.json', JSON.stringify(result, null, 2));
// };

const parse = () => {
  const data = JSON.parse(fs.readFileSync('./data/requiredSource.json'));
  // read();
  // const data = { ...requiredSource };
  Object.keys(data).forEach((year) => {
    data[year] = data[year].map((item) => {
      const require = {};
      // require = {
      //   type: 'major',
      //   deptID: item.dept,
      //   group: item.group,
      //   year: item.year,
      // };

      require.group_condition = item.group_condition;
      let unbreakFlag = false;
      require.group_condition_d = require.group_condition.reduce((acc, text) => {
        let newArr = [];
        if (Array.isArray(acc)) {
          newArr = [...acc];
        } else {
          newArr = [acc];
        }
        if (!unbreakFlag) {
          newArr.push(text);
        } else {
          newArr[newArr.length - 1] = `${newArr[newArr.length - 1]}：${text}`;
          unbreakFlag = false;
        }
        if (text.match(/^群[A-Za-z]$/)) {
          unbreakFlag = true;
        }
        return newArr;
      });
      require.group_condition_r = item.group_condition.map((text) => text
        .replaceAll(/一/g, '1')
        .replaceAll(/二/g, '2')
        .replaceAll(/兩/g, '2')
        .replaceAll(/三/g, '3')
        .replaceAll(/四/g, '4')
        .replaceAll(/五/g, '5')
        .replaceAll(/六/g, '6')
        .replaceAll(/七/g, '7')
        .replaceAll(/八/g, '8')
        .replaceAll(/九/g, '9')
        .replaceAll(/十/g, '10')
        .replaceAll(/十一/g, '11')
        .replaceAll(/十二/g, '12')
        .replaceAll(/十三/g, '13')
        .replaceAll(/十四/g, '14')
        .replaceAll(/十五/g, '15'));
      // require.group_condition_edit = item.group_condition.filter((text) => text.match(/.*群[A-Za-z].+/));
      // require.PErequire = item.spacialty.find((text) => text.match(/(體育).*(選修)*/));
      // require.NDrequire = item.spacialty.find((text) => text.match(/國防|軍訓/));
      // if (!require.PErequire || !require.NDrequire) {
      //   require.spacialty = item.spacialty;
      // }
      return require;

      // require.departmentName = item.department_name;
      // require.groupName = item.group_name;

      require.requireCredit = item.credit;
      require.minTotalCredit = item.group_condition
        .find((text) => text.match(/本[系]*[學程]*[取得學位]*最低[畢業總]*學分數：/))
        .replace(/.*本[系]*[學程]*[取得學位]*最低[畢業總]*學分數：(\d+)學分.*/, '$1');

      require.minTotalCredit = parseInt(require.minTotalCredit, 10);
      // require.group_condition = item.group_condition;
      // require.spacialty = item.spacialty;
      // require.PErequire = item.spacialty.find((text) => text.match(/(體育).*(選修)*/));
      // require.NDrequire = item.spacialty.find((text) => text.match(/國防|軍訓/));

      require.rules = [];
      item.children.forEach((ruleBase) => {
        let constraint;
        if (ruleBase['須修本門課之科目代碼'] !== '無') {
          constraint = ruleBase['須修本門課之科目代碼'];
        }
        if (ruleBase['須修本門課之科目代碼'] === '無' && ruleBase['認定方式'] !== '不限') {
          switch (ruleBase['認定方式']) {
            case '需為本系開課':
              constraint = item.dept.substring(0, 3);
              break;
            case '需為本院開課':
              constraint = item.dept.substring(0, 1);
              break;
            default:
              break;
          }
        }
        let group;
        if (ruleBase['修別'].replace(/必修|群([A-Z])/, '$1').length > 0) {
          group = ruleBase['修別'].replace(/必修|群([A-Z])/, '$1');
        }
        // const minEqualsMax = ruleBase['規定學分'].includes('-') ? false : undefined;
        const rule = {
          group,
          minCredit: parseInt(ruleBase['規定學分'].replace(/(\d+)-(\d+)/, '$1'), 10),
          maxCredit: parseInt(ruleBase['規定學分'].replace(/(\d+)-(\d+)/, '$2'), 10),
          semesterCount: parseInt(ruleBase['學期數'], 10),
          courseCount: group ? ruleBase['備註(先修科目說明)'] : 1,
          note: ruleBase['備註(先修科目說明)'],
          subjects: [],
        };
        const subject = {
          name: ruleBase['科目名稱'],
          semester: [ruleBase['第一學年上'], ruleBase['第一學年下'], ruleBase['第二學年上'], ruleBase['第二學年下'], ruleBase['第三學年上'], ruleBase['第三學年下'], ruleBase['第四學年上'], ruleBase['第四學年下']].map((e) => e !== '無'),
          constraint,
        };
        if (!group || require.rules.length - 1 <= 0) {
          rule.subjects.push(subject);
          require.rules.push(rule);
        } else {
          const lastRule = require.rules[require.rules.length - 1];
          if (JSON.stringify({
            group: lastRule.group,
            maxCredit: lastRule.maxCredit,
            minCredit: lastRule.minCredit,
            semCount: lastRule.semCount,
            note: lastRule.note,
          })
            === JSON.stringify({
              group: rule.group,
              maxCredit: rule.maxCredit,
              minCredit: rule.minCredit,
              semCount: rule.semCount,
              note: rule.note,
            })) {
            lastRule.subjects.push(subject);
            return;
          }
          rule.subjects.push(subject);
          require.rules.push(rule);
        }
      });
      return require;
    });

    fs.writeFileSync('./data/test.json.local', JSON.stringify(data, null, 2));
  });
  return data;
};

export default parse;
