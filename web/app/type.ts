export type Mode = "COOL" | "HEAT" | "DRY"
export type FanSpeed = "AUTO+" | "AUTO" | "SIZUKA"

export type AirControlDto = {
    isOn: boolean;
    temperature: number;
    mode: Mode;
    fanSpeed: FanSpeed;
}
