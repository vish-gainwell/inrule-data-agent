// Minimal test to validate queued persist ordering
// Run with: node client/scripts/testPersistQueue.js

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

class PersistQueue {
  constructor() {
    this.queue = Promise.resolve();
    this.order = [];
  }
  enqueue(label, work) {
    this.queue = this.queue
      .then(async () => {
        // mark start
        this.order.push(`start:${label}`);
        const result = await work();
        // mark end
        this.order.push(`end:${label}`);
        return result;
      })
      .catch((err) => {
        this.order.push(`error:${label}:${err && err.message}`);
      });
    return this.queue;
  }
}

(async () => {
  const pq = new PersistQueue();

  // Enqueue two persists where the first takes longer than the second.
  // If not queued, the second would finish first and violate ordering.
  pq.enqueue('A', async () => {
    console.log('A: work started');
    await delay(200);
    console.log('A: work finished');
  });

  pq.enqueue('B', async () => {
    console.log('B: work started');
    await delay(50);
    console.log('B: work finished');
  });

  pq.enqueue('C', async () => {
    console.log('C: work started');
    await delay(10);
    console.log('C: work finished');
  });

  // Wait for the queue to finish
  await pq.queue;

  console.log('Order:', pq.order.join(' -> '));
  // Expected
  // start:A -> end:A -> start:B -> end:B -> start:C -> end:C
})();
