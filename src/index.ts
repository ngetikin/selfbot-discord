/* Entry point placeholder. Will be expanded with client init and event loader in v0.2. */

const main = async () => {
  // TODO: load env, init logger, start client.
  console.log('Selfbot bootstrap ready');
};

main().catch((error) => {
  console.error('Fatal error during startup', error);
  process.exit(1);
});
