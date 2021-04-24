import Fixtures, { Options } from 'node-mongodb-fixtures';

// eslint-disable-next-line unicorn/no-object-as-default-parameter
export async function loadFixtures(options: Options = { mute: true }) {
  const fixtures = new Fixtures(options);

  if (!process.env.MONGO_URL) return false;

  await fixtures.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await fixtures.unload();
  await fixtures.load();
  await fixtures.disconnect();

  return true;
}
