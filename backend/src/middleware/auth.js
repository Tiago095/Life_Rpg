import jwt from 'jsonwebtoken'

const JWT_SECRET = 'liferpg-secret-key'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Não autenticado.' })

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}