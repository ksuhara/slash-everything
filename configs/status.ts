type StatusColor = "cyan" | "blue" | "red" | "green" | "yellow";

export const statusToColor: Record<string, StatusColor> = {
  initiated: "blue",
  processing: "cyan",
  failed: "red",
  completed: "green",
  action_required: "yellow",
};
