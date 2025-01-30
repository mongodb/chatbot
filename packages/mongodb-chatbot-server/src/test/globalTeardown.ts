module.exports = async function () {
  try {
    if ((global as any).__MONGO_MEMORY_SERVER_INSTANCE) {
      await (global as any).__MONGO_MEMORY_SERVER_INSTANCE.stop();
    }
    if ((global as any).__MONGO_MEMORY_REPLICA_SET) {
      await (global as any).__MONGO_MEMORY_REPLICA_SET.stop();
    }
  } catch (error) {
    console.error("Error in global teardown:", error);
    throw error;
  }
};
