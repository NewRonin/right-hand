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

  type Task = {
    name: string;
  }
  
  type  Feature = {
    name: string;
    children: Task[];
  }
  
  type Epic = {
    name: string;
    children: Feature[];
  }

  
}
