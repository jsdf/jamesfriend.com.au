export default class Scroller {
  constructor({rowSize, windowSize, startOffset, enter, exit}) {
    this.rowSize = rowSize;
    this.windowSize = windowSize;
    this.pos = startOffset;
    this.enter = enter;
    this.exit = exit;

    this.traverseWindowQuantized(
      startOffset - windowSize / 2,
      startOffset + windowSize / 2,
      enter
    );
  }

  format() {
    return `pos=${this.pos.toFixed(2)}`;
  }

  traverseWindowQuantized(from, to, fn) {
    const start = Math.floor(from / this.rowSize);
    const end = Math.floor(to / this.rowSize);
    for (var i = start; i < end; i++) {
      fn(i * this.rowSize, i);
    }
  }

  update(nextPos) {
    const delta = nextPos - this.pos;
    const positiveEdge = this.pos + this.windowSize / 2;
    const negativeEdge = this.pos - this.windowSize / 2;

    // exit the stuff on the trailing edge, enter the stuff on the leading edge
    if (delta > 0) {
      // moving forwards
      this.traverseWindowQuantized(
        negativeEdge,
        negativeEdge + delta,
        this.exit
      );
      this.traverseWindowQuantized(
        positiveEdge,
        positiveEdge + delta,
        this.enter
      );
    } else {
      // moving backwards
      this.traverseWindowQuantized(
        positiveEdge + delta,
        positiveEdge,
        this.exit
      );
      this.traverseWindowQuantized(
        negativeEdge + delta,
        negativeEdge,
        this.enter
      );
    }

    this.pos += delta;
  }
}
