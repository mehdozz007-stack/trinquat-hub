import type { Env } from './_worker';
import worker from './_worker';

export const onRequest: PagesFunction<Env> = async (context) => {
  return worker.fetch(context.request, context.env, context.ctx as any);
};
