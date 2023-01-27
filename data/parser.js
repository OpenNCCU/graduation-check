import fs from 'fs';

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  // fs.writeFileSync('./data/output.csv.local', '');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));

  const results = [];

  Object.keys(data).forEach((year) => {
    data[year] = data[year].forEach((requireItem) => {
      const resultItem = {};

      // resultItem.year = requireItem.year;
      // resultItem.departmentName = requireItem.departmentName;
      // resultItem.groupName = requireItem.groupName;

      // resultItem.aa = requireItem.groupCondition; // .findIndex((text) => text === '群修條件說明:') === 1;

      /* */
      resultItem.groupCondition = requireItem.groupCondition;
      // resultItem.groups_1 = requireItem.groupCondition.slice(0, 1);
      resultItem.groups_2 = requireItem.groupCondition.slice(2)
        .filter((text) => text !== '無')
        .map((text, i) => {
          if (text.match(/^群[A-Za-z].*/)
            || i >= requireItem.rules.filter((rule) => rule.group.length > 0).length) {
            return text;
          }
          return `群${[...'ABCDEFG'][i]}：${text}`;
        });

      // if (resultItem.groups_2.filter((text) => !text.match(/^群[A-Za-z].*/)).length > 0) {
      //   resultItem.year = requireItem.year;
      //   resultItem.departmentName = requireItem.departmentName;
      //   resultItem.groupName = requireItem.groupName;
      //   resultItem.conditionLength = resultItem.groups_2.length;
      //   resultItem.rulesLength = requireItem.rules.filter((rule) => rule.group.length > 0).length;
      //   resultItem.aa = resultItem.conditionLength === resultItem.rulesLength;
      // }

      // if (results.findIndex((r) => JSON.stringify(r) === JSON.stringify(resultItem)) === -1) {
      // results.push(resultItem);
      // }

      /* */

      // fs.appendFileSync('./data/output.json.local', `${JSON.stringify(resultItem, null, 2)}\n`);
      // resultItem.groupConditionLength = resultItem.groups.length;
      // resultItem.groupRuleLength = requireItem.rules.filter((rule) => rule.group.length > 0).length;

      /* */

      results.push(resultItem);
    });
  });
  fs.appendFileSync('./data/output.json.local', `${JSON.stringify(results, null, 2)}\n`);

  return data;
};

export default parse;
