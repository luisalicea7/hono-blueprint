export type CheckStatus = "ok" | "error";

export type DependencyCheck = {
  status: CheckStatus;
  latencyMs?: number;
  error?: string;
};

export type DependencyChecks = {
  database: DependencyCheck;
  redis: DependencyCheck;
};

export type HealthOverview = {
  status: "ok" | "error";
  app: string;
  environment: string;
  timestamp: string;
  checks: DependencyChecks;
};

export type LivePayload = {
  status: "ok";
  timestamp: string;
};

export type ReadyPayload = {
  status: "ok" | "error";
  timestamp: string;
  checks: DependencyChecks;
};
