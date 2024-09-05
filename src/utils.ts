type Predicate<T> = (...args: any[]) => boolean;
type Result<U> = (...args: any[]) => U;

export function cond<T, U>(predicates: [Predicate<T>, Result<U>][]): (...args: any[]) => U | undefined {
  return (...args: any[]): U | undefined => {
    for (const [predicate, result] of predicates) {
      if (predicate(...args)) return result(...args);
    }
    return undefined;
  };
}

export function constant<T>(value: T): (...args: any) => T {
  return () => value;
};

export type EventListenerRemover = () => void;

export function createEventListener(target: EventTarget, event: string, callback: EventListenerOrEventListenerObject): EventListenerRemover {
  target.addEventListener(event, callback);
  return () => target.removeEventListener(event, callback);
}

export type Style = Record<string, string>;

export function applyStyle(target: HTMLElement, style: Style) {
  Object.assign(target.style, style);
}

type GroupByCriterion<T> = (item: T) => string;

export function groupBy<T>(
  criterion: GroupByCriterion<T>
): (collection: T[]) => Record<string, T[]> {
  return (collection: T[]) =>
  collection.reduce(
    (result, item) => {
      const key = criterion(item);
      result[key] = result[key] || [];
      result[key].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function* range(start: number, end: number, step: number = 1): Iterable<number> {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

export function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tagname: K
): SVGElementTagNameMap[K] {
  return document.createElementNS('http://www.w3.org/2000/svg', tagname);
}

export function formatDate({ year, month, day }: DateStruct) {
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

export function mapWeekday(d: number) {
  return d % 7;
}

