// The Actor's one ability: make HTTP calls to the Juice Shop target and remember the last response.

import { TARGET_BASE_URL } from './target.js';

export interface CapturedResponse {
  status: number;
  bodyText: string;
  json: unknown;
}

export class CallJuiceShop {
  constructor(private readonly baseUrl: string = TARGET_BASE_URL) {}

  static at(baseUrl: string = TARGET_BASE_URL): CallJuiceShop {
    return new CallJuiceShop(baseUrl);
  }

  async request(
    path: string,
    init: RequestInit = {},
  ): Promise<CapturedResponse> {
    const res = await fetch(`${this.baseUrl}${path}`, init);
    const bodyText = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(bodyText);
    } catch {
      json = undefined;
    }
    return { status: res.status, bodyText, json };
  }
}
