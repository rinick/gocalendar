import * as React from "react";
import { useState } from "react";
import { Modal, Form, Input, Radio } from "antd";
import { User } from "./user";

interface Props {
  name: string;
  user: User;
  onClose: (data?: { [key: string]: string }, win?: number) => void;
  readonly: boolean;
  win?: number;
}
const keys = [
  "姓名",
  "家长微信群昵称",
  "野狐账号",
  "弈城账号",
  "99围棋账号",
  "OGS账号",
  "KGS账号",
  "Pandanet账号",
  "备注",
];

export function ProfileForm({ name, user, onClose, readonly, win }: Props) {
  const [data, updateData] = useState({ ...user.profile });
  const [newResult, setResult] = useState(win ?? 0);

  return (
    <Modal
      title={`${name}的资料`}
      open
      onOk={
        readonly ? () => onClose(undefined, newResult) : () => onClose(data)
      }
      onCancel={() => onClose()}
    >
      <Form
        labelCol={{ span: 6 }}

        layout="horizontal"
        style={{ maxWidth: 600 }}
      >
        {keys.map((key) => (
          <Form.Item label={key} key={key}>
            <Input
              value={data[key] ?? ""}
              onChange={
                readonly
                  ? undefined
                  : (e) =>
                      updateData((old) => ({ ...old, [key]: e.target.value }))
              }
            />
          </Form.Item>
        ))}
        {readonly ? (
          <Form.Item label="提交成绩">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              value={newResult}
              onChange={(e) => setResult(e.target.value)}
            >
              <Radio value={1}>我胜</Radio>
              <Radio value={0}> - </Radio>
              <Radio value={-1}>{`${name}胜`}</Radio>
            </Radio.Group>
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
