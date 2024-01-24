import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh.js";
import { message } from "antd";
import {
  Calendar,
  Views,
  dayjsLocalizer,
  Event,
  SlotInfo,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { GoIdEvent, User } from "./user";
import { FIFTEEN_MINUTES } from "./utils";
import { MessageForm } from "./MessageForm";

const djLocalizer = dayjsLocalizer(dayjs);

const messages = {
  previous: "上一周",
  next: "下一周",
  today: "现在",
};

interface WEvent extends Event {
  id: string;
  isSelf: boolean;
}

interface Props {
  name: string;
  currentUser?: User;
  updateHash: unknown;
  onSelect: (e?: GoIdEvent) => void;
  forceUpdate: (value: unknown) => void;
}

export function WeekView({
  name,
  currentUser,
  updateHash,
  onSelect,
  forceUpdate,
}: Props) {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectingSlot, setSelectingSlot] = useState<SlotInfo | undefined>();

  const selectedUser = useMemo(() => User.users.get(name), [name]);
  const onSelectSlot = (slot: SlotInfo) => {
    const time = slot.end.getTime() - slot.start.getTime();
    if (time <= FIFTEEN_MINUTES) {
      onSelect(undefined);
      return;
    }
    if (currentUser?.name === name) {
      // Self time range
      const id = `${new Date().getTime()}-${currentUser.name}`;
      if (
        currentUser.updateCalendar(
          true,
          id,
          messageApi,
          slot.start,
          slot.end,
          "可选时间",
        )
      ) {
        onSelect({
          ...currentUser.calendar.self[id],
          id: id,
          isSelf: true,
        });
        forceUpdate({});
      }
    } else {
      // Book event
      const id = `${name}-${currentUser?.name}`;
      if (
        currentUser?.updateCalendar(
          false,
          id,
          messageApi,
          slot.start,
          slot.end,
          "平台",
          true,
        )
      ) {
        setSelectingSlot(slot);
      }
    }
  };
  const onCloseDialog = (str?: string) => {
    if (str != null && selectingSlot) {
      const id = `${name}-${currentUser?.name}`;
      if (
        currentUser?.updateCalendar(
          false,
          id,
          messageApi,
          selectingSlot.start,
          selectingSlot.end,
          str,
        )
      ) {
        onSelect({
          ...currentUser.calendar.reserve[id],
          id,
          isSelf: false,
        });
        forceUpdate({});
      }
    }
    setSelectingSlot(undefined);
  };

  const { backEvents, events } = useMemo(() => {
    const backEvents: WEvent[] = [];
    const events: WEvent[] = [];
    if (selectedUser) {
      for (const id of Object.keys(selectedUser.calendar.self)) {
        const item = selectedUser.calendar.self[id];
        backEvents.push({
          id,
          isSelf: true,
          start: new Date(item.start),
          end: new Date(item.end),
          title: item.message,
        });
      }
      for (const [, user] of User.users) {
        if (user !== selectedUser) {
          const id = `${selectedUser!.name}-${user.name}`;
          const item = user.calendar.reserve[id];
          if (item) {
            events.push({
              id,
              isSelf: false,
              start: new Date(item.start),
              end: new Date(item.end),
              title: `对局：${user.name}\n平台：${item.message}`,
            });
          }
        }
      }
    }

    return { backEvents, events };
  }, [selectedUser, updateHash]);

  return (
    <div style={{ position: "absolute", width: "100%", height: "100%" }}>
      {contextHolder}
      <Calendar
        localizer={djLocalizer}
        culture="zh"
        messages={messages}
        views={{ week: true }}
        defaultView={Views.WEEK}
        backgroundEvents={backEvents}
        events={events}
        step={15}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={(e: WEvent) => {
          onSelect({
            ...(e.isSelf
              ? currentUser!.calendar.self[e.id]
              : currentUser!.calendar.reserve[e.id]),
            id: e.id,
            isSelf: e.isSelf,
          });
        }}
      />
      <MessageForm onClose={onCloseDialog} open={selectingSlot != null} />
    </div>
  );
}
