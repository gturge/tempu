import { groupBy } from './utils';

export type DateString = string;

export type Task = {
  start: number;
  end: number;
  total: number;
  keys: string[];
  description: string;
  date: DateString;
  section: string;
};

export type Section = {
  name: string;
  expectedTime: number | null;
  tasks: Task[];
};

type Message = { lineNumber: number; message: string };

type ErrorMessage = Message & { type: 'error' };
type WarningMessage = Message & { type: 'warning' };

export type Timesheet = {
  tasks: Task[];
  sections: Record<string, Section>;
  errors: ErrorMessage[];
  warnings: WarningMessage[];
};

type SectionToken = {
  type: 'section';
  value: Section;
};

type DateToken = {
  type: 'date';
  value: DateString;
};

type TaskToken = {
  type: 'task';
  value: Task;
};

function isEmpty(line: string): boolean {
  return line === '';
}

function isVacationLine(line: string): boolean {
  return line.startsWith('~~~');
}

function isCommentLine(line: string): boolean {
  return line.startsWith('#');
}

function isDate(line: string): boolean {
  return line.startsWith('--');
}

function isSection(line: string): boolean {
  return line.startsWith('===');
}

function parseTime(str: string): number {
  const [hours, minutes] = str.split(':');
  return (Number.parseInt(hours) * 60 + Number.parseInt(minutes)) * 60;
}

const groupByDate = groupBy((entry: Task) => entry.date);

const expressions = {
  date: /^--\s?(?<date>\d{2,4}\-\d{2}\-\d{2})/,
  task: /^(?<start>\d\d:\d\d)\s?-\s?(?<end>\d\d:\d\d)\s?(?:->|\|)?\s?(?:\[(?<path>.+)\])?\s?(?<description>.+)?/,
  section: {
    default: /^===\s?(?<name>.+)===$/,
    withExpectedTime: /^===\s?(?<name>.+)\s\((?<expected>\d+:\d{1,2})\)\s?===$/,
  },
};

// Parse section
function parseSection(content: string, _lineNumber: number): SectionToken {
  if (expressions.section.withExpectedTime.test(content)) {
    const [, name, expectedTime] = expressions.section.withExpectedTime.exec(content)!;
    return {
      type: 'section',
      value: {
        name: name.trim(),
        expectedTime: parseTime(expectedTime),
        tasks: [],
      },
    };
  } else {
    const [, name] = expressions.section.default.exec(content)!;
    return {
      type: 'section',
      value: {
        name: name.trim(),
        expectedTime: null,
        tasks: [],
      },
    };
  }
}

function parseDate(content: string, _lineNumber: number): DateToken {
  const [, date] = expressions.date.exec(content)!;
  return { type: 'date', value: date };
}

function parseTask(content: string, lineNumber: number): TaskToken {
  const [, start, end, rawKey, description] = expressions.task.exec(content)!;

  const keys = rawKey.split(',');
  const startTime = parseTime(start);
  const endTime = parseTime(end);

  const total = endTime - startTime;

  if (total <= 0) {
    console.error(`Null or negative time error on line ${lineNumber}`);
  }

  return {
    type: 'task',
    value: {
      start: startTime,
      end: endTime,
      total,
      keys,
      description,
      date: '0000-00-00', // Provide temporary invalid date
      section: 'undefined', // Temporary undefined section
    },
  };
}

export default function parseTimesheet(content: string): Timesheet {
  const lines = content
    .split('\n')
    .map((line: string, lineNumber: number) => ({ content: line, lineNumber }))
    .filter(
      (line) =>
        !isVacationLine(line.content) &&
        !isCommentLine(line.content) &&
        !isEmpty(line.content)
    )
    .map(({ content, lineNumber }) => {
      if (isSection(content)) {
        return parseSection(content, lineNumber);
      } else if (isDate(content)) {
        return parseDate(content, lineNumber);
      } else {
        return parseTask(content, lineNumber);
      }
    });

  const sections: Record<string, Section> = {};
  const dates: Record<DateString, DateString> = {};
  const tasks: Task[] = [];

  const errors: ErrorMessage[] = [];
  const warnings: WarningMessage[] = [];

  const cursor: {
    section?: string;
    date?: DateString;
  } = {
    section: undefined,
    date: undefined,
  };

  for (const [lineNumber, line] of lines.entries()) {
    if (line.type === 'section') {
      cursor.section = line.value.name;

      // Check if the section has already been defined. In which case an error should be thrown
      if (sections[cursor.section]) {
        warnings.push({
          type: 'warning',
          lineNumber,
          message: `Session ${cursor.section} has already been defined`,
        });
      } else {
        sections[cursor.section] = line.value;
      }
    } else if (line.type === 'date') {
      cursor.date = line.value;

      if (cursor.date && dates[cursor.date]) {
        warnings.push({
          type: 'warning',
          lineNumber,
          message: `Date ${cursor.date} has already been defined`,
        });
      }

      dates[cursor.date] = line.value;
    } else if (line.type === 'task') {
      if (!cursor.date) {
        errors.push({
          type: 'error',
          lineNumber,
          message: 'Encountered task but no prior date defined',
        });
        continue;
      }

      if (!cursor.section) {
        errors.push({
          type: 'error',
          lineNumber,
          message: 'Encountered task but no prior section defined',
        });
        continue;
      }

      const task = line.value;
      task.date = cursor.date;
      task.section = cursor.section;

      sections[cursor.section].tasks.push(task);
      tasks.push(task);
    }
  }

  for (const section of Object.values(sections)) {
    const dates = groupByDate(section.tasks);

    for (const [date, tasks] of Object.entries(dates)) {
      let lastEnd = 0;

      for (const task of tasks) {
        if (task.end < lastEnd || task.start < lastEnd) {
          errors.push({
            type: 'error',
            lineNumber: 1,
            message: `Overlapping time task in section ${section.name} on ${date}: ${task.description}`,
          });
        }

        lastEnd = task.end;
      }
    }
  }

  return { tasks, sections, warnings, errors };
}
