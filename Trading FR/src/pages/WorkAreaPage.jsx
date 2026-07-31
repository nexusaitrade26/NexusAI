import { useState, useEffect } from 'react';
import WorkAreaSubNav from '../components/layout/WorkAreaSubNav';
import PortfolioView from '../components/workarea/portfolio/PortfolioView';
import TradeView from '../components/workarea/trade/TradeView';
import JournalView from '../components/workarea/journal/JournalView';

const WorkAreaPage = ({ initialSubTab = 'trade' }) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    if (activeSubTab === 'trade') {
      document.title = 'Trade - Nexus AI';
    } else if (activeSubTab === 'portafolio') {
      document.title = 'Portafolio - Nexus AI';
    } else if (activeSubTab === 'journal') {
      document.title = 'Journal - Nexus AI';
    }
  }, [activeSubTab]);

  return (
    <div>
      {/* Sotto-navigazione dentro Area di Lavoro (Trade, Portafolio, Journal) */}
      <WorkAreaSubNav activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />

      {/* Sotto-sezioni operative */}
      {activeSubTab === 'trade' && <TradeView />}

      {activeSubTab === 'portafolio' && (
        <PortfolioView onNavigateToTrade={() => setActiveSubTab('trade')} />
      )}

      {activeSubTab === 'journal' && <JournalView />}
    </div>
  );
};

export default WorkAreaPage;
