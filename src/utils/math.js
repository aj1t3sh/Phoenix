export default class MathUtils {
  static lerp(start, end, t) {
    return start + (end - start) * t;
  }
}
