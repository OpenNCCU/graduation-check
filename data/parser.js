import fs from 'fs';

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  // fs.writeFileSync('./data/output.csv.local', '');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));
  const groupConditionFilter = JSON.parse(fs.readFileSync('./data/groupConditionFilter.json'));
  groupConditionFilter.forEach((item) => {
    item.label = new RegExp(item.label);
    item.text = new RegExp(item.text);
  });

  const results = [];

  Object.keys(data).forEach((year) => {
    data[year] = data[year].forEach((requireItem) => {

      const resultItem = { ...requireItem };

      // const resultItem = {};
      // resultItem.type =  requireItem.type;
      // resultItem.year =  requireItem.year;
      // resultItem.departmentID =  requireItem.departmentID;
      // resultItem.groupID = requireItem.groupID;
      // resultItem.departmentName =  requireItem.departmentName;
      // resultItem.groupName = requireItem.groupName;
      // resultItem.requireCredit = requireItem.requireCredit;
      // resultItem.minTotalCredit =  requireItem.minTotalCredit;
      // resultItem.groupCondition =  requireItem.groupCondition;
      // resultItem.spacialty = requireItem.spacialty;
      // resultItem.rules = requireItem.rules;

      resultItem.parsedGroupConditions = requireItem.groupCondition.slice(2)
        .filter((text) => text !== '無')
        .reduce((acc, item) => {
          let label = item, text = item, ignore = false, concat = false, multicondition = false;

          const isConditionMatched = groupConditionFilter.some((filter) => {
            if (!item.match(filter.label)) return false;
            if (filter.ignore) return (ignore = true);
            if (filter.concat) return (concat = true, acc[acc.length - 1].text += ` ${text}`);
            if (filter.multicondition) multicondition = true;
            label = item.replace(filter.label, '$1');
            if (!label.match(/^[A-Za-z]$/)) {
              label = String.fromCharCode((acc.length % 26) + 65);
            }
            text = item.replace(filter.text, '');
            return true;
          });

          if (!isConditionMatched) {
            fs.appendFileSync('./data/output.csv.local', `${text}\n`);
            return acc;
          }

          if (!concat) {
            if (ignore || multicondition || acc.find((entry) => entry.label === label)) label = '*';
            acc.push({ label, text });
          }
          return acc;
        }, []);


      resultItem.parsedGroupConditions.forEach((parsedGroupCondition) => {
        resultItem.rules
          .filter((rule) => rule.group.includes(parsedGroupCondition.label))
          .forEach((rule) => {
            rule.description = parsedGroupCondition.text;
          });
      });

      // fs.appendFileSync('./data/output.csv.local', `[${requireItem.year}-${requireItem.departmentName}${requireItem.groupName.length > 0 ? ':' + requireItem.groupName : ''}]\n`);
      // resultItem.parsedGroupConditions.forEach(({ label, text }) => {
      //   fs.appendFileSync('./data/output.csv.local', `[${label}]: ${text} [${requireItem.year}-${requireItem.departmentName}${requireItem.groupName.length > 0 ? ':' + requireItem.groupName : ''}]\n`);
      // });

      results.push(resultItem);
    });
  });
  fs.appendFileSync('./data/output.json.local', `${JSON.stringify(results, null, 2)}\n`);

  return data;
};

export default parse;
