import { setWorldConstructor, World, type IWorldOptions } from '@cucumber/cucumber';
import { Actor } from '../../src/screenplay/core.js';
import { CallJuiceShop } from '../../src/screenplay/call-juice-shop.js';

/** One actor per scenario, able to call the Juice Shop target. */
export class DastWorld extends World {
  readonly actor: Actor;

  constructor(options: IWorldOptions) {
    super(options);
    this.actor = new Actor('Mallory').whoCan(CallJuiceShop.at());
  }
}

setWorldConstructor(DastWorld);
