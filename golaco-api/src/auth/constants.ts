export const jwtConstants = {
  secret: process.env.JWT_SECRET_KEY,
  expiresIn: process.env.JWT_EXPIRATION_TIME,
  issuer: process.env.JWT_ISSUER,
};
