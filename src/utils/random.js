export default class RandomUtils {
  static random(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }
}
