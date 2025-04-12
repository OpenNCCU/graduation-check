export const parseChineseNumbers = (input) => {
  const chDigit = "〇一二三四五六七八九０１２３４５６７８９○ㄧ兩";
  const chTenth = "十百千拾佰仟什";

  // 正則表達式：擷取一段段純中文數字(含大寫小寫、全形數字、十百千等)
  const regexChineseNumber = new RegExp(`(?<![第同大]+)((?<=[(（)])[${chDigit}${chTenth}]+(?![)）])|(?<![（（])[${chDigit}${chTenth}]+)(?!(?:[年類：:]|學年|學期|學群))`, "g");

  return input.split(regexChineseNumber).map((segment, index) => {
    // 偶數索引 -> 非中文數字部分 (保留原樣)
    // 奇數索引 -> 中文數字部分 (轉換為阿拉伯數字)
    if (index % 2 === 0) {
      return segment;
    } else {
      return convertCNNumToInt(segment, chDigit, chTenth).toString();
    }
  }).join("");
};

// 輔助函式：將中文數字字串轉換成整數
const convertCNNumToInt = (str, chDigit, chTenth) => {
  const chNumber = "\\d" + chDigit + chTenth;

  // 移除不在定義範圍內的字符
  let filtered = str.replace(new RegExp(`[^${chNumber}]`, "g"), "");

  // 若整段可直接 parseInt，直接回傳
  if (!isNaN(parseInt(filtered))) {
    return parseInt(filtered);
  }

  // 若不含乘數(十、百、千…)，逐字轉換
  if (!new RegExp(`[${chTenth}]`).test(filtered)) {
    let result = 0;
    for (let i = 0; i < filtered.length; i++) {
      const digitVal = chDigit.indexOf(filtered.charAt(i)) % 10;
      result = result * 10 + digitVal;
    }
    return result;
  }

  // 處理有十、百、千等結構
  // 若字串一開始就是「十、拾、什」，補上一個「一」
  filtered = filtered.replace(/^([十拾什])/, "一$1");

  // 若前面不是數字、後面直接「十、拾、什」，補「一」
  const reFixMissingOne = new RegExp(`([^${chDigit}])([十拾什])`, 'g');
  filtered = filtered.replace(reFixMissingOne, (match, p1, p2) => {
    return p1 + "一" + p2;
  });

  let total = 0;
  let current = 0;

  for (let i = 0; i < filtered.length; i++) {
    const c = filtered.charAt(i);
    const digitPos = chDigit.indexOf(c);
    const tenthPos = chTenth.indexOf(c);

    if (digitPos !== -1) {
      const digitVal = digitPos % 10;
      current = current * 10 + digitVal;
    } else if (tenthPos !== -1) {
      // 根據位置決定乘法
      const multiplier = [10, 100, 1000][tenthPos % 3];
      if (current === 0) {
        // 處理 "十" 表示 1*10
        current = 1;
      }
      current *= multiplier;
      total += current;
      current = 0;
    }
  }

  total += current;
  return total;
};

export default parseChineseNumbers;