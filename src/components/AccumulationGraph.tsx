import React, { Fragment } from 'react';

const svgStyle = {
  background: 'var(--normal-black)',
  transform: `scaleY(-1)`,
};

type BarProps = { value: number; width: number; index: number };

function Bar({ value, width, index }: BarProps) {
  return (
    <rect
      x={index * width}
      y={value < 0 ? value : 0}
      width={width}
      height={Math.abs(value)}
      fill={value > 0 ? 'var(--light-green)' : 'var(--light-red)'}
    />
  );
}

export default ({ data }) => {
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue;

  const bars = data.map((value, index) => (
    <Bar key={index} value={value} index={index} width={1} />
  ));

  return (
    <Fragment>
      <svg
        style={svgStyle}
        preserveAspectRatio={'none'}
        height={128}
        width={'100%'}
        viewBox={`${0} ${minValue} ${data.length} ${range}`}
      >
        {bars}
      </svg>
    </Fragment>
  );
};
