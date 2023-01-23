const creditParser = (attr) => {
  let result = attr;
  if (attr.length > 0) {
    result = attr.map((e) => {
      const year = parseInt(e.year.trim(), 10);
      const semester = parseInt(e.semester.trim(), 10);
      const { subNum } = e;
      const subName = e.subName.trim();
      const subSel = e.subSel.trim();
      const { subPnt } = e;
      const { score } = e;

      return {
        year,
        semester,
        subNum,
        subName,
        subSel,
        subPnt,
        score,
      };
    });
  }
  return result;
};

export default creditParser;
