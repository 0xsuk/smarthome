import { AirControlDto } from "@/app/type";
class RemoteController {
  private state: AirControlDto = {
    temperature: 24,
    mode: "COOL",
    fanSpeed: "AUTO",
    isOn: false,
  }

  public getState(): AirControlDto {
    return this.state;
  }

  public setState(state: AirControlDto) {
    this.state = state;
  }
}

export const remoteController = new RemoteController();
