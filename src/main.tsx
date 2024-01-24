import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Card, Tabs, Button, Radio } from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";
import {
  useHistory,
  useParams,
  HashRouter,
  Route,
  Switch as BrowserSwitch,
} from "react-router-dom";
import { GoIdEvent, User } from "./user";
import "./main.css";
import { ProfileForm } from "./ProfileForm";
import { generateResulTable } from "./ResultTable";
import { WeekView } from "./WeekView";
import { CalendarItemEditor } from "./CalendarItemEditor";
import {allUsers} from "./utils";



function Root() {
  const { tab } = useParams<{ tab: string | undefined }>();
  const history = useHistory();
  const [sessionName, setSessionName] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<GoIdEvent>();
  const [updateHash, setUpdateHash] = useState<unknown>();
  const forceUpdate = useCallback((v: unknown) => {
    setSelectedEvent(undefined);
    setUpdateHash(v);
  }, []);
  useMemo(() => User.init(setSessionName), []);
  const userNames = useMemo(() => {
    const pos = allUsers.indexOf(sessionName);
    if (pos >= 0) {
      const result = [...allUsers];
      result.splice(pos, 1);
      result.unshift(sessionName);
      return result;
    }
    return allUsers;
  }, [sessionName]);

  const users: Map<string, User> = useMemo(() => {
    const result = new Map<string, User>();
    for (const name of userNames) {
      const user = new User(name);
      user.load(forceUpdate);
      result.set(name, user);
    }
    User.users = result;
    return result;
  }, []);
  const currentUser = users.get(sessionName);

  const [modal, setModal] = useState<React.ReactNode>();

  const generateUserList = () => {
    const userItems: React.ReactNode[] = [];
    for (const [n, u] of users) {
      userItems.push(
        <p key={n} style={{ margin: 8 }}>
          <Radio value={n} onClick={() => setSelectedName(n)}>
            {n}
          </Radio>
          <Button
            icon={n === sessionName ? <HomeOutlined /> : <UserOutlined />}
            onClick={() => {
              setModal(
                <ProfileForm
                  name={n}
                  user={u}
                  win={currentUser?.result[n]}
                  onClose={(d, win) => {
                    if (d) {
                      u.uploadProfile(d);
                    } else {
                      currentUser?.updateResult(n, win);
                    }
                    setModal(null);
                  }}
                  readonly={n != sessionName}
                />,
              );
            }}
          />
        </p>,
      );
    }
    return userItems;
  };
  return (
    <>
      <Tabs
        // tabBarStyle={{ marginLeft: 40 }}
        animated={false}
        onChange={(key) => {
          history.push(key);
        }}
        activeKey={tab || "/"}
      >
        <Tabs.TabPane tab="日历" key="/" style={{ height: "100%" }}>
          <div className="content">
            <WeekView
              currentUser={currentUser}
              name={selectedName || sessionName}
              updateHash={updateHash}
              onSelect={setSelectedEvent}
              forceUpdate={forceUpdate}
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="对战结果" key="result">
          <div className="content">
            {tab === "result" ? generateResulTable(userNames, users) : null}
          </div>
        </Tabs.TabPane>
      </Tabs>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Card title="棋手列表" style={{ width: 300 }}>
          <Radio.Group value={selectedName || sessionName}>
            {generateUserList()}
          </Radio.Group>
        </Card>
        {selectedEvent ? (
          <CalendarItemEditor
            key={selectedEvent.id}
            item={selectedEvent}
            user={currentUser}
            forceUpdate={forceUpdate}
          />
        ) : null}
      </div>
      {modal}
    </>
  );
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
root.render(
  <HashRouter>
    <BrowserSwitch>
      <Route path="/" exact={true} component={Root} />
      <Route path="/:tab" component={Root} />
    </BrowserSwitch>
  </HashRouter>,
);
