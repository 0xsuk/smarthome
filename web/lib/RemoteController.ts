import { Mode } from "@/app/type";

import { FanSpeed } from "@/app/type";

class RemoteController {
  temp: number = 24;
  mode: Mode = "COOL";
  fanSpeed: FanSpeed = "AUTO";
  isOn: boolean = false;
}

export const remoteController = new RemoteController();
