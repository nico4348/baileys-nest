export class SessionDeletedAt {
  value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
    this.ensureIsValid();
  }
  private ensureIsValid() {
    if (this.value) {
      // Permitir fechas actuales con un margen de tolerancia de 1 segundo
      const now = new Date();
      const maxAllowedTime = new Date(now.getTime() + 1000); // 1 segundo de tolerancia

      if (this.value > maxAllowedTime) {
        throw new Error('SessionDeletedAt cannot be in the future');
      }
    }
  }
}
