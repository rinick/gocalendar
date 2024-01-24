import * as React from "react";
import { Card, Form, Input, message as AntdMessage, TimePicker } from "antd";
import { SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import { GoEvent, GoIdEvent, User } from "./user";
import { useState } from "react";
import dayjs from "dayjs";
import { ONE_HALF_HOURS } from "./utils";

interface Props {
  user?: User;
  item: GoIdEvent;
  forceUpdate: (v: unknown) => void;
}
const format = "HH:mm";

export function CalendarItemEditor({ user, item, forceUpdate }: Props) {
  const [messageApi, contextHolder] = AntdMessage.useMessage();

  const eventGroup = item.isSelf ? user?.calendar.self : user?.calendar.reserve;
  const [message, setMessage] = useState(item.message);
  const [start, setStart] = useState(dayjs(item.start));
  const [end, setEnd] = useState(dayjs(item.end));

  const changed =
    start.valueOf() !== item.start ||
    end.valueOf() !== item.end ||
    message !== item.message;

  const readonly = !eventGroup?.[item.id];

  const saveItem = () => {
    user?.updateCalendar(
      item.isSelf,
      item.id,
      messageApi,
      start.valueOf(),
      end.valueOf(),
      message,
    );
    forceUpdate({});
  };
  const deleteItem = () => {
    user?.updateCalendar(item.isSelf, item.id, messageApi);
    forceUpdate({});
  };
  return (
    <Card
      title={
        (readonly ? "约棋" : "编辑约棋") + " " + start.format("YYYY-MM-DD")
      }
      actions={[
        readonly || !changed ? null : (
          <SaveOutlined
            disabled
            key="save"
            style={{ color: "#389e0d" }}
            onClick={saveItem}
          />
        ),
        <DeleteOutlined
          key="delete"
          style={{ color: "#f5222d" }}
          onClick={deleteItem}
        />,
      ]}
    >
      <Form
        labelCol={{ span: 6 }}
        layout="horizontal"
        style={{ maxWidth: 300 }}
      >
        <Form.Item label="开始" key="start">
          <TimePicker
            value={start}
            minuteStep={15}
            format={format}
            allowClear={false}
            showNow={false}
            onChange={(newValue) => {
              if (newValue) {
                setStart((d) =>
                  d
                    .set("minute", newValue.minute())
                    .set("hour", newValue.hour()),
                );
              }
            }}
          />
        </Form.Item>
        <Form.Item label="结束" key="end">
          <TimePicker
            value={end}
            minuteStep={15}
            format={format}
            allowClear={false}
            showNow={false}
            onChange={(newValue) => {
              if (newValue) {
                setEnd((d) =>
                  d
                    .set("minute", newValue.minute())
                    .set("hour", newValue.hour()),
                );
              }
            }}
          />
        </Form.Item>
        <Form.Item label="备注" key="message">
          <Input
            value={message}
            onChange={readonly ? undefined : (e) => setMessage(e.target.value)}
          />
        </Form.Item>
      </Form>
      {contextHolder}
    </Card>
  );
}
