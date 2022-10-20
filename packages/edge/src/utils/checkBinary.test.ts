import { checkBinary } from './checkBinary'

it('should return `true` when `Content-Type` is binary', () => {
  expect(checkBinary('application/pdf')).toBeTruthy()
  expect(checkBinary('image/png')).toBeTruthy()
  expect(checkBinary('text/html')).toBeFalsy()
  expect(checkBinary(null)).toBeFalsy()
  expect(checkBinary()).toBeFalsy()
})
