export {};
declare global {
  type StatisticsData = {
    value: String;
    text: String;
  };

  type HeaderLink = {
    name: string;
    link?: string;
    action?: string;
    enabled: boolean;
    custom?: boolean;
  };
}
