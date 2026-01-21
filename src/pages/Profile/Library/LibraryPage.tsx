

import { Tabs } from "antd";
import { AppstoreOutlined, HeartOutlined } from "@ant-design/icons";
import CollectionsPage from "../Collections/CollectionsPage";
import FavoritesPage from "../FavoritesPage";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ProfileHeader from "../ProfileHeader";
import "../Profile/styles.less";



const LibraryPage = () => {
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
                      label: <span><AppstoreOutlined /> Bộ Sưu Tập</span>,
                      children: <CollectionsPage />
                  },
                  {
                      key: "favorites",
                      label: <span><HeartOutlined /> Yêu Thích</span>,
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
