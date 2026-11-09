"use client";

import ToasterPopUp from "./ToasterPopUp";
import DeskDrawer from "./DeskDrawer";
import WallLightSwitch from "./WallLightSwitch";
import InkStampPad from "./InkStampPad";
import LetterboxSlot from "./LetterboxSlot";
import KettleLid from "./KettleLid";
import ThermostatSlider from "./ThermostatSlider";
import CashRegisterTill from "./CashRegisterTill";
import MicrowaveDoor from "./MicrowaveDoor";
import PrinterPaperTray from "./PrinterPaperTray";
import WallSafeDoor from "./WallSafeDoor";
import FlipPhoneClamshell from "./FlipPhoneClamshell";
import DeskLampTelescope from "./DeskLampTelescope";
import SoapDispenserPump from "./SoapDispenserPump";
import VendingSnackDrop from "./VendingSnackDrop";
import RemoteButtonPad from "./RemoteButtonPad";
import PianoKeyRow from "./PianoKeyRow";
import TrashCanPedal from "./TrashCanPedal";

export {
  ToasterPopUp,
  DeskDrawer,
  WallLightSwitch,
  InkStampPad,
  LetterboxSlot,
  KettleLid,
  ThermostatSlider,
  CashRegisterTill,
  MicrowaveDoor,
  PrinterPaperTray,
  WallSafeDoor,
  FlipPhoneClamshell,
  DeskLampTelescope,
  SoapDispenserPump,
  VendingSnackDrop,
  RemoteButtonPad,
  PianoKeyRow,
  TrashCanPedal,
};

export const HOME = [
  { title: "Toaster pop-up", Component: ToasterPopUp },
  { title: "Desk drawer", Component: DeskDrawer },
  { title: "Wall light switch", Component: WallLightSwitch },
  { title: "Ink stamp pad", Component: InkStampPad },
  { title: "Letter slot", Component: LetterboxSlot },
  { title: "Kettle lid", Component: KettleLid },
  { title: "Thermostat slider", Component: ThermostatSlider },
  { title: "Cash till", Component: CashRegisterTill },
  { title: "Microwave door", Component: MicrowaveDoor },
  { title: "Printer tray", Component: PrinterPaperTray },
  { title: "Wall safe", Component: WallSafeDoor },
  { title: "Flip phone", Component: FlipPhoneClamshell },
  { title: "Desk lamp arm", Component: DeskLampTelescope },
  { title: "Soap pump", Component: SoapDispenserPump },
  { title: "Vending drop", Component: VendingSnackDrop },
  { title: "TV remote", Component: RemoteButtonPad },
  { title: "Piano keys", Component: PianoKeyRow },
  { title: "Pedal trash can", Component: TrashCanPedal },
] as const;
