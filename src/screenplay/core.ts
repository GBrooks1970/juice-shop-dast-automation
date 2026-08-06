/**
 * Minimal hand-rolled Screenplay core for the DAST confirmation lane (design note §6). The lane
 * exercises HTTP APIs, so it deliberately drags in no browser tooling. Tasks are imperative verb
 * phrases, Questions are noun phrases; step definitions stay one line thick.
 *
 * Adopted from the portfolio house idiom (parabank-bank-automation/src/screenplay/core.ts) for
 * cross-project consistency.
 */

export type Ability = object;
export type AbilityCtor<A extends Ability> = abstract new (...args: never[]) => A;

export interface Task {
  performAs(actor: Actor): Promise<void>;
}

export interface Question<T> {
  answeredBy(actor: Actor): Promise<T>;
}

export class Actor {
  private readonly abilities = new Map<Function, Ability>();
  private readonly notes = new Map<string, unknown>();

  constructor(public readonly name: string) {}

  whoCan(...abilities: Ability[]): this {
    for (const ability of abilities) {
      this.abilities.set(ability.constructor, ability);
    }
    return this;
  }

  abilityTo<A extends Ability>(ctor: AbilityCtor<A>): A {
    const ability = this.abilities.get(ctor);
    if (!ability) {
      throw new Error(`${this.name} does not have the ability ${ctor.name}`);
    }
    return ability as A;
  }

  async attemptsTo(...tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await task.performAs(this);
    }
  }

  asks<T>(question: Question<T>): Promise<T> {
    return question.answeredBy(this);
  }

  /** Scenario-scoped memory for tokens/ids captured from exploit responses. */
  remember(key: string, value: unknown): void {
    this.notes.set(key, value);
  }

  recall<T>(key: string): T {
    if (!this.notes.has(key)) {
      throw new Error(`${this.name} has no note named '${key}'`);
    }
    return this.notes.get(key) as T;
  }
}
