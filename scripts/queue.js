class Queue {
  constructor() {
    this.contents = [];
  }

  enqueue(item) {
    this.contents.push(item);
  }

  dequeue() {
    return this.contents.shift();
  }

  isEmpty() {
    return this.contents.length === 0;
  }
}

export default Queue;
