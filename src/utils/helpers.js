export default class Helpers {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
