import quip from "quip-apps-api";
import { QUIP_AUTH_NAME } from "../config";

export enum ViewSize {
  Auto = "AUTO",
  Desktop = "DESKTOP",
  Tablet = "TABLET",
  Mobile = "MOBILE",
}

const tableauAuth = quip.apps.auth(QUIP_AUTH_NAME) as quip.apps.OAuth2;
