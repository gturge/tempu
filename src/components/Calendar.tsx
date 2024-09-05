import React from 'react';
import styled from 'styled-components';
import { Block } from './generic';

const MonthGrid = styled(Block)`
  width: calc(18px * 7);
  height: calc(18px * 7);
  font-size: 10px;
  display: inline-grid;
  grid: auto-flow / repeat(7, 0fr);
`;

const Header = styled(Block)`
  width: calc(18px * 7);
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
`;

const Day = styled(Block)<{
  $outside?: boolean;
  $active?: boolean;
  children: React.ReactNode;
}>`
  line-height: 18px;
  width: 18px;
  height: 18px;
  text-align: center;
  border-radius: 2px;
  color: var(--normal-white);
  ${({ $outside }) => $outside && `color: var(--light-black);`}
  ${({ $active }) =>
    $active &&
    `
    background-color: var(--accent);
    color: var(--normal-black);
  `}
`;

const WeekDay = styled(Day)`
  font-weight: bold;
`;

const previousDays = (day) => {
  const daysInMonth = day.subtract(1, 'month').daysInMonth();
  const daysBefore = day.day();
  return [...Array(daysBefore)].map((v, i) => (
    <Day key={i} $outside children={1 + daysInMonth - (daysBefore - i)} />
  ));
};

const nextDays = (day) => {
  const lastDay = day.endOf('month');
  const daysAfter = 6 - lastDay.day();
  return [...Array(daysAfter)].map((v, i) => <Day key={i} $outside children={i + 1} />);
};

export default ({ date }) => {
  const firstDay = date.startOf('month');

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
    <WeekDay key={day} children={day} />
  ));

  const daysIn = [...Array(firstDay.daysInMonth())].map((v, i) => {
    return <Day key={i} children={i + 1} $active={date.date() === i + 1} />;
  });

  return (
    <div>
      <Header>{date.format('MMMM YYYY')}</Header>
      <MonthGrid
        children={[weekDays, previousDays(firstDay), daysIn, nextDays(firstDay)]}
      />
    </div>
  );
};
