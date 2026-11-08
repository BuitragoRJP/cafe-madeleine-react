import { motion } from 'framer-motion';

const EASE = [0.2, 0.7, 0.2, 1];

/**
 * Encabezado de cada vista. El h1 recibe el foco al navegar (data-page-title),
 * así el lector de pantalla anuncia la vista nueva.
 */
export default function PageHead({ title, children, aside, tone = 'paper' }) {
  return (
    <header className={'pagehead pagehead--' + tone}>
      <div className="wrap pagehead__inner">
        <div className="pagehead__text">
          <motion.h1
            className="pagehead__title"
            tabIndex={-1}
            data-page-title
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {title}
          </motion.h1>
          {children && (
            <motion.div
              className="pagehead__intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              {children}
            </motion.div>
          )}
        </div>
        {aside && <div className="pagehead__aside">{aside}</div>}
      </div>
    </header>
  );
}
