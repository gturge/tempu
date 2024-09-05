import React from 'react';
import styled from 'styled-components';

import { Block, Duration } from './generic';
import { tasksTotal } from '../selectors';

const Container = styled(Block)`
  position: sticky;
  top: 0;
  width: 96px;
  height: 96px;
  text-align: center;
  line-height: 1;
`;

const MonthLabel = styled(Block)`
  font-size: 12px;
  color: var(--normal-white);
  text-transform: uppercase;
`;

const MonthDate = styled(Block)`
  font-size: 32px;
  line-height: 1;
  margin-block: 4px 6px;
`;

const WeekDayLabel = styled(Block)`
  color: var(--normal-white);
  font-size: 14px;
`;

export default ({ date, tasks }) => {
  return (
    <Container>
      <MonthLabel children={date.format('MMMM')} />
      <MonthDate children={date.format('D')} />
      <WeekDayLabel children={date.format('YYYY')} />
    </Container>
  );
};
