import fs from 'fs';

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  // fs.writeFileSync('./data/output.csv.local', `"${'result.PErequire'}","${'result.NDrequire'}"\n`);
  // fs.writeFileSync('./data/output.csv.local', '');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));

  const results = [];

  Object.keys(data).forEach((year) => {
    data[year] = data[year].map((requireItem) => {
      const resultItem = {};

      // resultItem.year = requireItem.year;
      // resultItem.departmentName = requireItem.departmentName;
      // resultItem.groupName = requireItem.groupName;

      let { groupCondition } = requireItem;
      groupCondition = groupCondition.reduce((acc, cur, i) => {
        if (i > 0 && i < requireItem.groupCondition.findIndex((text) => text === '群修條件說明:')) {
          return [`${acc[0]} ${cur}`];
        }
        return [...acc, cur];
      }, []);
      // resultItem.groupCondition = groupCondition;
      // resultItem.groups_1 = groupCondition.slice(0, 1);
      resultItem.groups_2 = groupCondition.slice(2)
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

      if (results.findIndex((r) => JSON.stringify(r) === JSON.stringify(resultItem)) === -1) {
        results.push(resultItem);
      }
      //   fs.appendFileSync('./data/output.json.local', `${JSON.stringify(resultItem, null, 2)}\n`);
      // result.groupConditionLength = result.groups.length;
      // result.groupRuleLength = require.rules.filter((rule) => rule.group.length > 0).length;

      /* */

      // result.PErequire = require.spacialty.find((text) => text.match(/(體育)(?!必修).*(選修)*/));
      // if (!result.PErequire) {
      //   result.PErequire = require.groupCondition.find((text) => text.match(/(體育)(?!必修).*(選修)*/));
      // }

      // result.NDrequire = require.spacialty.find((text) => text.match(/國防|軍訓/));
      // if (!result.NDrequire) {
      //   result.NDrequire = require.groupCondition.find((text) => text.match(/國防|軍訓/));
      // }

      // if (!result.PErequire || !result.NDrequire) {
      //   // result.year = require.year;
      //   // result.departmentName = require.departmentName;
      //   // result.groupName = require.groupName;
      // } else {
      //   result.PErequire = result.PErequire
      //     .replaceAll(/^\(?[0-9一二三四五六七八九十][).、]|^※|^\(|\)$|。$/g, '')
      //     .replaceAll('全民國防教育軍事訓練', '軍訓');
      //   result.NDrequire = result.NDrequire
      //     .replaceAll(/^\(?[0-9一二三四五六七八九十][).、]|^※|^\(|\)$|。$/g, '')
      //     .replaceAll('全民國防教育軍事訓練', '軍訓');
      // }

      // fs.appendFileSync('./data/output.json.local', `${JSON.stringify(result, null, 2)}\n`);
      return requireItem;
    });
  });
  fs.appendFileSync('./data/output.json.local', `${JSON.stringify(results, null, 2)}\n`);

  return data;
};

export default parse;
