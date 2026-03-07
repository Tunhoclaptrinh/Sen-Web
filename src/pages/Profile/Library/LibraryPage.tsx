

import { Tabs } from "antd";
import { AppstoreOutlined, HeartOutlined, HistoryOutlined } from "@ant-design/icons";
import CollectionsPage from "../Collections/CollectionsPage";
import FavoritesPage from "../FavoritesPage";
import ScanHistoryTab from "./components/ScanHistoryTab";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ProfileHeader from "../ProfileHeader";
import { useTranslation } from "react-i18next";
import "../Profile/styles.less";



const LibraryPage = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'profile' });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "collections";
  const { user } = useSelector((state: RootState) => state.auth);

  const onTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  return (
    <div className="library-page profile-page">
      <ProfileHeader user={user} activeTab="library" showTabs={true} />

      <div className="profile-content">
        <div className="profile-container">
          <Tabs
            activeKey={activeTab}
            onChange={onTabChange}
            size="large"
            type="card"
            items={[
              {
                key: "collections",
                label: <span><AppstoreOutlined /> {t("library.collections")}</span>,
                children: <CollectionsPage />
              },
              {
                key: "history",
                label: <span><HistoryOutlined /> {t("library.treasureHunt")}</span>,
                children: <ScanHistoryTab />
              },
              {
                key: "favorites",
                label: <span><HeartOutlined /> {t("library.favorites")}</span>,
                children: <FavoritesPage />
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
