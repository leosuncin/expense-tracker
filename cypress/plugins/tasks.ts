import Fixtures, { Options } from 'node-mongodb-fixtures';

export async function loadFixtures(options: Options = {}) {
  const fixtures = new Fixtures({ ...options, mute: true });

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
