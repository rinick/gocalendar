import * as React from "react";
import { useState } from "react";
import { Modal, Form, Input, Select } from "antd";

interface Props {
  open: boolean;
  onClose: (data?: string) => void;
}

const options = [
  { value: "野狐" },
  { value: "弈城" },
  { value: "99围棋" },
  { value: "OGS" },
  { value: "KGS" },
  { value: "Pandanet" },
  { value: "其他" },
];

export function MessageForm({ open, onClose }: Props) {
  const [data, updateData] = useState("野狐");
  const [message, setMessage] = useState("");
  return (
    <Modal
      title="选择平台"
      open={open}
      onOk={() => onClose(data === "其他" ? message : data)}
      onCancel={() => onClose()}
    >
      <Form
        labelCol={{ span: 6 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="平台" key="平台">
          <Select options={options} value={data} onChange={updateData} />
        </Form.Item>
        {data === "其他" ? (
          <Form.Item label="备注" key="备注">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
