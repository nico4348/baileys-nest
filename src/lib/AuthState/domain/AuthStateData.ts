export class AuthStateData {
  private readonly creds: any;
  private readonly keys: Map<string, Map<string, any>>;

  constructor(creds: any, keys?: Map<string, Map<string, any>>) {
    this.creds = creds;
    this.keys = keys || new Map();
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this.creds) {
      throw new Error('Credentials must be provided');
    }
  }

  toJSON(): { creds: any; keys: any } {
    const keysObj: any = {};
    for (const [type, typeMap] of this.keys.entries()) {
      keysObj[type] = Object.fromEntries(typeMap);
    }
    return {
      creds: this.creds,
      keys: keysObj,
    };
  }
}
