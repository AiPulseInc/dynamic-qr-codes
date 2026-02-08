type DashboardUrlParams = {
  tab: "analytics" | "qr";
  search?: string;
  status?: string;
  from: string;
  to: string;
  qrCodeId?: string | null;
  excludeBots?: boolean;
  page?: number;
};

export function buildDashboardUrl(params: DashboardUrlParams): string {
  const sp = new URLSearchParams();
  sp.set("tab", params.tab);
  if (params.search) {
    sp.set("q", params.search);
  }
  if (params.status && params.status !== "all") {
    sp.set("status", params.status);
  }
  sp.set("from", params.from);
  sp.set("to", params.to);
  if (params.qrCodeId) {
    sp.set("qr", params.qrCodeId);
  }
  sp.set("bots", params.excludeBots ? "1" : "0");
  if (params.page && params.page > 1) {
    sp.set("page", String(params.page));
  }
  return `/dashboard?${sp.toString()}`;
}
