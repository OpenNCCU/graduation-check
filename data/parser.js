import fs from 'fs';

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  // fs.writeFileSync('./data/output.csv.local', `"${'result.PErequire'}","${'result.NDrequire'}"\n`);
  fs.writeFileSync('./data/output.csv.local', '');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));

  Object.keys(data).forEach((year) => {
    data[year] = data[year].map((require) => {
      const result = {};

      result.PErequire = require.spacialty.find((text) => text.match(/(體育).*(選修)*/));
      if (!result.PErequire) {
        result.PErequire = require.groupCondition.find((text) => text.match(/(體育).*(選修)*/));
      }

      result.NDrequire = require.spacialty.find((text) => text.match(/國防|軍訓/));
      if (!result.NDrequire) {
        result.NDrequire = require.groupCondition.find((text) => text.match(/國防|軍訓/));
      }

      if (!result.PErequire || !result.NDrequire) {
        // result.year = require.year;
        // result.departmentName = require.departmentName;
        // result.groupName = require.groupName;
      } else {
        result.PErequire = result.PErequire
          .replace(/^\(?[0-9一二三四五六七八九十][).、]|^※|^\(|\)$|。$/, '')
          .replace('全民國防教育軍事訓練', '軍訓');
        result.NDrequire = result.NDrequire
          .replace(/^\(?[0-9一二三四五六七八九十][).、]|^※|^\(|\)$|。$/, '')
          .replace('全民國防教育軍事訓練', '軍訓');
        // result.PEequalsND = result.PErequire === result.NDrequire;
        fs.appendFileSync('./data/output.csv.local', `"${result.PErequire}"\n"${result.NDrequire}"\n`);
      }

      // fs.appendFileSync('./data/output.json.local', `${JSON.stringify(result, null, 2)}\n`);
      return require;
    });
  });

  return data;
};

export default parse;
