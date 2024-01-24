import * as React from "react";
import { User } from "./user";
import { Table } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { ColumnType } from "antd/lib/table/interface";

const CHECK = <CheckCircleOutlined />;
const CROSS = <CloseCircleOutlined />;

function compareResult(v1?: number, v2?: number): [number, string] {
  const n1 = Number(v1);
  const n2 = Number(v2);
  if (n1 * n2 < 0) {
    return [n1, ""];
  }
  if (n1 * n2 > 0) {
    return [n1, "?"];
  }
  return [n1 || -n2 || 0, ""];
}

export function generateResulTable(names: string[], users: Map<string, User>) {
  // eslint-disable-next-line
  const columns: ColumnType<any>[] = [
    {
      title: "棋手",
      dataIndex: "name",
      key: "name",
      align: "right",
    },
  ];
  const data: {
    [key: string]: React.ReactNode;
    name: string;
    score: number;
  }[] = [];
  for (const name of names) {
    let winCount = 0;
    let loseCount = 0;
    const row: {
      [key: string]: React.ReactNode;
      name: string;
      score: number;
    } = { name, score: 0 };
    for (const other of names) {
      if (other === name) {
        row[name] = "-";
      } else {
        const [r, add] = compareResult(
          users.get(name)?.result[other],
          users.get(other)?.result[name],
        );
        if (r > 0) {
          winCount++;
          row[other] = (
            <span className="green">
              {CHECK}
              {add}
            </span>
          );
        }
        if (r < 0) {
          loseCount++;
          row[other] = (
            <span className="red">
              {CROSS}
              {add}
            </span>
          );
        }
      }
    }
    row.summary = `${winCount} 胜  ${loseCount} 负`;
    row.score = winCount - loseCount;
    data.push(row);
  }
  data.sort((a, b) => b.score - a.score);

  for (const row of data) {
    const { name } = row;
    columns.push({
      title: name,
      dataIndex: name,
      key: name,
      align: "center",
      width: 60,
    });
  }

  columns.push({
    title: "总成绩",
    dataIndex: "summary",
    key: "summary",
    align: "left",
  });

  return <Table columns={columns} dataSource={data}></Table>;
}
