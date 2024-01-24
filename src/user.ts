import { MessageInstance } from "antd/es/message/interface";
import { ONE_HALF_HOURS } from "./utils";

const serverUrl = window.location.host.startsWith("localhost")
  ? "http://localhost:8080"
  : "";

export interface GoEvent {
  start: number;
  end: number;
  message?: string;
}
export interface GoIdEvent extends GoEvent {
  id: string;
  isSelf: boolean;
}

export function toTime(d: Date | number) {
  if (d instanceof Date) {
    return d.getTime();
  }
  return d;
}

export class User {
  static currentUser?: string;
  static users: Map<string, User> = new Map();
  static init(callback: (data: string) => void) {
    (async () => {
      try {
        const sessionJson = await (
          await fetch(`${serverUrl}/session`, {
            credentials: "include",
          })
        ).json();
        User.currentUser = sessionJson.user;
        callback(String(User.currentUser));
      } catch (err) {}
    })();
  }

  name: string;
  profile: { [key: string]: string } = {};
  result: { [key: string]: number } = {};
  calendar: {
    self: {
      [key: string]: GoEvent;
    };
    reserve: {
      [key: string]: GoEvent;
    };
  } = { self: {}, reserve: {} };
  constructor(name: string) {
    this.name = name;
  }

  load(callback: (data?: unknown) => void) {
    (async () => {
      try {
        this.profile = await (
          await fetch(`${serverUrl}/file/proj/${this.name}/profile.json`, {
            credentials: "include",
          })
        ).json();
      } catch (err) {
        this.profile = {};
      } finally {
        callback(this.profile);
      }
    })();
    (async () => {
      try {
        this.result = await (
          await fetch(`${serverUrl}/file/proj/${this.name}/result.json`, {
            credentials: "include",
          })
        ).json();
      } catch (err) {
        this.result = {};
      } finally {
        callback(this.result);
      }
    })();
    (async () => {
      try {
        this.calendar = await (
          await fetch(`${serverUrl}/file/proj/${this.name}/calendar.json`, {
            credentials: "include",
          })
        ).json();
      } catch (err) {
        this.calendar = { self: {}, reserve: {} };
      } finally {
        callback(this.calendar);
      }
    })();
  }
  uploadProfile(data: { [key: string]: string }) {
    this.profile = data;
    fetch(
      `${serverUrl}/file?op=upload&path=${encodeURIComponent(`proj/${this.name}/profile.json`)}`,
      {
        method: "post",
        credentials: "include",
        body: JSON.stringify(data),
      },
    );
  }
  updateCalendar(
    isSelf: boolean,
    id: string,
    messageApi: MessageInstance,
    startDate?: Date | number,
    endDate?: Date | number,
    message?: string,
    test: boolean = false,
  ) {
    const calendarGroup = isSelf ? this.calendar.self : this.calendar.reserve;
    if (startDate == null || endDate == null) {
      // delete the event
      if (calendarGroup[id]) {
        delete calendarGroup[id];
      } else {
        // do not upload
        return false;
      }
    } else {
      let start = toTime(startDate);
      let end = toTime(endDate);
      if (end - start < ONE_HALF_HOURS) {
        messageApi.error("请确保每个时段至少有90分钟");
        return false;
      }
      if (isSelf) {
        if (!test) {
          for (const key of Object.keys(calendarGroup)) {
            if (key !== id) {
              const event = calendarGroup[key];
              if (event.start < end && event.end > start) {
                start = Math.min(event.start, start);
                end = Math.max(event.end, end);
                delete calendarGroup[key];
              }
            }
          }
        }
      } else {
        const targetName = id.split("-")[0];
        const targetUser = User.users.get(targetName);
        if (targetUser) {
          const targetGroup = targetUser.calendar.self;
          const availibleSlot = Object.values(targetGroup).find(
            (targetEvent) =>
              targetEvent.start <= start && targetEvent.end >= end,
          );
          if (!availibleSlot) {
            messageApi.error("请在有效的时间段约棋");
            return false;
          }
        }
      }
      if (test) {
        return true;
      }
      calendarGroup[id] = {
        start: start,
        end: end,
        message,
      };
    }
    fetch(
      `${serverUrl}/file?op=upload&path=${encodeURIComponent(`proj/${this.name}/calendar.json`)}`,
      {
        method: "post",
        credentials: "include",
        body: JSON.stringify(this.calendar),
      },
    );
    return true;
  }
  updateResult(name: string, result?: number) {
    if (result != null && result !== this.result[name]) {
      this.result[name] = result;
      fetch(
        `${serverUrl}/file?op=upload&path=${encodeURIComponent(`proj/${this.name}/result.json`)}`,
        {
          method: "post",
          credentials: "include",
          body: JSON.stringify(this.result),
        },
      );
    }
  }
}
