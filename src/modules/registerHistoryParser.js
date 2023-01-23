import departmentMap from '../../data/departmentMap.js';

const registerHistoryParser = (attr) => {
  let result = null;
  if (attr.length > 0) {
    result = attr.map((e) => {
      const yearAndSemester = e.year
        .split('(')[0]
        .split('/')
        .map((yearOrSemester) => parseInt(yearOrSemester.trim(), 10));
      const year = yearAndSemester[0];
      const semester = yearAndSemester[1];
      const regsts = e.regsts.split(' ')[0];
      const gradename = e.gradename.split(' ')[0];

      return {
        year,
        semester,
        regsts,
        gradename,
        ...departmentMap[year][gradename],
      };
    });
  }
  return result;
};

export default registerHistoryParser;
