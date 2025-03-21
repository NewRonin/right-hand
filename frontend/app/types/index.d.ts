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
    priority?: string;
    children: Feature[];
  }

  type TableItem = {
    name: string;
    children?: TableItem[];
    priority?: string;
  }

  type TableSelectedItems = {
    epicIndex: number, 
    featureIndex: number, 
    taskIndex: number, 
  }

  type ContextMenu = {
    visible: boolean,
    x: number,
    y: number,
    options: ContextMenuOption[],
    selectedIndexes: TableSelectedItems,
  }

  type ContextMenuOption = {
    label: string;
    action?: string,
  }

  
}
