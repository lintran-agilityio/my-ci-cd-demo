import { authenticationService } from "@/services";
import { User } from "@/models";

jest.mock("@/models");

describe("Authentication Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isValidExistUser", () => {
    it("should return true if user exists", async () => {
      const mockUser = { id: 1, email: ""};
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    });