export default class ValidationError extends Error {
  #field;
  constructor(message, field) {
    super(message);
    this.#field = field;
  }
  get field() {
    return this.#field;
  }
}
