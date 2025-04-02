import fs from 'fs';

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  fs.writeFileSync('./data/output.csv.local', '');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));
  const groupConditionFilter = JSON.parse(fs.readFileSync('./data/groupConditionFilter.json'));
  groupConditionFilter.forEach((item) => {
    item.label = new RegExp(item.label);
    item.text = new RegExp(item.text);
  });

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

      // requireItem.groupCondition.slice(2)
      //   .filter((text) => text !== '無').forEach((text) => {
      //     const match = groupConditionFilter.find((filter) => {
      //       return text.match(filter.label)
      //     });
      //     if (match) {
      //       return;
      //     }
      //     fs.appendFileSync('./data/output.csv.local', `${text}\n`);
      //   });

      resultItem.groupResult = [];
      requireItem.groupCondition.slice(2)
        .filter((text) => text !== '無')
        .forEach((item) => {
          let label = item;
          let text = item;
          let concat = false;
          let multicondition = false;
          let ignore = false;
          groupConditionFilter.forEach((filter) => {
            if (item.match(filter.label)) {
              if (filter.ignore) {
                ignore = true;
                return;
              }
              if (filter.concat) {
                concat = true;
                resultItem.groupResult[resultItem.groupResult.length - 1].text += ` ${text}`;
                return;
              }
              if (filter.multicondition) {
                multicondition = true;
              }
              if (filter.autoprefix) {
                label = String.fromCharCode((resultItem.groupResult.length % 26) + 65);
                text = item.replace(filter.text, '');
                return;
              }
              label = item.replace(filter.label, '$1');
              text = item.replace(filter.text, '');
              return;
            }
          });
          if (ignore) {
            return;
          }
          if (!concat) {
            if (resultItem.groupResult.find((text) => text.label === label)) {
              label = '*';
              text = item;
            }
            if (multicondition) {
              label = '*';
            }
            resultItem.groupResult = [...resultItem.groupResult, { label, text }];
          }
        });
        // fs.appendFileSync('./data/output.csv.local', `[${label}]: ${text}\n`);

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
