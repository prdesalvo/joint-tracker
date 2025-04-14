// handlers.ts 
import {
  getAngle,
  getFlexionAngle,
  getTiltAngle,
  getNeckPitchAngle,
  computeYawFromNose,
  drawAngleArc,
  drawTiltAngleArc,
  drawNeckPitchArc,
  drawYawArc
} from "./geometry";


export const calcHandlers: Record<
  string,
  {
    compute: (...points: any[]) => number | null;
    draw: (ctx: CanvasRenderingContext2D, points: any[], angle: number) => void;
  }
> = {
  Flexion: {
    compute: (A, B, C) => getFlexionAngle(A, B, C),
    draw: (ctx, [A, B, C], angle) => drawAngleArc(ctx, A, B, C, angle),
  },
  tilt: {
    compute: (A, B, joint) =>
      joint.direction === "left"
        ? -getTiltAngle(A, B)
        : getTiltAngle(A, B),
    draw: (ctx, [A, B], angle) => drawTiltAngleArc(ctx, A, B, angle),
  },
  Neck: {
    compute: (A, B) => getNeckPitchAngle(A, B),
    draw: (ctx, [top, bottom], angle) => drawNeckPitchArc(ctx, top, bottom, angle),
  },
  yawFromNose: {
    compute: (A, B, C, joint) => 
      joint.direction === "left"
        ? computeYawFromNose([A, B, C])
        : -computeYawFromNose([A, B, C]),
    draw: (ctx, _points, angle) => {
      const center = {
        x: ctx.canvas.width / 2,
        y: ctx.canvas.height * 0.25,
      };
      drawYawArc(ctx, center, angle);
    },
  },
  default: {
    compute: (A, B, C) => getAngle(A, B, C),
    draw: (ctx, [A, B, C], angle) => drawAngleArc(ctx, A, B, C, angle),
  },
};