const { authenticate, requireRole } = require("../auth.middleware");
const ApiError = require("../../utils/ApiError");
const tokenUtils = require("../../utils/tokenUtils");
const User = require("../../modules/auth/auth.model");

vi.mock("../../utils/tokenUtils", () => ({
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

vi.mock("../../modules/auth/auth.model", () => ({
  findById: vi.fn(),
}));

describe("auth middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should throw 401 if no token", async () => {
      await authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it("should call next if token is valid", async () => {
      req.headers.authorization = "Bearer valid-token";
      tokenUtils.verifyAccessToken.mockReturnValue({ sub: "user123" });
      User.findById.mockResolvedValue({
        id: "user123",
        role: "user",
        isActive: true,
      });

      await authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual({ id: "user123", role: "user" });
    });
  });

  describe("requireRole", () => {
    it("should call next if role matches", () => {
      req.user = { role: "admin" };
      requireRole("admin")(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with ApiError if role does not match", () => {
      req.user = { role: "user" };
      const middlewareNext = vi.fn();
      requireRole("admin")(req, res, middlewareNext);
      expect(middlewareNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(middlewareNext.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
