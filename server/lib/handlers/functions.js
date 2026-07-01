/** Legacy Base44 function invocations — disabled for security. */
export async function handleFunction(req, res, name) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(403).json({
    error: 'Function disabled',
    message: `Server function "${name}" is not available. Use the public API instead.`,
  });
}