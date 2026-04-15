export function success(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function error(res, message = 'Server Error', statusCode = 500) {
  return res.status(statusCode).json({ success: false, message, data: null });
}
