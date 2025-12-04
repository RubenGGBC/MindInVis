import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import MapGrid from '../components/MapGrid/MapGrid';
import RecentMaps from '../components/RecentMaps/RecentMaps';

const Home = ({ userName }) => {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Header userName={userName} />
        <div className="content-wrapper">
          <MapGrid />
          <RecentMaps />
        </div>
      </main>
    </div>
  );
};

export default Home;
