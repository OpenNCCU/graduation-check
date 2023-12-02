import fs from 'fs';

const parse = () => {
  fs.writeFileSync('./data/output.json.local', '');
  fs.writeFileSync('./data/output.csv.local', 'INSERT INTO public.test_require_grade\nVALUES\n');

  const data = JSON.parse(fs.readFileSync('./data/result.json'));

  const results = [];

  // Object.keys(data).forEach((year) => {
  //   data[year] =\
  const year = 112;
  data[year].forEach((requireItem) => {
    let courseIdx = 0;
    requireItem.rules.forEach((rule) => {
      const { subjects } = rule;
      subjects.forEach((subject) => {
        courseIdx += 1;
        subject.semester.forEach((semester, idx) => {
          if (semester === true) {
            const s = idx + 2;
            fs.appendFileSync(
              './data/output.csv.local',
              `('B${requireItem.departmentID}_${requireItem.groupID}_${year}${(`000${courseIdx}`).slice(-3)}',${Math.floor(s / 2)},${(s % 2) + 1}),\n`,
            );
          }
        });
        // results.push(resultItem);
      });
    });

    // results.push(resultItem);
  });
  // });
  // fs.appendFileSync('./data/output.json.local', `${JSON.stringify(results, null, 2)}\n`);

  return data;
};

export default parse;
