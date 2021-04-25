const { ObjectID } = require('mongodb');
const faker = require('faker');

module.exports = Array.from({ length: 20 }, () => ({
  _id: new ObjectID(),
  name: faker.commerce.department(),
  amount: faker.commerce.price(10, 1e3, 2) * 100,
  description: faker.commerce.productDescription(),
  author: faker.random.arrayElement([
    new ObjectID('6081ed89edd0feb307b953e9'),
    new ObjectID('6083bb0dadd37b9dbd7c45da'),
  ]),
  createdAt: faker.date.past(),
  updatedAt: faker.date.past(),
  __v: 0,
}));
