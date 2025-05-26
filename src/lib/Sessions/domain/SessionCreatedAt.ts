export class SessionCreatedAt {
  value: Date;

  constructor(value: Date) {
    this.value = value;
    this.ensureIsValid();
  }
  private ensureIsValid() {
    // Permitir fechas actuales con un margen de tolerancia de 1 segundo
    const now = new Date();
    const maxAllowedTime = new Date(now.getTime() + 1000); // 1 segundo de tolerancia

    if (this.value > maxAllowedTime) {
      throw new Error('SessionCreatedAt cannot be in the future');
    }
  }
}
