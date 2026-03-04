module.exports = {
  nanoid: () => 'test-id-' + Math.random().toString(36).substr(2, 9)
};
