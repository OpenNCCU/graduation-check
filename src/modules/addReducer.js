const addReducer = (attr) => {
  if (!attr) {
    return undefined;
  }
  return {
    main: false,
    type: attr.type,
    dept: attr.dept,
    group: attr.group,
    year: attr.year,
  };
};

export default addReducer;
