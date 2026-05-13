const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../tokenUtils");

describe("tokenUtils", () => {
  const mockUser = { id: "user123", role: "user" };

  it("should generate a valid access token", () => {
    const token = generateAccessToken(mockUser);
    expect(token).toBeDefined();
    const decoded = jwt.decode(token);
    expect(decoded.sub).toBe(mockUser.id);
    expect(decoded.role).toBe(mockUser.role);
  });

  it("should generate a valid refresh token", () => {
    const token = generateRefreshToken(mockUser);
    expect(token).toBeDefined();
    const decoded = jwt.decode(token);
    expect(decoded.sub).toBe(mockUser.id);
  });

  it("should verify a valid access token", () => {
    const token = generateAccessToken(mockUser);
    const verified = verifyAccessToken(token);
    expect(verified.sub).toBe(mockUser.id);
  });

  it("should verify a valid refresh token", () => {
    const token = generateRefreshToken(mockUser);
    const verified = verifyRefreshToken(token);
    expect(verified.sub).toBe(mockUser.id);
  });

  it("should throw error for invalid access token", () => {
    expect(() => verifyAccessToken("invalid-token")).toThrow();
  });

  it("should throw error for invalid refresh token", () => {
    expect(() => verifyRefreshToken("invalid-token")).toThrow();
  });
});
