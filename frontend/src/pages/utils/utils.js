export const calcGameRate = (data) => {
  return data.win + data.lose === 0
    ? 0
    : ((data.win / (data.win + data.lose)) * 100).toFixed(2);
};
