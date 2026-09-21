import { createRequire } from 'node:module';

const httpStatus = createRequire(__filename)('http-status') as typeof import('http-status', {
  with: { 'resolution-mode': 'import' },
});
const StatusCode = httpStatus.default;
export default StatusCode;
