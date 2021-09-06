/* eslint-disable unicorn/numeric-separators-style */
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
    new ObjectID('6085f5ac58dad1da02aa9fe3'),
  ]),
  createdAt: faker.date.past(),
  updatedAt: faker.date.past(),
  __v: 0,
})).concat(
  {
    _id: new ObjectID('6084f20f0502be06874d1a7f'),
    name: 'Electronics',
    amount: 8160,
    description:
      'The Apollotech B340 is an affordable wireless mouse with reliable connectivity, 12 months battery life and modern design',
    author: new ObjectID('6083bb0dadd37b9dbd7c45da'),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectID('6084f20f0502be06874d1a85'),
    name: 'Clothing',
    amount: 2800,
    description:
      'Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals',
    author: new ObjectID('6083bb0dadd37b9dbd7c45da'),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectID('6084f20f0502be06874d1a82'),
    name: 'Home',
    amount: 5950,
    description:
      'Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back for all-day comfort and support',
    author: new ObjectID('6083bb0dadd37b9dbd7c45da'),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectID('6084f20f0502be06874d1a86'),
    name: 'Sports',
    amount: 2110,
    description:
      'Carbonite web goalkeeper gloves are ergonomically designed to give easy fit',
    author: new ObjectID('6085f5ac58dad1da02aa9fe3'),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectID('6084f20f0502be06874d1a90'),
    name: 'Sport',
    amount: 59000,
    description:
      'The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J',
    author: new ObjectID('6085f5ac58dad1da02aa9fe3'),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectID('6084f20f0502be06874d1a8e'),
    name: 'Beauty',
    amount: 53700,
    description:
      'New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016',
    author: new ObjectID('6085f5ac58dad1da02aa9fe3'),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
);
