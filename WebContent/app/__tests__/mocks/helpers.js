// Common promise to use for mocking API response (Integration test)
const promise = response => new Promise((resolve, _reject) => resolve(response));

module.exports = promise;
