// 引入檔案系統模組
import fs from 'fs';
// 引入jieba中文斷詞模組
import { Jieba } from '@node-rs/jieba'
// 引入buffer模組
import { Buffer } from 'buffer';
// 引入自定義的解析中文數字工具函數
import parseChineseNumbers from '../src/utils/chineseNumber.util.js';

// 定義詞典檔案的路徑
const dictPath = './data/dict.txt'
// 讀取詞典檔案並轉為Buffer，再利用Buffer初始化jieba分詞器
const jieba = Jieba.withDict(Buffer.from(fs.readFileSync(dictPath, 'utf-8'), 'utf-8'))

// 定義主要的解析函數
const parse = () => {
  // 清空output.json.local檔案
  fs.writeFileSync('./data/output.json.local', '');
  // 清空output.csv.local檔案
  fs.writeFileSync('./data/output.csv.local', '');
  // 清空output111.csv.local檔案
  fs.writeFileSync('./data/output111.csv.local', '');

  // 從result.json檔案中讀取資料並轉換成JSON物件
  const data = JSON.parse(fs.readFileSync('./data/result.json'));
  // 從groupConditionFilter.json檔案中讀取過濾規則並轉為JSON物件
  const groupConditionFilter = JSON.parse(fs.readFileSync('./data/groupConditionFilter.json'));
  // 將每個過濾條件的label與text字串轉換成正規表達式
  groupConditionFilter.forEach((item) => {
    item.label = new RegExp(item.label);
    item.text = new RegExp(item.text);
  });

  // 用來儲存最終結果的陣列
  const results = [];

  // 依年度遍歷資料
  Object.keys(data).forEach((year) => {
    // 對每一年度中的每個requireItem進行處理
    data[year] = data[year].forEach((requireItem) => {

      // const resultItem = { ...requireItem };
      // 新增一個空的結果物件
      const resultItem = {};
      // resultItem.type =  requireItem.type;
      // resultItem.year =  requireItem.year;
      // resultItem.departmentID =  requireItem.departmentID;
      // resultItem.groupID = requireItem.groupID;
      // resultItem.departmentName =  requireItem.departmentName;
      // resultItem.groupName = requireItem.groupName;
      // resultItem.requireCredit = requireItem.requireCredit;
      // resultItem.minTotalCredit =  requireItem.minTotalCredit;
      // 將原始的群組條件保存到結果物件中
      resultItem.groupCondition = requireItem.groupCondition;
      // resultItem.spacialty = requireItem.spacialty;
      // resultItem.rules = requireItem.rules;

      // 從requireItem.groupCondition陣列中取出從第3個元素開始的部分，過濾掉值為'無'的元素，
      // 並利用reduce處理將每個項目解析成一個新的物件，保存在parsedGroupConditions屬性中
      resultItem.parsedGroupConditions = requireItem.groupCondition.slice(2)
        .filter((text) => text !== '無')
        .reduce((acc, item) => {
          // 初始化標籤與文字，並設置忽略、串接以及多重條件的旗標
          let label = item, text = item, ignore = false, concat = false, multicondition = false;

          // 使用groupConditionFilter陣列，檢查當前項目是否符合任何的篩選條件
          const isConditionMatched = groupConditionFilter.some((filter) => {
            // 如果當前項目與filter的label不匹配則返回false
            if (!item.match(filter.label)) return false;
            // 若filter要求忽略則設定ignore為true，並返回true
            if (filter.ignore) return (ignore = true);
            // 若要求串接則設定concat為true，並將當前文字與上一筆累加結果串接起來
            if (filter.concat) return (concat = true, acc[acc.length - 1].text += ` ${text}`);
            // 若filter設定為多重條件則標記multicondition為true
            if (filter.multicondition) multicondition = true;
            // 用正規表達式替換後取出標籤
            label = item.replace(filter.label, '$1');
            // 若替換後的標籤不是單一字母，則根據累加陣列長度產生字母（A~Z）
            if (!label.match(/^[A-Za-z]$/)) {
              label = String.fromCharCode((acc.length % 26) + 65);
            }
            // 將文字部分依據filter.text的正規表達式過濾掉匹配的內容
            text = item.replace(filter.text, '');
            return true;
          });

          // 移除文字內的多餘空格
          text = text.replace(/ +/g, '');

          // 若沒有任何匹配的條件，則把該文字直接追加到output.csv.local中，並跳過此項目
          if (!isConditionMatched) {
            fs.appendFileSync('./data/output.csv.local', `${text}\n`);
            return acc;
          }

          // 若沒有串接操作則進行正常的處理
          if (!concat) {
            // 如果設定忽略或多重條件，或累加中已經存在相同標籤，則將標籤設為'*'
            if (ignore || multicondition || acc.find((entry) => entry.label === label)) label = '*';
            // 將該解析結果（標籤與文字）加入累加陣列中
            acc.push({ label, text });
          }
          // 返回累加器
          return acc;
        }, []);

      // 針對解析後的每個群組條件進一步處理
      resultItem.parsedGroupConditions.forEach((parsedGroupCondition) => {
        // 利用自定義函數解析中文數字，並將結果存入aaa屬性中
        parsedGroupCondition.aaa = parseChineseNumbers(parsedGroupCondition.text)
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.aaa} [${requireItem.year}-${requireItem.departmentName}${requireItem.groupName.length > 0 ? ':' + requireItem.groupName : ''}]\n`);
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.text}\n`);
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.aaa}\n`);
        // 將解析後的中文數字結果追加到output.csv.local檔案中
        fs.appendFileSync('./data/output.csv.local', `${parsedGroupCondition.aaa}\n`);
        // const pp = new RegExp('([0-9]+(?:學分)*)([門科目組軌課程])*', 'g');
        // const qq = new RegExp('([選擇中至少必修]+(?=\\[))', 'g');
        // parsedGroupCondition.xxx = parsedGroupCondition.aaa.replace(pp, '[$1]').replace(qq, '[->]');
        // fs.appendFileSync('./data/output.csv.local', `${parsedGroupCondition.xxx}\n`);
        // const zz = new RegExp('([0-9]+(?:[門科]*|學分*).*(?:[選擇修習至少]|選擇|修習|至少)[0-9]+(?:[門科]*|學分*))', 'g');
        // parsedGroupCondition.bbb = parsedGroupCondition.aaa.split(zz).filter((item) => item.match(zz));
        // fs.appendFileSync('./data/output.csv.local', `[${parsedGroupCondition.label}]: ${parsedGroupCondition.bbb}\n`);
      });

      // 以下原有被註解的程式碼，請勿移除
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

      // 將處理後的結果物件加入results陣列
      results.push(resultItem);
    });
  });

  // 讀取output.csv.local檔案，將每行資料去除重複後逐行追加至output111.csv.local中
  [...new Set(fs.readFileSync('./data/output.csv.local').toString().split('\n'))].forEach((item) => {
    fs.appendFileSync('./data/output111.csv.local', `${item}\n`);

    // 使用jieba分詞工具將每行文字分詞
    const segmentedWords = jieba.cut(item);
    // 定義正規表達式：數字匹配
    const numericRegex = /^[0-9]+$/;
    // 定義正規表達式：必修課相關關鍵字匹配
    const mandatoryCoursesRegex = /^[挑選擇必修讀習]+$/;
    // 定義正規表達式：課程數相關關鍵字匹配
    const courseCountRegex = /^[門科目學群組軌]+$/;
    // 定義正規表達式：學分相關關鍵字匹配
    const creditCountRegex = /^學分+$/;

    // 過濾分詞結果：根據相鄰的分詞項目關係篩選出有意義的片段
    const filteredSegments = segmentedWords.filter((item, idx, arr) => {
      const prev = arr[idx - 1];
      const next = arr[idx + 1];
      return (
        (next && numericRegex.test(next) && mandatoryCoursesRegex.test(item)) ||
        numericRegex.test(item) ||
        (prev && numericRegex.test(prev) && (courseCountRegex.test(item) || creditCountRegex.test(item)))
      );
    }).reduce((acc, item) => {
      // 取得累加器中的最後一個片段陣列
      const last = acc[acc.length - 1];
      // 若當前項目為數字，根據上一段是否以必修關鍵字結尾決定合併或新建陣列
      if (numericRegex.test(item)) {
        if (last && last.length && mandatoryCoursesRegex.test(last[last.length - 1])) {
          last.push(item);
        } else {
          acc.push([item]);
        }
      } else if (mandatoryCoursesRegex.test(item)) {
        // 當項目符合必修關鍵字時，依據上一段內容判斷該項目是否要合併至上一段
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
        // 當項目符合課程數或學分的匹配，則直接將其加入最後一段
        last.push(item);
      }
      return acc;
    }, []);

    // 計算包含學分資訊的片段群組數量
    const creditGroupCount = filteredSegments.filter(item => item.some(e => creditCountRegex.test(e))).length;
    // 計算包含必修課資訊的片段群組數量
    const mandatoryGroupCount = filteredSegments.filter(item => item.some(e => mandatoryCoursesRegex.test(e))).length;
    // 將分組的片段根據必修課、學分或課程數資訊進行重組，整理出更具結構的片段群組
    const filteredCourseSegments = filteredSegments.reduce((acc, item) => {
      if (item.some(e => mandatoryCoursesRegex.test(e))) {
        // 當包含必修課關鍵字時，從該關鍵字開始的片段作為一組
        acc.push([item.slice(item.findIndex(e => mandatoryCoursesRegex.test(e)))]);
      } else if (item.some(e => creditCountRegex.test(e)) && creditGroupCount <= 1) {
        // 當包含學分關鍵字且學分群組只出現一次時，合併該片段至上一組
        const last = acc[acc.length - 1];
        last && last[last.length - 1].some(e => mandatoryCoursesRegex.test(e))
          ? last.push(item)
          : acc.push([item]);
      } else if (item.some(e => courseCountRegex.test(e)) && mandatoryGroupCount === 0) {
        // 當包含課程數關鍵字且沒有必修課群組時，將該片段新建一組
        acc.push([item]);
      }
      return acc;
    }, []);

    fs.appendFileSync('./data/output111.csv.local', `${segmentedWords}\n`);
    fs.appendFileSync('./data/output111.csv.local', `${filteredCourseSegments.map(e1 => e1.map(e2 => e2.join(' ')).join('; ')).join('\n')}\n`);

    // 對整理後的片段群組進一步解析，計算每組的最小學分與課程數量
    const zzz = filteredCourseSegments.map(segmentGroup => {
      const result = {
        requiredCredit: -1,
        requiredCourseCount: -1,
        requiredruleCount: -1,
        ignorable: false,
        rules: [{
          ['$ref']: {}
        }]
      };
      segmentGroup.forEach(tokens => {
        // 找出tokens中第一個符合數字的項目索引
        const idx = tokens.findIndex(item => numericRegex.test(item));
        if (idx === -1) return;
        // 將該數字轉換為整數
        const number = parseInt(tokens[idx]);
        // 若該數字位於tokens結尾或下一項為課程數關鍵字，則認定為課程數
        if (idx === tokens.length - 1 || (idx + 1 < tokens.length && courseCountRegex.test(tokens[idx + 1]))) {
          result.requiredCourseCount = number;
        }
        // 若下一項為學分關鍵字，則認定為最小學分數
        if (idx + 1 < tokens.length && creditCountRegex.test(tokens[idx + 1])) {
          result.requiredCredit = number;
        }
      });
      return result;
    });

    // 將每組解析結果以JSON字串格式寫入output111.csv.local，並換行分隔
    fs.appendFileSync('./data/output111.csv.local', `${JSON.stringify(zzz)}\n`);
    fs.appendFileSync('./data/output111.csv.local', `\n`);
  });

  // 將最終結果物件以格式化的JSON寫入output.json.local檔案中
  fs.appendFileSync('./data/output.json.local', `${JSON.stringify(results, null, 2)}\n`);

  // 回傳原始讀取的資料
  return data;
};

// 將parse函數作為預設匯出模組
export default parse;
