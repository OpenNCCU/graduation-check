const additionReducer = (attr) => {
  if (!attr) {
    return undefined;
  }
  return {
    type: attr.type,
    deptID: attr.deptID,
    group: attr.group,
    year: attr.year,
  };
};

export default additionReducer;
