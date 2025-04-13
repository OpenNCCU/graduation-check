import fs from 'fs';
import { Jieba } from '@node-rs/jieba'
import { Buffer } from 'buffer';
import parseChineseNumbers from '../src/utils/chineseNumber.util.js';

const dictPath = './data/dict.txt'
const jieba = Jieba.withDict(Buffer.from(fs.readFileSync(dictPath, 'utf-8'), 'utf-8'))

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  fs.writeFileSync('./data/output.csv.local', '');
  fs.writeFileSync('./data/output111.csv.local', '');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));
  const groupConditionFilter = JSON.parse(fs.readFileSync('./data/groupConditionFilter.json'));
  groupConditionFilter.forEach((item) => {
    item.label = new RegExp(item.label);
    item.text = new RegExp(item.text);
  });

  const results = [];

  Object.keys(data).forEach((year) => {
    data[year] = data[year].forEach((requireItem) => {

      // const resultItem = { ...requireItem };

      const resultItem = {};
      // resultItem.type =  requireItem.type;
      // resultItem.year =  requireItem.year;
      // resultItem.departmentID =  requireItem.departmentID;
      // resultItem.groupID = requireItem.groupID;
      // resultItem.departmentName =  requireItem.departmentName;
      // resultItem.groupName = requireItem.groupName;
      // resultItem.requireCredit = requireItem.requireCredit;
      // resultItem.minTotalCredit =  requireItem.minTotalCredit;
      resultItem.groupCondition = requireItem.groupCondition;
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

          text = text.replace(/ +/g, '');

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
        parsedGroupCondition.aaa = parseChineseNumbers(parsedGroupCondition.text)
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.aaa} [${requireItem.year}-${requireItem.departmentName}${requireItem.groupName.length > 0 ? ':' + requireItem.groupName : ''}]\n`);
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.text}\n`);
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.aaa}\n`);
        fs.appendFileSync('./data/output.csv.local', `${parsedGroupCondition.aaa}\n`);
        // const pp = new RegExp('([0-9]+(?:學分)*)([門科目組軌課程])*', 'g');
        // const qq = new RegExp('([選擇中至少必修]+(?=\\[))', 'g');
        // parsedGroupCondition.xxx = parsedGroupCondition.aaa.replace(pp, '[$1]').replace(qq, '[->]');
        // fs.appendFileSync('./data/output.csv.local', `${parsedGroupCondition.xxx}\n`);
        // const zz = new RegExp('([0-9]+(?:[門科]*|學分*).*(?:[選擇修習至少]|選擇|修習|至少)[0-9]+(?:[門科]*|學分*))', 'g');
        // parsedGroupCondition.bbb = parsedGroupCondition.aaa.split(zz).filter((item) => item.match(zz));
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.bbb}\n`);
      });

      // resultItem.parsedGroupConditions.forEach((parsedGroupCondition) => {
      //   resultItem.rules
      //     .filter((rule) => rule.group.includes(parsedGroupCondition.label))
      //     .forEach((rule) => {
      //       rule.description = parsedGroupCondition.text;
      //     });
      // });

      // fs.appendFileSync('./data/output.csv.local', `[${requireItem.year}-${requireItem.departmentName}${requireItem.groupName.length > 0 ? ':' + requireItem.groupName : ''}]\n`);
      // resultItem.parsedGroupConditions.forEach(({ label, text }) => {
      //   fs.appendFileSync('./data/output.csv.local', `[${label}]: ${text} [${requireItem.year}-${requireItem.departmentName}${requireItem.groupName.length > 0 ? ':' + requireItem.groupName : ''}]\n`);
      // });

      results.push(resultItem);
    });
  });

  [...new Set(fs.readFileSync('./data/output.csv.local').toString().split('\n'))].forEach((item) => {
    fs.appendFileSync('./data/output111.csv.local', `${item}\n`);

    const segmentedWords = jieba.cut(item);
    // fs.appendFileSync('./data/output111.csv.local', `${ddd.join(' ')}\n`);

    const numericRegex = /^[0-9]+$/;
    const mandatoryCoursesRegex = /^[挑選擇必修讀習]+$/;
    const courseCountRegex = /^[門科目學群組軌]+$/;
    const creditCountRegex = /^學分+$/;

    const filteredSegments = segmentedWords.filter((item, idx, arr) => {
      const prev = arr[idx - 1];
      const next = arr[idx + 1];
      return (
        (next && numericRegex.test(next) && mandatoryCoursesRegex.test(item)) ||
        numericRegex.test(item) ||
        (prev && numericRegex.test(prev) && (courseCountRegex.test(item) || creditCountRegex.test(item)))
      );
    }).reduce((acc, item) => {
      const last = acc[acc.length - 1];
      if (numericRegex.test(item)) {
        if (last && last.length && mandatoryCoursesRegex.test(last[last.length - 1])) {
          last.push(item);
        } else {
          acc.push([item]);
        }
      } else if (mandatoryCoursesRegex.test(item)) {
        if (
          last &&
          last.length &&
          !last.some(e => mandatoryCoursesRegex.test(e)) &&
          (numericRegex.test(last[last.length - 1]) || (courseCountRegex.test(item) || creditCountRegex.test(item)))
        ) {
          last.push(item);
        } else {
          acc.push([item]);
        }
      } else if ((courseCountRegex.test(item) || creditCountRegex.test(item)) && last) {
        last.push(item);
      }
      return acc;
    }, []);

    const creditGroupCount = filteredSegments.filter(item => item.some(e => creditCountRegex.test(e))).length;
    const mandatoryGroupCount = filteredSegments.filter(item => item.some(e => mandatoryCoursesRegex.test(e))).length;
    const filteredCourseSegments = filteredSegments.reduce((acc, item) => {
      if (item.some(e => mandatoryCoursesRegex.test(e))) {
        acc.push([item.slice(item.findIndex(e => mandatoryCoursesRegex.test(e)))]);
      } else if (item.some(e => creditCountRegex.test(e)) && creditGroupCount <= 1) {
        const last = acc[acc.length - 1];
        last && last[last.length - 1].some(e => mandatoryCoursesRegex.test(e))
          ? last.push(item)
          : acc.push([item]);
      } else if (item.some(e => courseCountRegex.test(e)) && mandatoryGroupCount === 0) {
        acc.push([item]);
      }
      return acc;
    }, []);

    // fs.appendFileSync('./data/output111.csv.local', `${filteredCourseSegments.map(e1 => e1.map(e2 => e2.join(' ')).join('; ')).join('\n')}\n`);

    const zzz = filteredCourseSegments.map(segmentGroup => {
      const result = { minCredit: -1, courseCount: -1 };
      segmentGroup.forEach(tokens => {
        const idx = tokens.findIndex(item => numericRegex.test(item));
        if (idx === -1) return;
        const number = parseInt(tokens[idx]);
        if (idx === tokens.length - 1 || (idx + 1 < tokens.length && courseCountRegex.test(tokens[idx + 1]))) {
          result.courseCount = number;
        }
        if (idx + 1 < tokens.length && creditCountRegex.test(tokens[idx + 1])) {
          result.minCredit = number;
        }
      });
      return result;
    });

    fs.appendFileSync('./data/output111.csv.local', `${JSON.stringify(zzz)}\n`);
    fs.appendFileSync('./data/output111.csv.local', `\n`);
  });

  fs.appendFileSync('./data/output.json.local', `${JSON.stringify(results, null, 2)}\n`);

  return data;
};

export default parse;
