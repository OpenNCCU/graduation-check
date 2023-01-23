import fs from 'fs';
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
      const require = {
        type: 'major',
        deptID: item.dept,
        group: item.group,
        year: item.year,
      };

      // require.departmentName = item.department_name;
      // require.groupName = item.group_name;

      require.requireCredit = item.credit;
      require.minTotalCredit = item.group_condition
        .find((text) => text.includes('本系最低畢業總學分數：'))
        .replace(/.*本系最低畢業總學分數：(\d+)學分.*/, '$1');
      console.log(require.minTotalCredit);

      require.minTotalCredit = parseInt(require.minTotalCredit, 10);
      // require.group_condition = item.group_condition;
      // require.spacialty = item.spacialty;
      require.PErequire = item.spacialty.find((text) => text.match(/(體育).*(選修)/));
      require.NDrequire = item.spacialty.find((text) => text.match(/國防/));

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
        const rule = {
          group,
          minCredit: parseInt(ruleBase['規定學分'], 10),
          maxCredit: parseInt(ruleBase['規定學分'], 10),
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
            // maxCredit: lastRule.maxCredit,
            // minCredit: lastRule.minCredit,
            // semCount: lastRule.semCount,
            // note: lastRule.note,
          })
            === JSON.stringify({
              group: rule.group,
              // maxCredit: rule.maxCredit,
              // minCredit: rule.minCredit,
              // semCount: rule.semCount,
              // note: rule.note,
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
