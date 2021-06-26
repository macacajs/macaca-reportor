export const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

export const autoWrapText = text => {
  let res = '';
  let number = 15;
  let flag = 0;

  for (let i = 0; i < text.length; i++) {
    const current = text[i]
    res += current;
    flag++;
    if (escape(current).length > 4) {
      flag++;
    }

    if (flag >= number) {
      res += '\n';
      flag = 0;
    }
  }
  return res;
};
