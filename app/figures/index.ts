import {
  LightSwitch,
  DeskLamp,
  Doorbell,
  TallyKey,
} from "./batch-a";
import { Toaster, Kettle, Microwave, DeskFan } from "./batch-b";
import {
  RadioTuner,
  VinylPlayer,
  SpeakerCube,
  CoffeeGrinder,
} from "./batch-c";
import {
  Thermostat,
  SafeDial,
  AlarmClock,
  StampPad,
} from "./batch-d";
import {
  PrinterFeed,
  TvSet,
  ApprovalPad,
  PagePress,
} from "./batch-e";

export const FIGURES = [
  { title: "Wall Switch", Component: LightSwitch },
  { title: "Desk Lamp", Component: DeskLamp },
  { title: "Doorbell", Component: Doorbell },
  { title: "Tally Key", Component: TallyKey },
  { title: "Toaster", Component: Toaster },
  { title: "Kettle", Component: Kettle },
  { title: "Microwave", Component: Microwave },
  { title: "Desk Fan", Component: DeskFan },
  { title: "FM Radio", Component: RadioTuner },
  { title: "Turntable", Component: VinylPlayer },
  { title: "Speaker", Component: SpeakerCube },
  { title: "Coffee Grinder", Component: CoffeeGrinder },
  { title: "Thermostat", Component: Thermostat },
  { title: "Safe Dial", Component: SafeDial },
  { title: "Alarm Clock", Component: AlarmClock },
  { title: "Stamp Pad", Component: StampPad },
  { title: "Printer", Component: PrinterFeed },
  { title: "Television", Component: TvSet },
  { title: "Approval Pad", Component: ApprovalPad },
  { title: "Page Press", Component: PagePress },
] as const;
