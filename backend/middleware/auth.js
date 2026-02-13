const loadClerkSdk = async () => {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is required for authentication");
  }

  const { createClerkClient, verifyToken } = await import("@clerk/backend");
  return {
    clerkClient: createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }),
    verifySessionToken: async (token) =>
      verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      }),
  };
};

// Strict Clerk-based auth guard. All user and admin routes must present a valid Clerk JWT.
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("authorization") || req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    if (!bearerToken) {
      return res.status(401).json({ message: "Unauthorized: missing Bearer token" });
    }

    const { verifySessionToken } = await loadClerkSdk();
    const session = await verifySessionToken(bearerToken);

    const userId = session?.sub || session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: invalid Clerk token" });
    }

    req.auth = { userId };
    return next();
  } catch (error) {
    const message = error?.message || String(error);
    const isServerConfigError =
      message.includes("CLERK_SECRET_KEY") || message.includes("@clerk/backend");

    // eslint-disable-next-line no-console
    console.error("Auth error:", message);
    if (isServerConfigError) {
      const devMessage =
        process.env.NODE_ENV === "production"
          ? "Authentication service is not configured"
          : `Authentication service is not configured: ${message}`;
      return res.status(500).json({ message: devMessage });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Simple role check using Clerk public metadata. Adjust as your role model evolves.
export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header("authorization") || req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    if (!bearerToken) {
      return res.status(401).json({ message: "Unauthorized: missing Bearer token" });
    }

    const { clerkClient, verifySessionToken } = await loadClerkSdk();
    const session = await verifySessionToken(bearerToken);
    const userId = session?.sub || session?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: invalid Clerk token" });
    }

    const user = await clerkClient.users.getUser(userId);
    const role =
      user?.publicMetadata?.role ||
      user?.privateMetadata?.role ||
      (Array.isArray(user?.publicMetadata?.roles) ? user.publicMetadata.roles[0] : null);

    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin access required" });
    }

    req.auth = { userId, role: "admin" };
    return next();
  } catch (error) {
    const message = error?.message || String(error);
    const isServerConfigError =
      message.includes("CLERK_SECRET_KEY") || message.includes("@clerk/backend");

    // eslint-disable-next-line no-console
    console.error("Admin auth error:", message);
    if (isServerConfigError) {
      const devMessage =
        process.env.NODE_ENV === "production"
          ? "Authentication service is not configured"
          : `Authentication service is not configured: ${message}`;
      return res.status(500).json({ message: devMessage });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
};
