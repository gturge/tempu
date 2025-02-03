import Color from 'color';
import React, { MutableRefObject, useRef, useEffect } from 'react';

const svgStyle = {
  background: 'var(--normal-black)',
  transform: `scaleY(-1)`,
};

function getCSSVariable(variableName: string): string {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  return styles.getPropertyValue(variableName).trim();
}

class AccumulationChartGraphics {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  public update(data: number[]) {
    if (!data.length) return;

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;
    const shape = new Path2D();
    const line = new Path2D();

    const foreground = Color(getCSSVariable('--foreground'));
    const green = Color(getCSSVariable('--normal-green'));
    const red = Color(getCSSVariable('--normal-red'));
    const maxAlpha = 0.4;
    const minAlpha = 0;

    const remapY = (y: number) => {
      return y * (this.canvas.height - 32) + 16;
    };

    const zero = remapY(1 + minValue / range);

    const softShapeGradient = this.ctx.createLinearGradient(0, remapY(0), 0, remapY(1));
    softShapeGradient.addColorStop(0, green.alpha(maxAlpha).hexa());
    softShapeGradient.addColorStop(1 + minValue / range, green.alpha(minAlpha).hexa());
    softShapeGradient.addColorStop(1 + minValue / range, red.alpha(minAlpha).hexa());
    softShapeGradient.addColorStop(1, red.alpha(maxAlpha).hexa());

    const hardGradient = this.ctx.createLinearGradient(0, remapY(0), 0, remapY(1));
    hardGradient.addColorStop(0, green.hexa());
    hardGradient.addColorStop(1 + minValue / range, green.hexa());
    hardGradient.addColorStop(1 + minValue / range, red.hexa());
    hardGradient.addColorStop(1, red.hexa());

    shape.lineTo(0, zero);

    for (const [index, value] of data.entries()) {
      const x = (index / (data.length - 1)) * this.canvas.width;
      const y = remapY(1 - (value - minValue) / range);
      shape.lineTo(x, y);
      line.lineTo(x, y);
    }

    shape.lineTo(this.canvas.width, zero);
    shape.closePath();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = softShapeGradient;
    this.ctx.fill(shape);

    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = hardGradient;
    this.ctx.stroke(line);

    const horizontalLine = new Path2D();
    horizontalLine.lineTo(0, zero);
    horizontalLine.lineTo(this.canvas.width, zero);
    this.ctx.strokeStyle = foreground.hexa();
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 4]);
    this.ctx.stroke(horizontalLine);
  }

  public get domElement() {
    return this.canvas;
  }
}

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

export default function AccumulationChart({ data }: { data: number[] }) {
  const graphRef = useRef() as MutableRefObject<AccumulationChartGraphics | null>;
  const containerRef = useRef() as MutableRefObject<HTMLDivElement | null>;

  useEffect(() => {
    graphRef.current = new AccumulationChartGraphics(400, 128);
    containerRef.current!.appendChild(graphRef.current.domElement);
  }, []);

  useEffect(() => {
    graphRef.current!.update(data);
  }, [data]);

  return <div ref={containerRef}></div>;
}

// export default ({ data }) => {
//   const minValue = Math.min(...data);
//   const maxValue = Math.max(...data);
//   const range = maxValue - minValue;

//   const bars = data.map((value, index) => (
//     <Bar key={index} value={value} index={index} width={1} />
//   ));

//   return (
//     <Fragment>
//       <svg
//         style={svgStyle}
//         preserveAspectRatio={'none'}
//         height={128}
//         width={'100%'}
//         viewBox={`${0} ${minValue} ${data.length} ${range}`}
//       >
//         {bars}
//       </svg>
//     </Fragment>
//   );
// };
