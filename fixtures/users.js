const { ObjectID } = require('mongodb');

module.exports = [
  {
    _id: new ObjectID('6081ed89edd0feb307b953e9'),
    isAdmin: true,
    name: 'John Doe',
    email: 'john@doe.me',
    // Appraisal-fretful-roving
    password: '$2a$16$QwvLrpL/5Xje0m7HLFUpZOrnwsElbc/fY9kWn68vN/7KawUKDXf7O',
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectID('6083bb0dadd37b9dbd7c45da'),
    isAdmin: false,
    name: 'Armando Martin',
    email: 'armando@martin.me',
    // Reversion-rockband-bonding
    password: '$2a$16$khqmg6mF2XkIiphxL3LeC.OZQDneZlZdwjGjoOHBvarxXHdd6tvb.',
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectID('6085f5ac58dad1da02aa9fe3'),
    isAdmin: false,
    name: 'Samuel Simmons',
    email: 'samuel@simmons.me',
    // Curling-confetti-skater
    password: '$2a$16$nbwDu1Rey1/.E2.uPhCcLeX09lgvSLwevkfQpGL.uaFH..cQtIlHq',
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
];
