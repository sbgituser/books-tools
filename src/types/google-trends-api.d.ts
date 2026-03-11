declare module "google-trends-api" {
  export function dailyTrends(options: {
    trendDate?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
  }): Promise<string>;

  const _default: {
    dailyTrends: typeof dailyTrends;
  };

  export default _default;
}

