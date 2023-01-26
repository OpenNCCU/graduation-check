import fs from 'fs';

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  // fs.writeFileSync('./data/output.csv.local', `"${'result.PErequire'}","${'result.NDrequire'}"\n`);
  // fs.writeFileSync('./data/output.csv.local', '');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));

  Object.keys(data).forEach((year) => {
    data[year] = data[year].map((require) => {
      const result = {};

      // result.groupCondition = require.groupCondition;
      require.groupCondition.find((text, idx) => {
        if (text === '群修條件說明:') {
          result.groups = require.groupCondition.slice(idx + 1).filter((t) => t !== '無');
          return true;
        }
        return false;
      });
      result.groupLength = result.groups.length;

      result.gl2 = require.rules.filter((rule) => rule.group.length > 0).length;
      if (result.gl2 > result.groupLength) {
        // result.max = 'gl2';
        // result.ruleGroup = require.rules.filter((rule) => rule.group.length > 0);
        if (result.groupLength === 0) {
          result.year = require.year;
          result.departmentName = require.departmentName;
          result.groupName = require.groupName;
          // fs.appendFileSync('./data/output.json.local', `${JSON.stringify(result, null, 2)}\n`);
          fs.appendFileSync('./data/output.json.local', `${result.year}-${result.departmentName}\n`);
        }
      }
      if (result.gl2 < result.groupLength) {
        result.max = 'groupLength';
      }
      if (result.gl2 === result.groupLength) {
        result.max = 'equal';
      }
      // result.eq = result.groupLength === result.gl2;

      // console.log(require.groupCondition);
      // result.minTotalCredit1 = require.groupCondition
      //   .find((text) => text.match(/本[系]*[學程]*[取得學位]*最低[畢業總]*學分數：/))
      //   .replace(/.*本[系]*[學程]*[取得學位]*最低[畢業總]*學分數：(\d+)學分.*/, '$1');
      // result.minTotalCredit2 = [require.groupCondition[0]]
      //   .find((text) => text.match(/本[系]*[學程]*[取得學位]*最低[畢業總]*學分數：/))
      //   .replace(/.*本[系]*[學程]*[取得學位]*最低[畢業總]*學分數：(\d+)學分.*/, '$1');
      // result.equal = result.minTotalCredit1 === result.minTotalCredit2;

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
      return require;
    });
  });

  return data;
};

export default parse;
