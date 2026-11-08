import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { getStatus, todayKey } from './lib/schedule.js';
import { useMinute } from './lib/hooks.js';
import { ROUTES, useHashRoute } from './lib/router.js';
import { TableProvider } from './lib/table.jsx';
import DoorIntro, { shouldShowDoor } from './components/DoorIntro.jsx';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import TableDrawer from './components/TableDrawer.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import MenuPage from './pages/MenuPage.jsx';
import PastryPage from './pages/PastryPage.jsx';
import GardenPage from './pages/GardenPage.jsx';
import AgendaPage from './pages/AgendaPage.jsx';
import ReservePage from './pages/ReservePage.jsx';
import VisitPage from './pages/VisitPage.jsx';

const page = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }
};

export default function App() {
  // El reloj cambia cada minuto; las vistas que solo dependen del día reciben `today` (YYYY-MM-DD, estable)
  const now = useMinute();
  const status = useMemo(() => getStatus(now), [now]);
  const today = todayKey(0, now);
  const { path, query } = useHashRoute();

  // La puerta se muestra una vez por sesión; el hero espera a que empiece a abrirse
  const [showDoor] = useState(shouldShowDoor);
  const [heroReady, setHeroReady] = useState(!showDoor);
  const [doorGone, setDoorGone] = useState(!showDoor);
  const [tableOpen, setTableOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    document.title = ROUTES.find((r) => r.path === path).title;
  }, [path]);

  // Tras la salida de la vista anterior (solo ocurre al navegar), la nueva empieza arriba
  // y su título recibe el foco para que el lector de pantalla la anuncie
  const onExitComplete = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => mainRef.current?.querySelector('[data-page-title]')?.focus({ preventScroll: true }));
  };

  const skip = (e) => {
    e.preventDefault();
    mainRef.current?.focus();
  };

  const props = { status, now, today, query };
  const view = {
    '/': <Home {...props} ready={heroReady} />,
    '/carta': <MenuPage {...props} />,
    '/pasteleria': <PastryPage />,
    '/jardin': <GardenPage />,
    '/agenda': <AgendaPage today={today} />,
    '/visitanos': <VisitPage {...props} />,
    '/reservar': <ReservePage {...props} />
  }[path];

  return (
    <MotionConfig reducedMotion="user">
      <TableProvider>
        <a className="skip-link" href="#contenido" onClick={skip}>Saltar al contenido</a>
        {!doorGone && <DoorIntro onOpenStart={() => setHeroReady(true)} onDone={() => setDoorGone(true)} />}
        <Header path={path} onOpenTable={() => setTableOpen(true)} />
        <main id="contenido" ref={mainRef} tabIndex={-1} className={'view view--' + (path.slice(1) || 'inicio')}>
          <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
            <motion.div key={path} variants={page} initial="initial" animate="animate" exit="exit">
              {view}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <BottomNav path={path} />
        <TableDrawer open={tableOpen} onClose={() => setTableOpen(false)} />
      </TableProvider>
    </MotionConfig>
  );
}
